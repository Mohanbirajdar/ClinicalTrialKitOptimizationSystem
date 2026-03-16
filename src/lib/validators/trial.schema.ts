import { z } from "zod";

export const CreateTrialSchema = z.object({
  trial_name: z.string().min(2, "Trial name must be at least 2 characters"),
  trial_phase: z.enum(["Phase I", "Phase II", "Phase III", "Phase IV"]),
  status: z
    .enum(["planning", "active", "completed", "suspended"])
    .default("planning"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
  sponsor: z.string().optional().nullable(),
  protocol_number: z.string().optional().nullable(),
});

export const UpdateTrialSchema = CreateTrialSchema.partial();
export type CreateTrialInput = z.infer<typeof CreateTrialSchema>;
export type UpdateTrialInput = z.infer<typeof UpdateTrialSchema>;
