import { z } from "zod";

export const CreateHotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  checkin: z.string().optional().nullable(),
  checkout: z.string().optional().nullable(),
}).strict();

export type CreateHotelDto = z.infer<typeof CreateHotelSchema>;

export const UpdateHotelSchema = CreateHotelSchema.partial();

export type UpdateHotelDto = z.infer<typeof UpdateHotelSchema>;
