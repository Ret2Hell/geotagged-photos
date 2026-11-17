"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhotoMap } from "@/components/map/photo-map";
import { UploadDialog } from "./upload-dialog";
import { apiErrorSchema, descriptionSchema } from "@/lib/photos/contracts";
import type { PhotoLocations } from "@/lib/photos/locations";

export function PhotoWorkspace({ locations }: { locations: PhotoLocations }) {
    const [descriptions, setDescriptions] = useState<Record<string, string>>(
        {},
    );
    const [pending, setPending] = useState(0);
    const [error, setError] = useState("");

    async function generateDescription(photoId: string) {
        setPending((count) => count + 1);
        setError("");
        try {
            const response = await fetch(`/api/photos/${photoId}/description`, {
                method: "POST",
            });
            const result: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                const message = apiErrorSchema.safeParse(result);
                throw new Error(
                    message.success
                        ? message.data.error
                        : "The AI description is unavailable. Your photograph is still saved.",
                );
            }
            const generated = descriptionSchema.parse(result);
            setDescriptions((current) => ({
                ...current,
                [generated.id]: generated.description,
            }));
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : "The AI description is unavailable. Your photograph is still saved.",
            );
        } finally {
            setPending((count) => count - 1);
        }
    }

    return (
        <>
            <PhotoMap data={locations} descriptions={descriptions} />
            <UploadDialog
                onUploaded={(photoId) => {
                    void generateDescription(photoId);
                }}
            />
            {(pending > 0 || error) && (
                <div className="bg-background absolute right-6 bottom-24 z-10 max-w-[calc(100%-3rem)] space-y-2 rounded-xl border p-3 text-sm shadow-md">
                    {pending > 0 ? (
                        <output>Generating image descriptions…</output>
                    ) : (
                        <>
                            <p role="alert">{error}</p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setError("")}
                            >
                                Dismiss
                            </Button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
