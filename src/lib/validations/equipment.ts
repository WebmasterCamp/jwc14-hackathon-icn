import { z } from "zod";

// Equipment specs validation schema
export const equipmentSpecsSchema = z
  .object({
    dimensions: z
      .object({
        width: z.number().positive(),
        height: z.number().positive(),
        depth: z.number().positive(),
        unit: z.enum(["cm", "mm", "inch"]),
      })
      .optional(),
    weight: z
      .object({
        value: z.number().positive(),
        unit: z.enum(["kg", "g", "lb"]),
      })
      .optional(),
    power: z
      .object({
        voltage: z.number().positive(),
        wattage: z.number().positive(),
      })
      .optional(),
    connectivity: z.array(z.string()).optional(),
    material: z.string().optional(),
    color: z.string().optional(),
    warranty: z
      .object({
        duration: z.number().positive(),
        unit: z.enum(["months", "years"]),
      })
      .optional(),
    certifications: z.array(z.string()).optional(),
    ageRange: z
      .object({
        min: z.number().int().nonnegative(),
        max: z.number().int().positive(),
      })
      .optional(),
    capacity: z.number().positive().optional(),
    // Allow additional custom fields
  })
  .passthrough();

export type EquipmentSpecs = z.infer<typeof equipmentSpecsSchema>;
