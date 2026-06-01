import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceTierUpdateSchema } from "@/lib/validations/pricing";
import { ZodError } from "zod";

interface RouteParams {
  params: Promise<{ id: string; tierId: string }>;
}

// PATCH /api/admin/products/[id]/price-tiers/[tierId] — edit a tier (Admin only).
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, tierId } = await params;
    const existing = await prisma.productPriceTier.findUnique({
      where: { id: tierId },
    });
    if (!existing || existing.productId !== id) {
      return NextResponse.json({ error: "ไม่พบขั้นส่วนลด" }, { status: 404 });
    }

    const data = priceTierUpdateSchema.parse(await request.json());

    const tier = await prisma.productPriceTier.update({
      where: { id: tierId },
      data: {
        minMonths: data.minMonths,
        maxMonths: data.maxMonths ?? null,
        discountPercent: data.discountPercent,
      },
    });

    return NextResponse.json(tier);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    console.error("Error updating price tier:", error);
    return NextResponse.json(
      { error: "Failed to update price tier" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]/price-tiers/[tierId] — remove a tier (Admin only).
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, tierId } = await params;
    const existing = await prisma.productPriceTier.findUnique({
      where: { id: tierId },
    });
    if (!existing || existing.productId !== id) {
      return NextResponse.json({ error: "ไม่พบขั้นส่วนลด" }, { status: 404 });
    }

    await prisma.productPriceTier.delete({ where: { id: tierId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting price tier:", error);
    return NextResponse.json(
      { error: "Failed to delete price tier" },
      { status: 500 }
    );
  }
}
