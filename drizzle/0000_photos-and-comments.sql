CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"photo_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" varchar(2000) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_body_nonempty" CHECK (length(btrim("comments"."body")) > 0)
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"object_key" text NOT NULL,
	"caption" varchar(2000) DEFAULT '' NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"byte_size" integer NOT NULL,
	"ai_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photos_object_key_unique" UNIQUE("object_key"),
	CONSTRAINT "photos_latitude_range" CHECK ("photos"."latitude" BETWEEN -90 AND 90),
	CONSTRAINT "photos_longitude_range" CHECK ("photos"."longitude" BETWEEN -180 AND 180),
	CONSTRAINT "photos_image_metadata_positive" CHECK ("photos"."width" > 0 AND "photos"."height" > 0 AND "photos"."byte_size" > 0),
	CONSTRAINT "photos_object_key_nonempty" CHECK (length(btrim("photos"."object_key")) > 0)
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_photo_created_idx" ON "comments" USING btree ("photo_id","created_at","id");--> statement-breakpoint
CREATE INDEX "photos_created_idx" ON "photos" USING btree ("created_at" DESC NULLS LAST,"id");