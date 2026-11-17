import { eq } from "drizzle-orm";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { photos, comments } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { commentInputSchema } from "@/lib/photos/contracts";

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
                { error: "Sign in to add a comment." },
                { status: 401 },
            );
        const id = z.uuid().safeParse((await params).id);
        if (!id.success)
            return Response.json(
                { error: "Photo not found." },
                { status: 404 },
            );
        const body: unknown = await request.json().catch(() => null);
        const input = commentInputSchema.safeParse(body);
        if (!input.success)
            return Response.json(
                { error: "Write a comment between 1 and 2,000 characters." },
                { status: 400 },
            );

        const [photo] = await db
            .select({ id: photos.id })
            .from(photos)
            .where(eq(photos.id, id.data));
        if (!photo)
            return Response.json(
                { error: "Photo not found." },
                { status: 404 },
            );
        const [comment] = await db
            .insert(comments)
            .values({
                photoId: photo.id,
                authorId: session.user.id,
                body: input.data.body,
            })
            .returning({
                id: comments.id,
                body: comments.body,
                createdAt: comments.createdAt,
            });

        return Response.json(
            {
                ...comment,
                authorName: session.user.name || null,
                createdAt: comment.createdAt.toISOString(),
            },
            { status: 201 },
        );
    } catch (error) {
        unstable_rethrow(error);
        console.error("[comments] Creation failed", {
            name: error instanceof Error ? error.name : "UnknownError",
        });
        return Response.json(
            { error: "The comment could not be saved. Please try again." },
            { status: 500 },
        );
    }
}
