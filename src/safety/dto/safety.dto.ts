import { z } from "zod";
import { SafetyType } from "../../types";

export const CreateSafetySchema = z.object({
  type: z.nativeEnum(SafetyType, { message: "Invalid safety type" }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  phoneNumber: z.string().optional().nullable(),
}).strict();

export type CreateSafetyDto = z.infer<typeof CreateSafetySchema>;

export const UpdateSafetySchema = CreateSafetySchema.partial();

export type UpdateSafetyDto = z.infer<typeof UpdateSafetySchema>;
