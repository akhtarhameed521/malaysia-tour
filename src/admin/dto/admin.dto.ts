import { z } from "zod";

export const CreateAdminSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
}).strict();

export const UpdateAdminSchema = CreateAdminSchema.partial().strict();

export const LoginAdminSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
}).strict();

export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminSchema>;
export type LoginAdminDto = z.infer<typeof LoginAdminSchema>;
