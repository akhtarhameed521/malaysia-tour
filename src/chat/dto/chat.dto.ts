import { z } from "zod";

export const SendMessageSchema = z.object({
    chatRoomId: z.coerce.number({ message: "chatRoomId is required" }),
    content: z.string().optional().nullable(),
    messageType: z.enum(["text", "image", "file", "video"]).optional().default("text"),
}).strict();

export type SendMessageDto = z.infer<typeof SendMessageSchema>;

export const MarkAsReadSchema = z.object({
    chatRoomId: z.number({ message: "chatRoomId is required" }),
}).strict();

export type MarkAsReadDto = z.infer<typeof MarkAsReadSchema>;

export const GetMessagesQuerySchema = z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(50),
});

export type GetMessagesQueryDto = z.infer<typeof GetMessagesQuerySchema>;

export const EditMessageSchema = z.object({
    content: z.string().min(1, "Message content is required"),
}).strict();

export type EditMessageDto = z.infer<typeof EditMessageSchema>;
