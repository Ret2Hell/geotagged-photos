import { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";

async function HomeContent() {
    await requireSession();
    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">GeoTagged Photos</h1>
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
