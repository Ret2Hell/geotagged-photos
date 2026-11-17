import {
    coordinatesSchema,
    MAX_PHOTO_BYTES,
    MAX_PHOTO_DIMENSION,
} from "./validation";

export async function prepareImage(file: File) {
    if (
        file.type !== "image/jpeg" ||
        !file.size ||
        file.size > 25 * 1024 * 1024
    ) {
        throw new Error("Choose a JPEG photograph up to 25 MiB.");
    }

    const { gps } = await import("exifr");
    const coordinates = coordinatesSchema.safeParse(
        await gps(file).catch(() => null),
    );
    if (!coordinates.success) {
        throw new Error(
            "This photograph has no valid GPS metadata. Choose a geotagged JPEG.",
        );
    }

    const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
    }).catch(() => {
        throw new Error(
            "This photograph could not be decoded. Choose another JPEG.",
        );
    });
    try {
        const scale = Math.min(
            1,
            MAX_PHOTO_DIMENSION / Math.max(bitmap.width, bitmap.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext("2d");
        if (!context)
            throw new Error("Your browser could not prepare the photograph.");
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const image = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else
                        reject(
                            new Error("The photograph could not be resized."),
                        );
                },
                "image/jpeg",
                0.8,
            );
        });
        if (image.size > MAX_PHOTO_BYTES) {
            throw new Error(
                "The resized photograph is still larger than 3 MiB. Choose a smaller image.",
            );
        }

        const previewUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    if (typeof reader.result === "string")
                        resolve(reader.result);
                    else reject(new Error("The preview could not be created."));
                },
                { once: true },
            );
            reader.addEventListener(
                "error",
                () => {
                    reject(new Error("The preview could not be created."));
                },
                { once: true },
            );
            reader.readAsDataURL(image);
        });

        return {
            image,
            previewUrl,
            width: canvas.width,
            height: canvas.height,
            ...coordinates.data,
        };
    } finally {
        bitmap.close();
    }
}

export type PreparedPhoto = Awaited<ReturnType<typeof prepareImage>>;
