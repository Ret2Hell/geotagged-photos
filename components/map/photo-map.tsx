"use client";

import dynamic from "next/dynamic";
import type { PhotoLocations } from "@/lib/photos/locations";

const MapCanvas = dynamic(() => import("./map-canvas"), {
    ssr: false,
    loading: () => (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
            <output className="text-muted-foreground text-sm">
                Loading map…
            </output>
        </div>
    ),
});

export function PhotoMap({ data }: { data: PhotoLocations }) {
    return <MapCanvas data={data} />;
}
