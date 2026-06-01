import { NextRequest, NextResponse } from "next/server";
import { getRelatedPosts } from "@/lib/blog/queries";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/blog/posts/[slug]/related
 * Get related blog posts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "3");
    const relatedPosts = await getRelatedPosts(post.id, limit);

    return NextResponse.json(relatedPosts);
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch related posts" },
      { status: 500 }
    );
  }
}
