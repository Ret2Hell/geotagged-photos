"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UploadForm } from "./upload-form";

export function UploadDialog({
    onUploaded,
}: {
    onUploaded: (photoId: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button
                        size="icon-lg"
                        className="absolute right-6 bottom-8 z-10 size-14 rounded-full shadow-lg"
                        aria-label="Upload a photograph"
                        title="Upload a photograph"
                    />
                }
            >
                <HugeiconsIcon
                    icon={Add01Icon}
                    className="size-6"
                    aria-hidden="true"
                />
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Upload a photograph</DialogTitle>
                    <DialogDescription id="photo-help">
                        Choose a JPEG with GPS metadata, up to 25 MiB.
                    </DialogDescription>
                </DialogHeader>
                <UploadForm
                    onUploaded={(photoId) => {
                        setOpen(false);
                        router.refresh();
                        onUploaded(photoId);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
