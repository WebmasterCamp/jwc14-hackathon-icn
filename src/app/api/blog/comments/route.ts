import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { blogCommentSchema } from "@/lib/validations/blog";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/blog/comments
 * Create a new comment (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = blogCommentSchema.parse(body);

    // Verify post exists
    const post = await prisma.blogPost.findUnique({
      where: { id: validatedData.postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify parent comment exists if replying
    if (validatedData.parentId) {
      const parentComment = await prisma.blogComment.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.blogComment.create({
      data: {
        postId: validatedData.postId,
        authorId: session.user.id,
        content: validatedData.content,
        parentId: validatedData.parentId,
        isApproved: false, // Require approval
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating comment:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
