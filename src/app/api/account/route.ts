import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  accountSchema,
  providerProfileSchema,
  customerProfileSchema,
} from "@/lib/validations/profile";

// Convert "" to null for optional string fields so the DB stores clean values.
const nn = (v: string | undefined | null) => (v ? v : null);

// PATCH /api/account - Update the signed-in user's own profile (role-scoped).
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;
    const body = await request.json();

    if (role === "ADMIN") {
      const parsed = providerProfileSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
          { status: 400 }
        );
      }
      const d = parsed.data;
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { name: d.name, phone: nn(d.phone) },
        }),
        prisma.provider.update({
          where: { userId },
          data: {
            companyName: d.companyName,
            taxId: nn(d.taxId),
            address: nn(d.address),
            province: nn(d.province),
            bankName: nn(d.bankName),
            bankAccount: nn(d.bankAccount),
            description: nn(d.description),
          },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    if (role === "USER") {
      const parsed = customerProfileSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
          { status: 400 }
        );
      }
      const d = parsed.data;
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { name: d.name, phone: nn(d.phone) },
        }),
        // upsert so a customer without a profile row is self-healed
        prisma.customer.upsert({
          where: { userId },
          update: {
            schoolName: d.schoolName,
            schoolType: d.schoolType,
            address: nn(d.address),
            province: nn(d.province),
            studentCount: d.studentCount ?? null,
            budget: d.budget ?? null,
          },
          create: {
            userId,
            schoolName: d.schoolName,
            schoolType: d.schoolType,
            address: nn(d.address),
            province: nn(d.province),
            studentCount: d.studentCount ?? null,
            budget: d.budget ?? null,
          },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    // ADMIN (or any other role): only the account-level fields apply.
    const parsed = accountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    await prisma.user.update({
      where: { id: userId },
      data: { name: parsed.data.name, phone: nn(parsed.data.phone) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}
