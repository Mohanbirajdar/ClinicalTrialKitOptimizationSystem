import { z } from "zod";

export const CreateShipmentSchema = z.object({
  site_id: z.string().uuid("Invalid site ID"),
  kit_id: z.string().uuid("Invalid kit ID"),
  quantity: z.number().int().positive("Quantity must be positive"),
  shipment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  expected_delivery_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  tracking_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateShipmentStatusSchema = z.object({
  status: z.enum([
    "preparing",
    "shipped",
    "in_transit",
    "delivered",
    "cancelled",
  ]),
  actual_delivery_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  tracking_number: z.string().optional().nullable(),
});

export type CreateShipmentInput = z.infer<typeof CreateShipmentSchema>;
export type UpdateShipmentStatusInput = z.infer<typeof UpdateShipmentStatusSchema>;
