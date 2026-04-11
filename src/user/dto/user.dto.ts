import { z } from "zod";

export const UpdateUserSchema = z.object({
    fullName: z.string().min(1, "Full Name is required").optional(),
    phone: z.string().min(1, "Phone is required").optional(),
}).strict();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;




export const AddUserDetailsSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
}).strict();

export type AddUserDetailsDto = z.infer<typeof AddUserDetailsSchema>;
