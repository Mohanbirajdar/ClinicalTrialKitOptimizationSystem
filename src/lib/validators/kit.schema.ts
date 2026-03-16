import { z } from "zod";

export const CreateKitSchema = z.object({
  kit_type: z.string().min(1, "Kit type is required"),
  lot_number: z.string().min(1, "Lot number is required"),
  manufacturing_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  unit_cost: z.string().optional().nullable(),
  storage_requirements: z.string().optional().nullable(),
  status: z
    .enum(["available", "low_stock", "expired", "depleted"])
    .default("available"),
});

export const UpdateKitSchema = CreateKitSchema.partial();
export type CreateKitInput = z.infer<typeof CreateKitSchema>;
export type UpdateKitInput = z.infer<typeof UpdateKitSchema>;
