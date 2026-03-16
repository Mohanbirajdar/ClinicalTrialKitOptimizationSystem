import { z } from "zod";

export const CreateUsageSchema = z.object({
  site_id: z.string().uuid("Invalid site ID"),
  kit_id: z.string().uuid("Invalid kit ID"),
  kits_used: z.number().int().min(0),
  kits_returned: z.number().int().min(0).default(0),
  kits_wasted: z.number().int().min(0).default(0),
  usage_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  patient_count: z.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  reported_by: z.string().optional().nullable(),
});

export type CreateUsageInput = z.infer<typeof CreateUsageSchema>;
