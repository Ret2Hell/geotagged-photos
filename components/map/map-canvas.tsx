"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LngLatBounds, type GeoJSONSource } from "mapbox-gl";
import Map, {
    Layer,
    NavigationControl,
    ScaleControl,
    Source,
    type LayerProps,
    type MapMouseEvent,
    type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { env } from "@/lib/env";
import { PhotoDetailsDialog } from "@/components/photos/photo-details-dialog";
import type { PhotoLocations } from "@/lib/photos/locations";

const clusters: LayerProps = {
    id: "photo-clusters",
    type: "circle",
    filter: ["has", "point_count"],
    paint: {
        "circle-color": "#2dd4bf",
        "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            26,
            1000,
            32,
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
    },
};
const clusterLabels: LayerProps = {
    id: "photo-cluster-labels",
    type: "symbol",
    filter: ["has", "point_count"],
    layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-size": 12,
        "text-allow-overlap": true,
    },
    paint: { "text-color": "#042f2e" },
};
const points: LayerProps = {
    id: "photo-points",
    type: "circle",
    filter: ["!", ["has", "point_count"]],
    paint: {
        "circle-color": "#2dd4bf",
        "circle-radius": 10,
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
    },
};

export default function MapCanvas({
    data,
    descriptions,
}: {
    data: PhotoLocations;
    descriptions: Record<string, string>;
}) {
    const mapRef = useRef<MapRef>(null);
    const [error, setError] = useState("");
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [hovering, setHovering] = useState(false);
    const [opening, setOpening] = useState(false);
    const selectionRequest = useRef(0);
    const selectedPhotoId = selectedPhotoIds[selectedIndex];

    const [loaded, setLoaded] = useState(false);

    const fitPhotos = useCallback(
        (duration = 500) => {
            if (!data.features.length) return;
            const bounds = new LngLatBounds();
            for (const photo of data.features) {
                const [longitude, latitude] = photo.geometry.coordinates;
                bounds.extend([longitude, latitude]);
            }
            mapRef.current?.fitBounds(bounds, {
                padding: { top: 48, bottom: 96, left: 48, right: 72 },
                maxZoom: 14,
                duration,
            });
        },
        [data],
    );

    useEffect(() => {
        if (loaded) fitPhotos(0);
    }, [fitPhotos, loaded]);

    function handleMapClick(event: MapMouseEvent) {
        const request = ++selectionRequest.current;
        setOpening(false);
        const cluster = event.features?.find(
            (item) => item.layer?.id === "photo-clusters",
        );
        if (cluster) {
            const clusterId: unknown = cluster.properties?.cluster_id;
            const count: unknown = cluster.properties?.point_count;
            const source = mapRef.current?.getSource<GeoJSONSource>("photos");
            if (
                !source ||
                typeof clusterId !== "number" ||
                typeof count !== "number"
            )
                return;
            setOpening(true);
            source.getClusterLeaves(clusterId, count, 0, (failure, leaves) => {
                if (request !== selectionRequest.current) return;
                setOpening(false);
                if (failure || !leaves) {
                    setError(
                        "These photographs could not be opened. Please try again.",
                    );
                    return;
                }
                const ids: string[] = [];
                for (const leaf of leaves) {
                    const id: unknown = leaf.properties?.id;
                    if (typeof id === "string") ids.push(id);
                }
                setSelectedIndex(0);
                setSelectedPhotoIds([...new Set(ids)]);
            });
            return;
        }

        const ids: string[] = [];
        for (const feature of event.features ?? []) {
            if (feature.layer?.id !== "photo-points") continue;
            const id: unknown = feature.properties?.id;
            if (typeof id === "string") ids.push(id);
        }
        if (ids.length) {
            setSelectedIndex(0);
            setSelectedPhotoIds([...new Set(ids)]);
        }
    }

    return (
        <div className="photo-map absolute inset-0">
            <Map
                ref={mapRef}
                mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/light-v11"
                initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
                style={{ width: "100%", height: "100%" }}
                interactiveLayerIds={["photo-clusters", "photo-points"]}
                cursor={opening ? "progress" : hovering ? "pointer" : "grab"}
                onMouseMove={(event) =>
                    setHovering(Boolean(event.features?.length))
                }
                onMouseLeave={() => setHovering(false)}
                onLoad={() => setLoaded(true)}
                onClick={handleMapClick}
                onError={(event) => {
                    const message =
                        event.error.message || "An unknown map error occurred.";
                    console.error("[map] Mapbox error:", message);
                    setError(message);
                }}
            >
                <NavigationControl position="top-right" />
                <ScaleControl unit="metric" />
                <Source
                    id="photos"
                    type="geojson"
                    data={data}
                    cluster
                    clusterMaxZoom={14}
                    clusterRadius={50}
                >
                    <Layer {...clusters} />
                    <Layer {...clusterLabels} />
                    <Layer {...points} />
                </Source>
            </Map>
            {selectedPhotoId && (
                <PhotoDetailsDialog
                    photoId={selectedPhotoId}
                    generatedDescription={descriptions[selectedPhotoId]}
                    position={selectedIndex}
                    count={selectedPhotoIds.length}
                    onPrevious={() =>
                        setSelectedIndex((index) => Math.max(0, index - 1))
                    }
                    onNext={() =>
                        setSelectedIndex((index) =>
                            Math.min(selectedPhotoIds.length - 1, index + 1),
                        )
                    }
                    onClose={() => {
                        selectionRequest.current++;
                        setSelectedPhotoIds([]);
                    }}
                />
            )}
            {error && (
                <p
                    role="alert"
                    className="bg-background text-destructive absolute top-4 left-4 max-w-[70%] rounded-lg border p-3 text-sm"
                >
                    {error}
                </p>
            )}
            {!error && !data.features.length && (
                <p className="bg-background absolute top-4 left-4 max-w-[70%] rounded-lg border p-3 text-sm">
                    No photographs yet. Use the + button to upload your first
                    one.
                </p>
            )}
        </div>
    );
}
