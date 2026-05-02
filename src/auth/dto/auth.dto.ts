import { email, z } from "zod";

export const LoginUserSchema = z.object({
    email: z.string().email("Invalid email format").transform((val) => val.toLowerCase()),
    password: z.string().min(6).max(100),
    fcmToken: z.string().optional().nullable(),
}).strict();

export const ChangePasswordSchema = z.object({
    userId: z.coerce.number().int().positive(),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters").max(100),
}).strict().refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const AdminChangePasswordSchema = z.object({
    employeeId: z.coerce.number().int().positive().min(1, "Employee ID is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters").max(100),
}).strict().refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const CreateUserSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email format").transform((val) => val.toLowerCase()),
    phone: z.string().min(1, "Phone is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    groupId: z.coerce.number().int().positive().optional(),
    hotelId: z.coerce.number().int().positive().optional(),
    roomId: z.coerce.number().int().positive().optional(),
    airlineId: z.coerce.number().int().positive().optional(),
    returnAirlineId: z.coerce.number().int().positive().optional(),
    role: z.string().optional(),
    country: z.string().optional(),
    image: z.string().optional(),
    ticketImage: z.string().optional(),
    type: z.string().optional(),
    globalId: z.string().optional(),
    localId: z.string().optional(),
    jobTitle: z.string().optional(),
    function: z.string().optional(),
    lineManager: z.string().optional(),
    fastTrack: z.string().optional(),
    advancePack: z.string().optional(),
    regionDepartment: z.string().optional(),
    flightStation: z.string().optional(),
    gender: z.string().optional(),
    passportNumber: z.string().optional(),
    passportIssDate: z.string().optional(),
    passportExpiryDate: z.string().optional(),
    nicNumber: z.string().optional(),
    arrivalTimeKUL: z.string().optional(),
    fcmToken: z.string().optional(),
    isChatBlocked: z.string().optional(),
    sessions: z.string().optional(),
    additionalField1: z.string().optional(),
    additionalField2: z.string().optional(),
    additionalField3: z.string().optional(),
    additionalField4: z.string().optional(),
    additionalField5: z.string().optional(),
}).strict();

export type LoginUserDto = z.infer<typeof LoginUserSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type AdminChangePasswordDto = z.infer<typeof AdminChangePasswordSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
