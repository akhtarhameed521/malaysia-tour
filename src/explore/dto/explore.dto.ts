import { z } from "zod";
import { ExploreType } from "../../types";

export const CreateExploreSchema = z.object({
  type: z.nativeEnum(ExploreType, { message: "Invalid type" }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
}).strict();

export type CreateExploreDto = z.infer<typeof CreateExploreSchema>;

export const UpdateExploreSchema = CreateExploreSchema.partial();

export type UpdateExploreDto = z.infer<typeof UpdateExploreSchema>;
