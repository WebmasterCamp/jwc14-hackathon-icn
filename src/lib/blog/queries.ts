import { prisma } from "@/lib/prisma";
import { BlogPostStatus, BlogAuthorType } from "@/generated/prisma/client";
import { generateSlug, calculateReadingTime, generateExcerpt } from "@/lib/seo";

export interface BlogPostFilters {
  search?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  status?: BlogPostStatus;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "publishedAt" | "viewCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Get paginated blog posts with filters
 */
export async function getBlogPosts(filters: BlogPostFilters = {}) {
  const {
    search,
    categoryId,
    tagId,
    authorId,
    status = "PUBLISHED",
    isFeatured,
    page = 1,
    limit = 12,
    sortBy = "publishedAt",
    sortOrder = "desc",
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {
    status,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { titleTh: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { contentTh: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    where.categories = {
      some: { categoryId },
    };
  }

  if (tagId) {
    where.tags = {
      some: { tagId },
    };
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
  }

  // Only show published posts with publishedAt in the past
  if (status === "PUBLISHED") {
    where.publishedAt = {
      lte: new Date(),
    };
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: { isApproved: true },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          provider: {
            select: {
              companyName: true,
              logo: true,
              verified: true,
            },
          },
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      comments: {
        where: {
          isApproved: true,
          parentId: null, // Only top-level comments
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          replies: {
            where: { isApproved: true },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Get featured blog posts
 */
export async function getFeaturedPosts(limit: number = 3) {
  return prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      isFeatured: true,
      publishedAt: {
        lte: new Date(),
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      _count: {
        select: {
          comments: {
            where: { isApproved: true },
          },
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });
}

/**
 * Get related blog posts by category and tags
 */
export async function getRelatedPosts(postId: string, limit: number = 3) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    include: {
      categories: true,
      tags: true,
    },
  });

  if (!post) return [];

  const categoryIds = post.categories.map((c) => c.categoryId);
  const tagIds = post.tags.map((t) => t.tagId);

  return prisma.blogPost.findMany({
    where: {
      id: { not: postId },
      status: "PUBLISHED",
      publishedAt: {
        lte: new Date(),
      },
      OR: [
        {
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        },
        {
          tags: {
            some: {
              tagId: { in: tagIds },
            },
          },
        },
      ],
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });
}

/**
 * Get all blog categories with post counts
 */
export async function getBlogCategories() {
  return prisma.blogCategory.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: {
                status: "PUBLISHED",
                publishedAt: {
                  lte: new Date(),
                },
              },
            },
          },
        },
      },
      parent: true,
      children: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Get all blog tags with post counts
 */
export async function getBlogTags() {
  return prisma.blogTag.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: {
                status: "PUBLISHED",
                publishedAt: {
                  lte: new Date(),
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Increment blog post view count
 */
export async function incrementViewCount(postId: string) {
  return prisma.blogPost.update({
    where: { id: postId },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Create a new blog post
 */
export async function createBlogPost(data: {
  title: string;
  titleTh?: string;
  content: string;
  contentTh?: string;
  excerpt?: string;
  excerptTh?: string;
  featuredImage?: string;
  authorId: string;
  authorType?: BlogAuthorType;
  status: BlogPostStatus;
  isFeatured?: boolean;
  scheduledFor?: Date;
  metaTitle?: string;
  metaDescription?: string;
  categoryIds: string[];
  tagIds?: string[];
}) {
  const slug = generateSlug(data.titleTh || data.title);
  const readingTime = calculateReadingTime(data.content);
  const excerpt = data.excerpt || generateExcerpt(data.content);

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: data.title,
      titleTh: data.titleTh,
      content: data.content,
      contentTh: data.contentTh,
      excerpt,
      excerptTh: data.excerptTh,
      featuredImage: data.featuredImage,
      authorId: data.authorId,
      authorType: data.authorType || "USER",
      status: data.status,
      isFeatured: data.isFeatured || false,
      readingTime,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      scheduledFor: data.scheduledFor,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      categories: {
        create: data.categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
      tags: data.tagIds
        ? {
            create: data.tagIds.map((tagId) => ({
              tagId,
            })),
          }
        : undefined,
    },
    include: {
      author: true,
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return post;
}

/**
 * Update a blog post
 */
export async function updateBlogPost(
  postId: string,
  data: Partial<{
    title: string;
    titleTh?: string;
    content: string;
    contentTh?: string;
    excerpt?: string;
    excerptTh?: string;
    featuredImage?: string;
    status: BlogPostStatus;
    isFeatured: boolean;
    scheduledFor?: Date;
    metaTitle?: string;
    metaDescription?: string;
    categoryIds: string[];
    tagIds?: string[];
  }>
) {
  const updateData: any = { ...data };

  // Update slug if title changed
  if (data.title || data.titleTh) {
    updateData.slug = generateSlug(data.titleTh || data.title!);
  }

  // Update reading time if content changed
  if (data.content) {
    updateData.readingTime = calculateReadingTime(data.content);
  }

  // Update excerpt if content changed and no explicit excerpt
  if (data.content && !data.excerpt) {
    updateData.excerpt = generateExcerpt(data.content);
  }

  // Set publishedAt when status changes to PUBLISHED
  if (data.status === "PUBLISHED") {
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { publishedAt: true },
    });
    if (!existingPost?.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  // Handle category updates
  if (data.categoryIds) {
    await prisma.blogPostCategory.deleteMany({
      where: { postId },
    });
    updateData.categories = {
      create: data.categoryIds.map((categoryId) => ({
        categoryId,
      })),
    };
  }

  // Handle tag updates
  if (data.tagIds) {
    await prisma.blogPostTag.deleteMany({
      where: { postId },
    });
    updateData.tags = {
      create: data.tagIds.map((tagId) => ({
        tagId,
      })),
    };
  }

  return prisma.blogPost.update({
    where: { id: postId },
    data: updateData,
    include: {
      author: true,
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(postId: string) {
  return prisma.blogPost.delete({
    where: { id: postId },
  });
}
