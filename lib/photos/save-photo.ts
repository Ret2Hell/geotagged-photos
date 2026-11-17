import "server-only";

import { randomUUID } from "node:crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db } from "../../db/index.ts";
import { photos } from "../../db/schema.ts";
import { env } from "../env.ts";
import { storage } from "../storage/client.ts";

export async function savePhoto(
    ownerId: string,
    image: Buffer,
    details: {
        latitude: number;
        longitude: number;
        width: number;
        height: number;
    },
) {
    const id = randomUUID();
    const key = `photos/${ownerId}/${id}.jpg`;
    const bucket = env.NEON_STORAGE_BUCKET;

    await storage.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: image,
            ContentType: "image/jpeg",
        }),
    );
    try {
        await db.insert(photos).values({
            id,
            ownerId,
            objectKey: key,
            ...details,
            contentType: "image/jpeg",
            byteSize: image.length,
        });
    } catch (error) {
        await storage
            .send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
            .catch(() =>
                console.error("[photos] Storage cleanup failed", {
                    photoId: id,
                }),
            );
        throw error;
    }
    return id;
}
