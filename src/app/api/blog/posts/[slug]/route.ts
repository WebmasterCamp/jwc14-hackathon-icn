import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlogPostBySlug, updateBlogPost, deleteBlogPost } from "@/lib/blog/queries";
import { blogPostSchema } from "@/lib/validations/blog";

/**
 * GET /api/blog/posts/[slug]
 * Get single blog post by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user can view unpublished posts
    const session = await auth();
    const canViewUnpublished =
      session?.user?.role === "ADMIN" ||
      (session?.user?.id === post.authorId);

    if (post.status !== "PUBLISHED" && !canViewUnpublished) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/blog/posts/[slug]
 * Update a blog post
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check permissions: admin or post author
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = session.user.id === post.authorId;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "You don't have permission to edit this post" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = blogPostSchema.partial().parse(body);

    const updatedPost = await updateBlogPost(post.id, {
      ...validatedData,
      scheduledFor: validatedData.scheduledFor
        ? new Date(validatedData.scheduledFor)
        : undefined,
    });

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error("Error updating blog post:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/posts/[slug]
 * Delete a blog post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await getBlogPostBySlug(params.slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check permissions: admin or post author
    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = session.user.id === post.authorId;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "You don't have permission to delete this post" },
        { status: 403 }
      );
    }

    await deleteBlogPost(post.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
