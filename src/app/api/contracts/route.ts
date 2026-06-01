import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { applyDurationDiscount, findDurationDiscount } from "@/lib/pricing";

// GET /api/contracts - List contracts
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let where: Record<string, unknown> = {};

    // Scope results to the caller's own records. If the profile row is missing
    // (e.g. an OAuth user that has no Customer/Provider row yet), the id would be
    // `undefined` and Prisma would drop the filter entirely, leaking ALL tenants'
    // data. Guard against that by returning an empty result instead.
    const emptyResult = NextResponse.json({
      contracts: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });

    if (session.user.role === "ADMIN") {
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });
      if (!provider) return emptyResult;
      where = { providerId: provider.id };
    } else if (session.user.role === "USER") {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      if (!customer) return emptyResult;
      where = { customerId: customer.id };
    }

    if (status) {
      where = { ...where, status };
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          provider: true,
          customer: true,
          items: {
            include: {
              equipment: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

const createContractSchema = z.object({
  customerId: z.string(),
  type: z.enum(["RENT", "LEASE_TO_OWN"]),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  items: z.array(
    z.object({
      equipmentId: z.string(),
      quantity: z.number().int().positive(),
      pricePerMonth: z.number().positive(),
    })
  ),
  notes: z.string().optional(),
});

// POST /api/contracts - Create new contract (Provider only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider || !provider.verified) {
      return NextResponse.json(
        { error: "Provider not found or not verified" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = createContractSchema.parse(body);

    // Ensure the target customer actually exists before creating a contract for
    // them (the id comes straight from the request body).
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Contract duration in months drives the per-product duration discount.
    const months = Math.ceil(
      (data.endDate.getTime() - data.startDate.getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );

    // Fetch each offering with its product's discount tiers (also used for deposit).
    const equipmentIds = data.items.map((item) => item.equipmentId);
    const equipment = await prisma.equipment.findMany({
      where: { id: { in: equipmentIds } },
      include: { product: { include: { priceTiers: true } } },
    });

    // Apply the duration discount to each line's monthly price.
    const lines = data.items.map((item) => {
      const eq = equipment.find((e) => e.id === item.equipmentId);
      const tiers = eq?.product.priceTiers ?? [];
      const discountedPerMonth = applyDurationDiscount(
        item.pricePerMonth,
        months,
        tiers
      );
      return {
        equipmentId: item.equipmentId,
        quantity: item.quantity,
        pricePerMonth: discountedPerMonth,
        subtotal: discountedPerMonth * item.quantity,
        discountPercent: findDurationDiscount(months, tiers),
        deposit: (eq?.depositAmount || 0) * item.quantity,
      };
    });

    const monthlyAmount = lines.reduce((sum, l) => sum + l.subtotal, 0);
    const totalAmount = monthlyAmount * months;
    const depositAmount = lines.reduce((sum, l) => sum + l.deposit, 0);

    // Generate contract number
    const count = await prisma.contract.count();
    const contractNumber = `EDU-${new Date().getFullYear()}-${String(
      count + 1
    ).padStart(6, "0")}`;

    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        providerId: provider.id,
        customerId: data.customerId,
        type: data.type,
        status: "DRAFT",
        startDate: data.startDate,
        endDate: data.endDate,
        totalAmount,
        depositAmount,
        monthlyAmount,
        notes: data.notes,
        items: {
          create: lines.map((l) => ({
            equipmentId: l.equipmentId,
            quantity: l.quantity,
            pricePerMonth: l.pricePerMonth,
            subtotal: l.subtotal,
            discountPercent: l.discountPercent,
          })),
        },
      },
      include: {
        provider: true,
        customer: true,
        items: {
          include: {
            equipment: true,
          },
        },
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
