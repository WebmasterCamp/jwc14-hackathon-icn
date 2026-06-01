import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/seo";
import { categoryUpdateSchema } from "@/lib/validations/category";

/**
 * PATCH /api/admin/categories/[id]
 * Update an equipment category (Admin only). Regenerates the slug when the
 * English name changes.
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
    const body = await request.json();
    const data = categoryUpdateSchema.parse(body);

    let slug: string | undefined;
    if (data.name) {
      const existing = await prisma.category.findUnique({ where: { id } });
      if (existing && existing.name !== data.name) {
        const base = generateSlug(data.name) || "category";
        slug = base;
        let n = 1;
        // Keep the current row's slug if unchanged base resolves to itself.
        while (true) {
          const clash = await prisma.category.findUnique({ where: { slug } });
          if (!clash || clash.id === id) break;
          slug = `${base}-${n++}`;
        }
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: { ...data, ...(slug && { slug }) },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating category:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete an equipment category (Admin only). Products/equipment reference a
 * category via a required FK, so categories that still contain products cannot
 * be deleted — the client is told to move/remove those products first.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `ไม่สามารถลบได้: มีสินค้า ${productCount} รายการในหมวดนี้ ย้ายหรือลบสินค้าก่อน`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
