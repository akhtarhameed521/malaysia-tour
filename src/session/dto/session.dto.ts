import { z } from "zod";

export const CreateSessionSchema = z.object({
  sessionTitle: z.string().min(1, "Session title is required"),
  time: z.string().min(1, "Time is required"), // Relaxed for bulk upload
  date: z.string().min(1, "Date is required"), // Relaxed for bulk upload
  location: z.string().min(1, "Location is required"),
  speaker: z.string().optional().nullable(),
  track: z.string().optional(),
  airlineName: z.string().optional(),
  groupIds: z.array(z.coerce.number().int().positive()).optional(),
}).strict();

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;

export const UpdateSessionSchema = CreateSessionSchema.partial();

export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
