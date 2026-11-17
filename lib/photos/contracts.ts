import { z } from "zod";
import { coordinatesSchema } from "./validation";

export const apiErrorSchema = z.object({ error: z.string() });
export const uploadResponseSchema = z.object({ id: z.uuid() });
export const descriptionSchema = z.object({
    id: z.uuid(),
    description: z.string().min(1).max(2000),
});

export const commentInputSchema = z.object({
    body: z.string().trim().min(1).max(2000),
});

export const commentSchema = z.object({
    id: z.uuid(),
    body: z.string(),
    authorName: z.string().nullable(),
    createdAt: z.iso.datetime(),
});

export type PhotoComment = z.infer<typeof commentSchema>;

export const photoDetailsSchema = coordinatesSchema.extend({
    id: z.uuid(),
    imageUrl: z.url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    aiDescription: z.string().nullable(),
    comments: z.array(commentSchema),
});

export type PhotoDetails = z.infer<typeof photoDetailsSchema>;
