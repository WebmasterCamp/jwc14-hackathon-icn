import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ensureCustomerProfile } from "@/lib/queries";
import { uploadFile, generateFileKey } from "@/lib/r2";
import { sendEmail } from "@/lib/email";
import { calcRentalTotal, type DurationUnit } from "@/lib/quote-cart";
import { QuotationPdf } from "@/components/documents/quotation-pdf";

// react-pdf + R2 need the Node runtime (not edge).
export const runtime = "nodejs";

const QUOTE_VALID_DAYS = 14;

const bodySchema = z.object({
  contact: z.object({
    contactName: z.string().trim().min(1).max(200),
    contactEmail: z.string().trim().email().max(200),
    contactPhone: z.string().trim().min(1).max(40),
    organization: z.string().trim().max(200).optional().default(""),
    billingAddress: z.string().trim().min(1).max(500),
    notes: z.string().trim().max(2000).optional().default(""),
  }),
  items: z
    .array(
      z.object({
        equipmentId: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
        durationAmount: z.number().int().min(1).max(120),
        durationUnit: z.enum(["day", "month", "year"]),
      })
    )
    .min(1)
    .max(30),
});

async function createQuoteNumberWithRetry(
  data: Omit<Prisma.QuotationUncheckedCreateInput, "quoteNumber">
) {
  const year = new Date().getFullYear();
  // Best-effort sequence; the @unique constraint + retry guard against races.
  let seq = (await prisma.quotation.count()) + 1;
  for (let attempt = 0; attempt < 5; attempt++) {
    const quoteNumber = `QT-${year}-${String(seq).padStart(5, "0")}`;
    try {
      return await prisma.quotation.create({
        data: { ...data, quoteNumber },
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        seq += 1;
        continue;
      }
      throw error;
    }
  }
  throw new Error("ไม่สามารถสร้างเลขที่ใบเสนอราคาได้");
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "USER") {
    return NextResponse.json(
      { error: "เฉพาะบัญชีผู้เช่าเท่านั้นที่ออกใบเสนอราคาได้" },
      { status: 403 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ข้อมูลไม่ถูกต้อง", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { contact, items } = parsed.data;

  const customer = await ensureCustomerProfile(
    session.user.id,
    session.user.name
  );

  // Refetch offerings from the DB — never trust client-sent prices. Only
  // active offerings from verified providers count.
  const ids = [...new Set(items.map((i) => i.equipmentId))];
  const offerings = await prisma.equipment.findMany({
    where: { id: { in: ids }, isActive: true, provider: { verified: true } },
    include: {
      product: { select: { name: true, nameTh: true } },
      provider: {
        select: {
          id: true,
          userId: true,
          companyName: true,
          taxId: true,
          address: true,
          province: true,
          user: { select: { email: true } },
        },
      },
    },
  });
  const byId = new Map(offerings.map((o) => [o.id, o]));

  // Group valid request items by provider.
  const groups = new Map<
    string,
    {
      provider: (typeof offerings)[number]["provider"];
      lines: {
        equipmentId: string;
        name: string;
        nameTh: string | null;
        quantity: number;
        durationAmount: number;
        durationUnit: DurationUnit;
        rentPriceMonthly: number;
        depositAmount: number;
        subtotal: number;
      }[];
    }
  >();

  for (const item of items) {
    const offering = byId.get(item.equipmentId);
    if (!offering) continue; // dropped: inactive / unverified / unknown
    const subtotal = calcRentalTotal({
      rentPriceMonthly: offering.rentPriceMonthly,
      quantity: item.quantity,
      durationAmount: item.durationAmount,
      durationUnit: item.durationUnit,
    });
    const group = groups.get(offering.provider.id) ?? {
      provider: offering.provider,
      lines: [],
    };
    group.lines.push({
      equipmentId: offering.id,
      name: offering.product.name,
      nameTh: offering.product.nameTh,
      quantity: item.quantity,
      durationAmount: item.durationAmount,
      durationUnit: item.durationUnit,
      rentPriceMonthly: offering.rentPriceMonthly,
      depositAmount: offering.depositAmount,
      subtotal,
    });
    groups.set(offering.provider.id, group);
  }

  if (groups.size === 0) {
    return NextResponse.json(
      { error: "ไม่พบอุปกรณ์ที่พร้อมให้เช่าในรายการ" },
      { status: 400 }
    );
  }

  const now = new Date();
  const validUntil = new Date(now.getTime() + QUOTE_VALID_DAYS * 86400000);
  const issued: { quoteNumber: string; providerName: string; pdfUrl: string | null }[] =
    [];

  for (const { provider, lines } of groups.values()) {
    const rentalTotal = lines.reduce((s, l) => s + l.subtotal, 0);
    const depositTotal = lines.reduce(
      (s, l) => s + l.depositAmount * l.quantity,
      0
    );
    const total = rentalTotal + depositTotal;

    // Persist quotation + items.
    const quotation = await createQuoteNumberWithRetry({
      providerId: provider.id,
      customerId: customer.id,
      status: "SENT",
      contactName: contact.contactName,
      contactEmail: contact.contactEmail,
      contactPhone: contact.contactPhone,
      organization: contact.organization || null,
      billingAddress: contact.billingAddress,
      notes: contact.notes || null,
      rentalTotal,
      depositTotal,
      total,
      validUntil,
      items: {
        create: lines.map((l) => ({
          equipmentId: l.equipmentId,
          name: l.name,
          nameTh: l.nameTh,
          quantity: l.quantity,
          durationAmount: l.durationAmount,
          durationUnit: l.durationUnit,
          rentPriceMonthly: l.rentPriceMonthly,
          depositAmount: l.depositAmount,
          subtotal: l.subtotal,
        })),
      },
    });

    // Generate the PDF, upload to R2, store the url. PDF failure must not lose
    // the saved quotation — log and continue with a null pdfUrl.
    let pdfUrl: string | null = null;
    try {
      const pdfElement = createElement(QuotationPdf, {
        quoteNumber: quotation.quoteNumber,
        createdAt: quotation.createdAt,
        validUntil,
        provider: {
          companyName: provider.companyName,
          taxId: provider.taxId,
          address: provider.address,
          province: provider.province,
        },
        contact: {
          contactName: contact.contactName,
          contactEmail: contact.contactEmail,
          contactPhone: contact.contactPhone,
          organization: contact.organization,
          billingAddress: contact.billingAddress,
        },
        items: lines,
        rentalTotal,
        depositTotal,
        total,
        notes: contact.notes || null,
      }) as unknown as ReactElement<DocumentProps>;
      const buffer = await renderToBuffer(pdfElement);
      const key = generateFileKey(
        "quotations",
        `${quotation.quoteNumber}.pdf`,
        session.user.id
      );
      pdfUrl = await uploadFile(key, buffer, "application/pdf");
      await prisma.quotation.update({
        where: { id: quotation.id },
        data: { pdfUrl },
      });
    } catch (error) {
      console.error("Quotation PDF generation failed:", error);
    }

    // Notify the provider in-app.
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        type: "QUOTATION_RECEIVED",
        title: "มีคำขอใบเสนอราคาใหม่",
        message: `${contact.organization || contact.contactName} ขอใบเสนอราคา ${quotation.quoteNumber}`,
        data: { quotationId: quotation.id },
      },
    });

    // Email the provider (best-effort).
    if (provider.user?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      void sendEmail({
        to: provider.user.email,
        subject: `ใบเสนอราคาใหม่ ${quotation.quoteNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>มีคำขอใบเสนอราคาใหม่</h2>
            <p>เลขที่ <strong>${quotation.quoteNumber}</strong> จาก ${contact.organization || contact.contactName}</p>
            <p>ยอดรวมประมาณการ: <strong>${total.toLocaleString("th-TH")} บาท</strong></p>
            <p><a href="${appUrl}/dashboard/provider/quotations/${quotation.id}">ดูรายละเอียดในแดชบอร์ด</a></p>
          </div>
        `,
      });
    }

    issued.push({
      quoteNumber: quotation.quoteNumber,
      providerName: provider.companyName,
      pdfUrl,
    });
  }

  return NextResponse.json({ quotations: issued }, { status: 201 });
}
