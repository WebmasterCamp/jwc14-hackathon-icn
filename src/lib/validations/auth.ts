import { z } from "zod";

// Provider registration schema
export const providerRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .regex(/^[0-9]{9,15}$/, "Phone must be 9-15 digits")
    .optional(),
  companyName: z.string().min(2, "Company name required"),
  taxId: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  description: z.string().optional(),
});

// Customer registration schema
export const customerRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .regex(/^[0-9]{9,15}$/, "Phone must be 9-15 digits")
    .optional(),
  schoolName: z.string().min(2, "School name required"),
  schoolType: z.enum([
    "PRIMARY",
    "SECONDARY",
    "HIGH_SCHOOL",
    "VOCATIONAL",
    "UNIVERSITY",
  ]),
  address: z.string().optional(),
  province: z.string().optional(),
  studentCount: z.number().int().positive().optional(),
  budget: z.number().positive().optional(),
});

export type ProviderRegistrationInput = z.infer<
  typeof providerRegistrationSchema
>;
export type CustomerRegistrationInput = z.infer<
  typeof customerRegistrationSchema
>;
