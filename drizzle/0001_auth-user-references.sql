ALTER TABLE "public"."photos"
    ADD CONSTRAINT "photos_owner_auth_user_fk"
    FOREIGN KEY ("owner_id") REFERENCES "neon_auth"."user" ("id") ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE "public"."comments"
    ADD CONSTRAINT "comments_author_auth_user_fk"
    FOREIGN KEY ("author_id") REFERENCES "neon_auth"."user" ("id") ON DELETE RESTRICT;
