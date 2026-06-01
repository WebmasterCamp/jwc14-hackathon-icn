import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlogCategories } from "@/lib/blog/queries";
import { blogCategorySchema } from "@/lib/validations/blog";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/seo";

/**
 * GET /api/blog/categories
 * Get all blog categories
 */
export async function GET() {
  try {
    const categories = await getBlogCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/categories
 * Create a new category (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = blogCategorySchema.parse(body);

    const slug = generateSlug(validatedData.nameTh || validatedData.name);

    const category = await prisma.blogCategory.create({
      data: {
        ...validatedData,
        slug,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
