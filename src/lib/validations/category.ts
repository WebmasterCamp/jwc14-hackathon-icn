import { z } from "zod";

/**
 * Equipment/product category validation schema (admin-managed).
 */
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  nameTh: z.string().min(1, "Thai name is required").max(100, "Thai name too long"),
  description: z.string().max(500, "Description too long").optional(),
  icon: z.string().max(50, "Icon too long").optional(),
});

export const categoryUpdateSchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
