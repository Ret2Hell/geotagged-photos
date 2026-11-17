import { and, eq } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { APICallError } from "ai";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { describePhoto } from "@/lib/ai/describe-photo";
import { env } from "@/lib/env";
import { storage } from "@/lib/storage/client";
import { MAX_PHOTO_BYTES } from "@/lib/photos/validation";

export const maxDuration = 30;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        if (request.headers.get("origin") !== new URL(request.url).origin) {
            return Response.json(
                { error: "Request origin is not allowed." },
                { status: 403 },
            );
        }
        const { data: session, error } = await auth.getSession({
            query: { disableCookieCache: "true" },
        });
        if (error)
            return Response.json(
                { error: "Unable to verify your session. Please try again." },
                { status: 503 },
            );
        if (!session?.user)
            return Response.json(
                { error: "Sign in to generate a description." },
                { status: 401 },
            );
        const id = z.uuid().safeParse((await params).id);
        if (!id.success)
            return Response.json(
                { error: "Photo not found." },
                { status: 404 },
            );
        const condition = and(
            eq(photos.id, id.data),
            eq(photos.ownerId, session.user.id),
        );
        const [photo] = await db.select().from(photos).where(condition);
        if (!photo)
            return Response.json(
                { error: "Photo not found." },
                { status: 404 },
            );
        if (photo.aiDescription) {
            return Response.json(
                { id: photo.id, description: photo.aiDescription },
                { headers: { "Cache-Control": "private, no-store" } },
            );
        }

        const abortSignal = AbortSignal.timeout(20000);
        const object = await storage.send(
            new GetObjectCommand({
                Bucket: env.NEON_STORAGE_BUCKET,
                Key: photo.objectKey,
            }),
            { abortSignal },
        );
        if (object.ContentLength && object.ContentLength > MAX_PHOTO_BYTES) {
            return Response.json(
                { error: "This image is too large to describe." },
                { status: 400 },
            );
        }
        const image = await object.Body?.transformToByteArray();
        if (!image?.length || image.length > MAX_PHOTO_BYTES) {
            return Response.json(
                { error: "The stored image could not be read." },
                { status: 400 },
            );
        }

        const description = await describePhoto(
            image,
            photo.contentType,
            abortSignal,
        );
        await db
            .update(photos)
            .set({ aiDescription: description })
            .where(condition);
        return Response.json(
            { id: photo.id, description },
            { headers: { "Cache-Control": "private, no-store" } },
        );
    } catch (error) {
        unstable_rethrow(error);
        console.error("[ai] Description failed", {
            name: error instanceof Error ? error.name : "UnknownError",
            status: APICallError.isInstance(error)
                ? error.statusCode
                : undefined,
        });
        return Response.json(
            {
                error: "The AI description could not be generated. Your photograph is still saved.",
            },
            { status: 503 },
        );
    }
}
