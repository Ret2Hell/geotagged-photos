"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { prepareImage, type PreparedPhoto } from "@/lib/photos/prepare-image";

export function PhotoPreparation() {
    const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
    const [preparing, setPreparing] = useState(false);
    const [error, setError] = useState("");

    async function selectPhoto(file: File | undefined) {
        setPhoto(null);
        setError("");
        if (!file) return;
        setPreparing(true);
        try {
            setPhoto(await prepareImage(file));
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : "The photograph could not be prepared.",
            );
        } finally {
            setPreparing(false);
        }
    }

    return (
        <section
            aria-labelledby="photo-preparation-title"
            className="max-w-xl space-y-5 rounded-xl border p-6"
        >
            <div className="space-y-2">
                <h2
                    id="photo-preparation-title"
                    className="text-xl font-semibold"
                >
                    Prepare a photograph
                </h2>
                <p id="photo-help" className="text-muted-foreground text-sm">
                    Choose a JPEG with GPS metadata, up to 25 MiB. Preparation
                    and preview happen entirely in your browser; nothing is
                    uploaded yet.
                </p>
            </div>
            <div className="space-y-2">
                <label htmlFor="photo-file" className="text-sm font-medium">
                    Photograph
                </label>
                <Input
                    id="photo-file"
                    type="file"
                    accept="image/jpeg,.jpg,.jpeg"
                    disabled={preparing}
                    aria-describedby="photo-help"
                    className="h-auto py-2"
                    onChange={(event) => {
                        void selectPhoto(event.target.files?.[0]);
                    }}
                />
            </div>
            {preparing && (
                <output className="text-muted-foreground block text-sm">
                    Reading GPS and preparing the photograph…
                </output>
            )}
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
            {photo && (
                <div className="space-y-4">
                    <Image
                        src={photo.previewUrl}
                        alt="Preview of the prepared photograph"
                        width={photo.width}
                        height={photo.height}
                        unoptimized
                        className="bg-muted max-h-96 w-full rounded-lg object-contain"
                    />
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-muted-foreground">
                                GPS coordinates
                            </dt>
                            <dd className="font-mono text-xs">
                                {photo.latitude.toFixed(5)},{" "}
                                {photo.longitude.toFixed(5)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">
                                Prepared image
                            </dt>
                            <dd>
                                {photo.width} × {photo.height} ·{" "}
                                {(photo.image.size / 1024).toFixed(0)} KiB
                            </dd>
                        </div>
                    </dl>
                    <output className="text-primary block text-sm">
                        Photograph prepared. Upload will be connected next.
                    </output>
                </div>
            )}
        </section>
    );
}
