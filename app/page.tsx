import { Suspense } from "react";
import { UploadDialog } from "@/components/photos/upload-dialog";
import { PhotoMap } from "@/components/map/photo-map";
import { getPhotoLocations } from "@/lib/photos/locations";
import { requireSession } from "@/lib/auth/session";

async function HomeContent() {
    await requireSession();
    const locations = await getPhotoLocations();
    return (
        <main aria-label="Photograph map" className="relative min-h-0 flex-1">
            <PhotoMap data={locations} />
            <UploadDialog />
        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={null}>
            <HomeContent />
        </Suspense>
    );
}
