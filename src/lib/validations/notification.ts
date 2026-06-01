import { z } from "zod";

// Notification data validation schemas
export const notificationDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("PAYMENT_REMINDER"),
    paymentId: z.string(),
    amount: z.number().positive(),
    dueDate: z.string(),
    contractNumber: z.string().optional(),
  }),
  z.object({
    type: z.literal("PAYMENT_OVERDUE"),
    paymentId: z.string(),
    amount: z.number().positive(),
    dueDate: z.string(),
    daysOverdue: z.number().int().positive(),
    contractNumber: z.string().optional(),
  }),
  z.object({
    type: z.literal("CONTRACT_APPROVED"),
    contractId: z.string(),
    contractNumber: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  }),
  z.object({
    type: z.literal("CONTRACT_EXPIRING"),
    contractId: z.string(),
    contractNumber: z.string(),
    endDate: z.string(),
    daysUntilExpiry: z.number().int().positive(),
  }),
  z.object({
    type: z.literal("MAINTENANCE_UPDATE"),
    maintenanceRequestId: z.string(),
    status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
    title: z.string(),
  }),
  z.object({
    type: z.literal("SYSTEM"),
    message: z.string(),
    link: z.string().optional(),
  }),
]);

export type NotificationData = z.infer<typeof notificationDataSchema>;
