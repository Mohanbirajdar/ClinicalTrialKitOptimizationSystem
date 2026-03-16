import { z } from "zod";

export const CreateSiteSchema = z.object({
  trial_id: z.string().uuid("Invalid trial ID"),
  site_name: z.string().min(2, "Site name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  country: z.string().min(2, "Country is required"),
  activation_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  patient_capacity: z.number().int().positive("Patient capacity must be positive"),
  enrolled_patients: z.number().int().min(0).default(0),
  samples_per_patient: z.number().int().positive().default(1),
  coordinator_name: z.string().optional().nullable(),
  coordinator_email: z.string().email().optional().nullable(),
  status: z.enum(["pending", "active", "closed"]).default("pending"),
});

export const UpdateSiteSchema = CreateSiteSchema.partial();
export type CreateSiteInput = z.infer<typeof CreateSiteSchema>;
export type UpdateSiteInput = z.infer<typeof UpdateSiteSchema>;
