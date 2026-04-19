import { SafetyType } from "../../types";
import { z } from "zod";

export const CreateEmergencySchema = z.object({
  type: z.nativeEnum(SafetyType, { message: "Invalid emergency type" }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
}).strict();

export type CreateEmergencyDto = z.infer<typeof CreateEmergencySchema>;

export const UpdateEmergencySchema = CreateEmergencySchema.partial();

export type UpdateEmergencyDto = z.infer<typeof UpdateEmergencySchema>;
