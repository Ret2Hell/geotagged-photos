import { sql } from "drizzle-orm";
import {
    check,
    doublePrecision,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

// User references will be constrained when Neon Auth is integrated.
export const photos = pgTable(
    "photos",
    {
        id: uuid().primaryKey().defaultRandom(),
        ownerId: uuid("owner_id").notNull(),
        objectKey: text("object_key").notNull().unique(),
        caption: varchar({ length: 2000 }).notNull().default(""),
        latitude: doublePrecision().notNull(),
        longitude: doublePrecision().notNull(),
        width: integer().notNull(),
        height: integer().notNull(),
        contentType: varchar("content_type", { length: 100 }).notNull(),
        byteSize: integer("byte_size").notNull(),
        aiDescription: text("ai_description"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("photos_created_idx").on(table.createdAt.desc(), table.id),
        check(
            "photos_latitude_range",
            sql`${table.latitude} BETWEEN -90 AND 90`,
        ),
        check(
            "photos_longitude_range",
            sql`${table.longitude} BETWEEN -180 AND 180`,
        ),
        check(
            "photos_image_metadata_positive",
            sql`${table.width} > 0 AND ${table.height} > 0 AND ${table.byteSize} > 0`,
        ),
        check(
            "photos_object_key_nonempty",
            sql`length(btrim(${table.objectKey})) > 0`,
        ),
    ],
);

export const comments = pgTable(
    "comments",
    {
        id: uuid().primaryKey().defaultRandom(),
        photoId: uuid("photo_id")
            .notNull()
            .references(() => photos.id, { onDelete: "cascade" }),
        authorId: uuid("author_id").notNull(),
        body: varchar({ length: 2000 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("comments_photo_created_idx").on(
            table.photoId,
            table.createdAt,
            table.id,
        ),
        check("comments_body_nonempty", sql`length(btrim(${table.body})) > 0`),
    ],
);

export type Photo = typeof photos.$inferSelect;
export type Comment = typeof comments.$inferSelect;
