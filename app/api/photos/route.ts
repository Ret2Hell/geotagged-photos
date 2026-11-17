import { unstable_rethrow } from "next/navigation";
import sharp from "sharp";
import { auth } from "@/lib/auth/server";
import {
    MAX_PHOTO_BYTES,
    MAX_PHOTO_DIMENSION,
    photoFormSchema,
} from "@/lib/photos/validation";
import { savePhoto } from "@/lib/photos/save-photo";

export const maxDuration = 30;

export async function POST(request: Request) {
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
                { error: "Sign in again to upload a photograph." },
                { status: 401 },
            );
        if (Number(request.headers.get("content-length")) > 4 * 1024 * 1024) {
            return Response.json(
                { error: "The upload request is too large." },
                { status: 413 },
            );
        }

        const form = await request.formData().catch(() => null);
        if (!form)
            return Response.json(
                { error: "Send a valid photo upload." },
                { status: 400 },
            );
        const fields = photoFormSchema.safeParse(Object.fromEntries(form));
        const file = form.get("file");
        if (!fields.success || !(file instanceof File)) {
            return Response.json(
                {
                    error: "Choose a photograph with valid GPS coordinates.",
                },
                { status: 400 },
            );
        }
        if (!file.size || file.size > MAX_PHOTO_BYTES) {
            return Response.json(
                { error: "The prepared photograph must be under 3 MiB." },
                { status: 413 },
            );
        }
        if (file.type !== "image/jpeg") {
            return Response.json(
                { error: "Only JPEG photographs are supported." },
                { status: 400 },
            );
        }

        const image = Buffer.from(await file.arrayBuffer());
        const metadata = await sharp(image, {
            limitInputPixels: MAX_PHOTO_DIMENSION ** 2,
            failOn: "warning",
        })
            .metadata()
            .catch(() => null);
        if (
            !metadata ||
            metadata.format !== "jpeg" ||
            !metadata.width ||
            !metadata.height ||
            metadata.width > MAX_PHOTO_DIMENSION ||
            metadata.height > MAX_PHOTO_DIMENSION
        ) {
            return Response.json(
                {
                    error: "Use a valid JPEG resized to at most 1600 pixels per side.",
                },
                { status: 400 },
            );
        }

        const id = await savePhoto(session.user.id, image, {
            latitude: fields.data.latitude,
            longitude: fields.data.longitude,
            width: metadata.width,
            height: metadata.height,
        });
        return Response.json({ id }, { status: 201 });
    } catch (error) {
        unstable_rethrow(error);
        console.error("[photos] Upload failed", {
            name: error instanceof Error ? error.name : "UnknownError",
        });
        return Response.json(
            {
                error: "The photograph could not be uploaded. Please try again.",
            },
            { status: 500 },
        );
    }
}
