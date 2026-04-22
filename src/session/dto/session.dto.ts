import { z } from "zod";
import { SessionTrack } from "@types";

export const CreateSessionSchema = z.object({
  sessionTitle: z.string().min(1, "Session title is required"),
  time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)?$/, "Time must be in HH:mm or HH:mm:ss format"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  location: z.string().min(1, "Location is required"),
  speaker: z.string().min(1, "Speaker is required"),
  track: z.nativeEnum(SessionTrack),
  groupIds: z.array(z.coerce.number().int().positive()).optional(),
}).strict();

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;

export const UpdateSessionSchema = CreateSessionSchema.partial();

export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
