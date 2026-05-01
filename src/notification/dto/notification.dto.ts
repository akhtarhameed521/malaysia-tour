import { z } from "zod";

export const CreateNotificationSchema = z.object({
    type: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    order: z.number().optional(),
    employeeId: z.number().optional(),
    groupIds: z.array(z.string()).optional(),
}).refine(data => !(data.employeeId && data.groupIds && data.groupIds.length > 0), {
    message: "Please provide either employeeId or groupIds, not both",
    path: ["employeeId"]
});

export const UpdateNotificationSchema = z.object({
    type: z.string().optional(),
    title: z.string().optional(),
    message: z.string().optional(),
    isRead: z.boolean().optional(),
    order: z.number().optional(),
    employeeId: z.number().optional(),
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationDto = z.infer<typeof UpdateNotificationSchema>;
