import { eq } from "drizzle-orm";
import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { storage } from "@/lib/storage/client";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    await connection();
    try {
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
                { error: "Sign in to view photographs." },
                { status: 401 },
            );
        const id = z.uuid().safeParse((await params).id);
        if (!id.success)
            return Response.json(
                { error: "Photo not found." },
                { status: 404 },
            );

        const [photo] = await db
            .select()
            .from(photos)
            .where(eq(photos.id, id.data));
        if (!photo)
            return Response.json(
                { error: "Photo not found." },
                { status: 404 },
            );
        const imageUrl = await getSignedUrl(
            storage,
            new GetObjectCommand({
                Bucket: env.NEON_STORAGE_BUCKET,
                Key: photo.objectKey,
                ResponseContentType: photo.contentType,
                ResponseContentDisposition: "inline",
                ResponseCacheControl: "private, max-age=60",
            }),
            { expiresIn: 300 },
        );

        return Response.json(
            {
                id: photo.id,
                latitude: photo.latitude,
                longitude: photo.longitude,
                width: photo.width,
                height: photo.height,
                createdAt: photo.createdAt.toISOString(),
                aiDescription: photo.aiDescription,
                imageUrl,
            },
            { headers: { "Cache-Control": "private, no-store" } },
        );
    } catch (error) {
        unstable_rethrow(error);
        console.error("[photos] Details failed", {
            name: error instanceof Error ? error.name : "UnknownError",
        });
        return Response.json(
            { error: "The photograph could not be loaded. Please try again." },
            { status: 500 },
        );
    }
}
