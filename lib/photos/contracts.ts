import { z } from "zod";
import { coordinatesSchema } from "./validation";

export const apiErrorSchema = z.object({ error: z.string() });

export const photoDetailsSchema = coordinatesSchema.extend({
    id: z.uuid(),
    imageUrl: z.url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    aiDescription: z.string().nullable(),
});

export type PhotoDetails = z.infer<typeof photoDetailsSchema>;
