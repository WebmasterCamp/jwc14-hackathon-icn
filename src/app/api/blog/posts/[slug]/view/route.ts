import { NextRequest, NextResponse } from "next/server";
import { incrementViewCount } from "@/lib/blog/queries";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/blog/posts/[slug]/view
 * Increment view count for a blog post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await incrementViewCount(post.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
