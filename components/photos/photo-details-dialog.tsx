"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PhotoComments } from "./comments";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    apiErrorSchema,
    photoDetailsSchema,
    type PhotoDetails,
} from "@/lib/photos/contracts";

function PhotoDetailsContent({
    photoId,
    generatedDescription,
}: {
    photoId: string;
    generatedDescription?: string;
}) {
    const [photo, setPhoto] = useState<PhotoDetails | null>(null);
    const [error, setError] = useState("");
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        async function loadPhoto() {
            try {
                const response = await fetch(`/api/photos/${photoId}`, {
                    signal: controller.signal,
                    cache: "no-store",
                });
                const result: unknown = await response.json();
                if (!response.ok) {
                    const message = apiErrorSchema.safeParse(result);
                    throw new Error(
                        message.success
                            ? message.data.error
                            : "The photograph could not be loaded.",
                    );
                }
                setPhoto(photoDetailsSchema.parse(result));
            } catch (failure) {
                if (!controller.signal.aborted)
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : "The photograph could not be loaded.",
                    );
            }
        }
        void loadPhoto();
        return () => controller.abort();
    }, [photoId]);

    return (
        <>
            {error && (
                <p role="alert" className="text-destructive p-6 text-sm">
                    {error}
                </p>
            )}
            {!photo && !error && (
                <output className="text-muted-foreground flex flex-1 items-center justify-center p-6 text-sm">
                    Loading photograph…
                </output>
            )}
            {photo && (
                <div className="min-h-0 flex-1 overflow-y-auto md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(20rem,1fr)] md:grid-rows-1 md:overflow-hidden">
                    <section
                        aria-label="Photograph details"
                        className="min-h-0 min-w-0 space-y-5 p-5 sm:p-6 md:overflow-y-auto"
                    >
                        <Image
                            src={photo.imageUrl}
                            alt="Uploaded geotagged photograph"
                            width={photo.width}
                            height={photo.height}
                            unoptimized
                            onError={() => setImageError(true)}
                            className="bg-muted max-h-[45dvh] w-full rounded-2xl object-contain"
                        />
                        {imageError && (
                            <p
                                role="alert"
                                className="text-destructive text-sm"
                            >
                                The image could not load. Close and reopen the
                                photograph to request a fresh link.
                            </p>
                        )}
                        <dl className="bg-muted/30 grid gap-4 rounded-xl border p-4 text-sm sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                            <div className="space-y-1">
                                <dt className="text-muted-foreground text-xs">
                                    Location
                                </dt>
                                <dd className="font-mono text-xs">
                                    {photo.latitude.toFixed(5)},{" "}
                                    {photo.longitude.toFixed(5)}
                                </dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-muted-foreground text-xs">
                                    Uploaded
                                </dt>
                                <dd>
                                    <time dateTime={photo.createdAt}>
                                        {new Date(
                                            photo.createdAt,
                                        ).toLocaleString()}
                                    </time>
                                </dd>
                            </div>
                        </dl>
                        <section
                            aria-labelledby="description-title"
                            className="space-y-2"
                        >
                            <h2
                                id="description-title"
                                className="font-semibold"
                            >
                                Description
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed wrap-anywhere whitespace-pre-wrap">
                                {generatedDescription ||
                                    photo.aiDescription ||
                                    "No description available."}
                            </p>
                        </section>
                    </section>
                    <PhotoComments
                        photoId={photo.id}
                        initialComments={photo.comments}
                    />
                </div>
            )}
        </>
    );
}

export function PhotoDetailsDialog({
    photoId,
    generatedDescription,
    position,
    count,
    onPrevious,
    onNext,
    onClose,
}: {
    photoId: string;
    generatedDescription?: string;
    position: number;
    count: number;
    onPrevious: () => void;
    onNext: () => void;
    onClose: () => void;
}) {
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="flex h-[90dvh] max-h-[56rem] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Photo details</DialogTitle>
                    <DialogDescription className="sr-only">
                        View photograph details and comments.
                    </DialogDescription>
                </DialogHeader>
                {count > 1 && (
                    <nav
                        aria-label="Photograph navigation"
                        className="flex shrink-0 items-center justify-between gap-3 border-b py-3 pr-16 pl-5 sm:pl-6"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={position === 0}
                            onClick={onPrevious}
                        >
                            Previous
                        </Button>
                        <span
                            aria-live="polite"
                            className="text-muted-foreground text-sm"
                        >
                            {position + 1} of {count}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={position === count - 1}
                            onClick={onNext}
                        >
                            Next
                        </Button>
                    </nav>
                )}
                <PhotoDetailsContent
                    key={photoId}
                    photoId={photoId}
                    generatedDescription={generatedDescription}
                />
            </DialogContent>
        </Dialog>
    );
}
