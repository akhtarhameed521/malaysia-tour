import { z } from "zod";

export const CreateDaySchema = z.object({
  dayNumber: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
}).strict();

export type CreateDayDto = z.infer<typeof CreateDaySchema>;

export const UpdateDaySchema = CreateDaySchema.partial();

export type UpdateDayDto = z.infer<typeof UpdateDaySchema>;
