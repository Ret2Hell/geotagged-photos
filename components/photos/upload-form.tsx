"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prepareImage, type PreparedPhoto } from "@/lib/photos/prepare-image";

export function UploadForm() {
    const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
    const [preparing, setPreparing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [error, setError] = useState("");
    const busy = preparing || uploading;

    async function selectPhoto(file: File | undefined) {
        setPhoto(null);
        setError("");
        setUploaded(false);
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

    async function upload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!photo || busy) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        data.set("file", photo.image, "photo.jpg");
        data.set("latitude", String(photo.latitude));
        data.set("longitude", String(photo.longitude));
        setUploading(true);
        setUploaded(false);
        setError("");
        try {
            const response = await fetch("/api/photos", {
                method: "POST",
                body: data,
            });
            if (!response.ok) {
                const result: unknown = await response.json().catch(() => null);
                const message = z
                    .object({ error: z.string() })
                    .safeParse(result);
                throw new Error(
                    message.success
                        ? message.data.error
                        : "Upload failed. Please try again.",
                );
            }
            form.reset();
            setPhoto(null);
            setUploaded(true);
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : "The photograph could not be uploaded.",
            );
        } finally {
            setUploading(false);
        }
    }

    return (
        <form
            onSubmit={(event) => {
                void upload(event);
            }}
            aria-labelledby="photo-upload-title"
            className="max-w-xl space-y-5 rounded-xl border p-6"
        >
            <div className="space-y-2">
                <h2 id="photo-upload-title" className="text-xl font-semibold">
                    Upload a photograph
                </h2>
                <p id="photo-help" className="text-muted-foreground text-sm">
                    Choose a JPEG with GPS metadata, up to 25 MiB.
                </p>
            </div>
            <div className="space-y-2">
                <label htmlFor="photo-file" className="text-sm font-medium">
                    Photograph
                </label>
                <Input
                    id="photo-file"
                    name="file"
                    type="file"
                    accept="image/jpeg,.jpg,.jpeg"
                    disabled={busy}
                    required
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
                </div>
            )}
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
            {uploaded && (
                <output className="text-primary block text-sm">
                    Photograph uploaded successfully.
                </output>
            )}
            <Button type="submit" disabled={!photo || busy}>
                {uploading ? "Uploading…" : "Upload photo"}
            </Button>
        </form>
    );
}
