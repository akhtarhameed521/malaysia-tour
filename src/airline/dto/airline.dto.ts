import { z } from "zod";

export const CreateAirlineSchema = z.object({
  name: z.string().min(1, "Airline name is required"),
  departureCity: z.string().min(1, "Departure city is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  isReturn: z.boolean().optional().default(false),
}).strict();

export type CreateAirlineDto = z.infer<typeof CreateAirlineSchema>;

export const UpdateAirlineSchema = CreateAirlineSchema.partial();

export type UpdateAirlineDto = z.infer<typeof UpdateAirlineSchema>;

// Return Airline DTOs
export const CreateReturnAirlineSchema = CreateAirlineSchema.extend({
    isReturn: z.boolean().optional().default(true),
}).strict();

export type CreateReturnAirlineDto = z.infer<typeof CreateReturnAirlineSchema>;

export const UpdateReturnAirlineSchema = CreateReturnAirlineSchema.partial();

export type UpdateReturnAirlineDto = z.infer<typeof UpdateReturnAirlineSchema>;
