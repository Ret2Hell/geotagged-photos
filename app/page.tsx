import { Suspense } from "react";
import { PhotoPreparation } from "@/components/photos/photo-preparation";
import { requireSession } from "@/lib/auth/session";

async function HomeContent() {
    await requireSession();
    return (
        <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
            <h1 className="text-2xl font-semibold">Your photographs</h1>
            <PhotoPreparation />
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
