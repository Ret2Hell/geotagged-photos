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
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
            {!photo && !error && (
                <output className="text-muted-foreground py-12 text-center text-sm">
                    Loading photograph…
                </output>
            )}
            {photo && (
                <div className="space-y-4">
                    <Image
                        src={photo.imageUrl}
                        alt="Uploaded geotagged photograph"
                        width={photo.width}
                        height={photo.height}
                        unoptimized
                        onError={() => setImageError(true)}
                        className="bg-muted max-h-[50dvh] w-full rounded-xl object-contain"
                    />
                    {imageError && (
                        <p role="alert" className="text-destructive text-sm">
                            The image could not load. Close and reopen the
                            photograph to request a fresh link.
                        </p>
                    )}
                    <p className="text-muted-foreground font-mono text-xs">
                        {photo.latitude.toFixed(5)},{" "}
                        {photo.longitude.toFixed(5)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                        Uploaded{" "}
                        <time dateTime={photo.createdAt}>
                            {new Date(photo.createdAt).toLocaleString()}
                        </time>
                    </p>
                    <section
                        aria-labelledby="description-title"
                        className="space-y-2"
                    >
                        <h2 id="description-title" className="font-semibold">
                            AI description
                        </h2>
                        <p className="text-sm whitespace-pre-wrap">
                            {generatedDescription ||
                                photo.aiDescription ||
                                "No AI description available."}
                        </p>
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
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Photograph</DialogTitle>
                    <DialogDescription className="sr-only">
                        View photograph details and comments.
                    </DialogDescription>
                </DialogHeader>
                {count > 1 && (
                    <nav
                        aria-label="Photograph navigation"
                        className="flex items-center justify-between gap-3"
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
