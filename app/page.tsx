import { Suspense } from "react";
import { PhotoWorkspace } from "@/components/photos/photo-workspace";
import { getPhotoLocations } from "@/lib/photos/locations";
import { requireSession } from "@/lib/auth/session";

async function HomeContent() {
    await requireSession();
    const locations = await getPhotoLocations();
    return (
        <main aria-label="Photograph map" className="relative min-h-0 flex-1">
            <PhotoWorkspace locations={locations} />
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
