import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceTierCreateSchema } from "@/lib/validations/pricing";
import { ZodError } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/products/[id]/price-tiers — list a product's discount tiers.
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const tiers = await prisma.productPriceTier.findMany({
    where: { productId: id },
    orderBy: { minMonths: "asc" },
  });
  return NextResponse.json(tiers);
}

// POST /api/admin/products/[id]/price-tiers — add a discount tier (Admin only).
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
    }

    const data = priceTierCreateSchema.parse(await request.json());

    const tier = await prisma.productPriceTier.create({
      data: {
        productId: id,
        minMonths: data.minMonths,
        maxMonths: data.maxMonths ?? null,
        discountPercent: data.discountPercent,
      },
    });

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    console.error("Error creating price tier:", error);
    return NextResponse.json(
      { error: "Failed to create price tier" },
      { status: 500 }
    );
  }
}
