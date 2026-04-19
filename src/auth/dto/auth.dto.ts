import { email, z } from "zod";


export const LoginUserSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6).max(100),
}).strict();

export const ChangePasswordSchema = z.object({
    userId: z.number().int().positive(),
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
}).strict().refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const CreateUserSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    groupId: z.coerce.number().int().positive().optional(),
    hotelId: z.coerce.number().int().positive().optional(),
    roomId: z.coerce.number().int().positive().optional(),
    airlineId: z.coerce.number().int().positive().optional(),
    returnAirlineId: z.coerce.number().int().positive().optional(),
    role: z.string().optional(),
    country: z.string().optional(),
}).strict();

export type LoginUserDto = z.infer<typeof LoginUserSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
