import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const featuredSchema = z.object({ isFeatured: z.boolean() });

/**
 * PATCH /api/admin/products/[id]
 * Toggle whether a catalog product appears in the homepage
 * "รายการสินค้าแนะนำ" section (Admin only).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isFeatured } = featuredSchema.parse(await request.json());

    const product = await prisma.product.update({
      where: { id },
      data: { isFeatured },
      select: { id: true, isFeatured: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
