import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBlogPosts, createBlogPost } from "@/lib/blog/queries";
import { blogPostSchema, blogSearchSchema } from "@/lib/validations/blog";

/**
 * GET /api/blog/posts
 * Get paginated blog posts with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = blogSearchSchema.parse({
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      authorId: searchParams.get("authorId") || undefined,
      status: searchParams.get("status") || "PUBLISHED",
      isFeatured: searchParams.get("isFeatured") === "true" ? true : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
      sortBy: (searchParams.get("sortBy") as any) || "publishedAt",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    });

    const result = await getBlogPosts(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/posts
 * Create a new blog post (Admin or verified Provider only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or verified provider
    const isAdmin = session.user.role === "ADMIN";
    let isVerifiedProvider = false;

    if (session.user.role === "ADMIN") {
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });
      isVerifiedProvider = provider?.verified || false;
    }

    if (!isAdmin && !isVerifiedProvider) {
      return NextResponse.json(
        { error: "Only admins and verified providers can create blog posts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = blogPostSchema.parse(body);

    const post = await createBlogPost({
      ...validatedData,
      authorId: session.user.id,
      authorType: isAdmin ? "USER" : "PROVIDER",
      scheduledFor: validatedData.scheduledFor
        ? new Date(validatedData.scheduledFor)
        : undefined,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error("Error creating blog post:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
