import { z } from "zod";

export const CreateGroupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().nullable(),
    userIds: z.array(z.coerce.number().int().positive()).optional().default([]),
}).strict();

export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;

export const UpdateGroupSchema = CreateGroupSchema.partial();

export type UpdateGroupDto = z.infer<typeof UpdateGroupSchema>;
