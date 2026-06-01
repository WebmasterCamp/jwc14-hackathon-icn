import { z } from "zod";

// Shared User-level fields editable from any settings page
export const accountSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ").max(100),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});

// Provider profile fields (verification status is NOT editable here)
export const providerProfileSchema = accountSchema.extend({
  companyName: z.string().min(1, "กรุณากรอกชื่อบริษัท").max(200),
  taxId: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  province: z.string().max(100).optional().or(z.literal("")),
  bankName: z.string().max(100).optional().or(z.literal("")),
  bankAccount: z.string().max(50).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
});

// Customer (school) profile fields
export const customerProfileSchema = accountSchema.extend({
  schoolName: z.string().min(1, "กรุณากรอกชื่อสถานศึกษา").max(200),
  schoolType: z.enum([
    "PRIMARY",
    "SECONDARY",
    "HIGH_SCHOOL",
    "VOCATIONAL",
    "UNIVERSITY",
  ]),
  address: z.string().max(500).optional().or(z.literal("")),
  province: z.string().max(100).optional().or(z.literal("")),
  studentCount: z.coerce.number().int().nonnegative().optional(),
  budget: z.coerce.number().nonnegative().optional(),
});

export type AccountInput = z.infer<typeof accountSchema>;
export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;
export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
