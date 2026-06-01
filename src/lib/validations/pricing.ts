import { z } from "zod";

// A per-product duration discount tier. maxMonths is optional (null/omitted =
// open-ended, e.g. "24+ months"). discountPercent is 0–100.
export const priceTierCreateSchema = z
  .object({
    minMonths: z.coerce.number().int().min(1, "ต้องอย่างน้อย 1 เดือน"),
    maxMonths: z.coerce.number().int().min(1).nullish(),
    discountPercent: z.coerce
      .number()
      .min(0, "ส่วนลดต้องไม่ติดลบ")
      .max(100, "ส่วนลดต้องไม่เกิน 100%"),
  })
  .refine((d) => d.maxMonths == null || d.maxMonths >= d.minMonths, {
    message: "เดือนสูงสุดต้องมากกว่าหรือเท่ากับเดือนต่ำสุด",
    path: ["maxMonths"],
  });

export const priceTierUpdateSchema = priceTierCreateSchema;

export type PriceTierInput = z.infer<typeof priceTierCreateSchema>;
