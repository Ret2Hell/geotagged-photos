import { z } from "zod";

export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
export const MAX_PHOTO_DIMENSION = 1600;

export const coordinatesSchema = z.object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
});
