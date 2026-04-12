import { z } from "zod";

export const CreateRoomSchema = z.object({
  roomNumber: z.coerce.number().int().positive(),
  floor: z.coerce.number().int().nonnegative(),
  groupType: z.string().min(1, "Group type is required"),
  hotelId: z.coerce.number().int().positive("Hotel ID is required"),
}).strict();

export type CreateRoomDto = z.infer<typeof CreateRoomSchema>;

export const UpdateRoomSchema = CreateRoomSchema.partial();

export type UpdateRoomDto = z.infer<typeof UpdateRoomSchema>;
