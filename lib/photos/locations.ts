import "server-only";

import type { FeatureCollection, Point } from "geojson";
import { db } from "../../db/index.ts";
import { photos } from "../../db/schema.ts";

export type PhotoLocations = FeatureCollection<Point, { id: string }>;

export async function getPhotoLocations(): Promise<PhotoLocations> {
    const locations = await db
        .select({
            id: photos.id,
            latitude: photos.latitude,
            longitude: photos.longitude,
        })
        .from(photos);

    return {
        type: "FeatureCollection",
        features: locations.map((photo) => ({
            type: "Feature",
            id: photo.id,
            properties: { id: photo.id },
            geometry: {
                type: "Point",
                coordinates: [photo.longitude, photo.latitude],
            },
        })),
    };
}
