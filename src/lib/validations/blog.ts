import { z } from "zod";

/**
 * Blog post creation/update validation schema
 */
export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  titleTh: z.string().max(200, "Thai title too long").optional(),
  content: z.string().min(1, "Content is required"),
  contentTh: z.string().optional(),
  excerpt: z.string().max(500, "Excerpt too long").optional(),
  excerptTh: z.string().max(500, "Thai excerpt too long").optional(),
  featuredImage: z.string().url("Invalid image URL").optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean().default(false),
  scheduledFor: z.string().datetime().optional(),
  metaTitle: z.string().max(60, "Meta title too long").optional(),
  metaDescription: z.string().max(160, "Meta description too long").optional(),
  categoryIds: z.array(z.string()).min(1, "At least one category required"),
  tagIds: z.array(z.string()).optional(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

/**
 * Blog category validation schema
 */
export const blogCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  nameTh: z.string().max(100, "Thai name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  parentId: z.string().optional(),
});

export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;

/**
 * Blog tag validation schema
 */
export const blogTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  nameTh: z.string().max(50, "Thai name too long").optional(),
});

export type BlogTagInput = z.infer<typeof blogTagSchema>;

/**
 * Blog comment validation schema
 */
export const blogCommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment too long"),
  parentId: z.string().optional(),
});

export type BlogCommentInput = z.infer<typeof blogCommentSchema>;

/**
 * Blog search/filter validation schema
 */
export const blogSearchSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  authorId: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(12),
  sortBy: z.enum(["publishedAt", "viewCount", "createdAt"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type BlogSearchParams = z.infer<typeof blogSearchSchema>;
