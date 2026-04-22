import { z } from "zod";
import { ExploreType } from "../../types";

const PlaceToVisitSchema = z.object({
  type: z.literal(ExploreType.PlaceToVisit),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional(),
  tag: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  rating: z.coerce.number().optional().nullable(),
  distance: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
}).passthrough();

const FoodSchema = z.object({
  type: z.literal(ExploreType.Food),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional(),
  tag: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  rating: z.coerce.number().optional().nullable(),
  distance: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
}).passthrough();

const GettingAroundSchema = z.object({
  type: z.literal(ExploreType.GettingAround),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional(),
  tag: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  rating: z.coerce.number().optional().nullable(),
  distance: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
}).passthrough();

export const CreateExploreSchema = z.discriminatedUnion("type", [
  PlaceToVisitSchema,
  FoodSchema,
  GettingAroundSchema,
]);

export type CreateExploreDto = z.infer<typeof CreateExploreSchema>;

export const UpdateExploreSchema = z.object({
  type: z.nativeEnum(ExploreType).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  tag: z.string().optional(),
  location: z.string().optional(),
  rating: z.coerce.number().optional(),
  distance: z.string().optional(),
  duration: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  details: z.string().optional(),
}).passthrough();

export type UpdateExploreDto = z.infer<typeof UpdateExploreSchema>;
