import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { comments } from "../../db/schema.ts";
import type { PhotoComment } from "./contracts";

export async function getPhotoComments(
    photoId: string,
): Promise<PhotoComment[]> {
    const rows = await db
        .select({
            id: comments.id,
            body: comments.body,
            createdAt: comments.createdAt,
            authorName: sql<string | null>`author.name`,
        })
        .from(comments)
        .leftJoin(
            sql`"neon_auth"."user" as author`,
            sql`author.id = ${comments.authorId}`,
        )
        .where(eq(comments.photoId, photoId))
        .orderBy(comments.createdAt, comments.id);

    return rows.map((comment) => ({
        id: comment.id,
        body: comment.body,
        authorName: comment.authorName,
        createdAt: comment.createdAt.toISOString(),
    }));
}
