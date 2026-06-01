import { z } from "zod";

/**
 * Landing-page customer project showcase validation schema (admin-managed).
 */
export const projectExampleSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title too long"),
  image: z.string().min(1, "Image is required").max(2048, "Image URL too long"),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const projectExampleUpdateSchema = projectExampleSchema.partial();

export type ProjectExampleInput = z.infer<typeof projectExampleSchema>;
export type ProjectExampleUpdateInput = z.infer<
  typeof projectExampleUpdateSchema
>;
