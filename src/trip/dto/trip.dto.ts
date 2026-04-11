import { z } from "zod";

export const CreateHotelSchema = z.object({
  hotelName: z.string().min(1, "Hotel name is required"),
  checkin: z.string().optional().nullable(),
  checkout: z.string().optional().nullable(),
}).strict();

export const CreateRoomSchema = z.object({
  roomNumber: z.coerce.number().int().positive(),
  floor: z.coerce.number().int().nonnegative(),
  groupType: z.string().min(1, "Group type is required"),
  hotelId: z.coerce.number().int().positive("Hotel ID is required"),
}).strict();

export const CreateMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  isLead: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  image: z.string().optional().nullable(),
  contactInfo: z.string().min(1, "Contact info is required"),
  description: z.string().optional().nullable(),
  roomId: z.coerce.number().int().positive("Room ID is required"),
}).strict();

export type CreateHotelDto = z.infer<typeof CreateHotelSchema>;
export type CreateRoomDto = z.infer<typeof CreateRoomSchema>;
export type CreateMemberDto = z.infer<typeof CreateMemberSchema>;

export const UpdateHotelSchema = CreateHotelSchema.partial();
export const UpdateRoomSchema = CreateRoomSchema.partial();
export const UpdateMemberSchema = CreateMemberSchema.partial();

export type UpdateHotelDto = z.infer<typeof UpdateHotelSchema>;
export type UpdateRoomDto = z.infer<typeof UpdateRoomSchema>;
export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>;
