import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlogTags } from "@/lib/blog/queries";
import { blogTagSchema } from "@/lib/validations/blog";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/seo";

/**
 * GET /api/blog/tags
 * Get all blog tags
 */
export async function GET() {
  try {
    const tags = await getBlogTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/tags
 * Create a new tag (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = blogTagSchema.parse(body);

    const slug = generateSlug(validatedData.nameTh || validatedData.name);

    const tag = await prisma.blogTag.create({
      data: {
        ...validatedData,
        slug,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tag:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
