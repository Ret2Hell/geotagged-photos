"use client";

import { useEffect, useRef, useState } from "react";
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
import type { PhotoLocations } from "@/lib/photos/locations";

const clusters: LayerProps = {
    id: "photo-clusters",
    type: "circle",
    filter: ["has", "point_count"],
    paint: {
        "circle-color": "#0f766e",
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
    paint: { "text-color": "#ffffff" },
};
const points: LayerProps = {
    id: "photo-points",
    type: "circle",
    filter: ["!", ["has", "point_count"]],
    paint: {
        "circle-color": "#0f766e",
        "circle-radius": 7,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
    },
};

export default function MapCanvas({ data }: { data: PhotoLocations }) {
    const mapRef = useRef<MapRef>(null);
    const [error, setError] = useState("");

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!loaded || !data.features.length) return;
        const bounds = new LngLatBounds();
        for (const photo of data.features) {
            const [longitude, latitude] = photo.geometry.coordinates;
            bounds.extend([longitude, latitude]);
        }
        mapRef.current?.fitBounds(bounds, {
            padding: 48,
            maxZoom: 14,
            duration: 0,
        });
    }, [data, loaded]);

    function expandCluster(event: MapMouseEvent) {
        const feature = event.features?.find(
            (item) => item.layer?.id === "photo-clusters",
        );
        if (!feature || feature.geometry.type !== "Point") return;
        const clusterId: unknown = feature.properties?.cluster_id;
        if (typeof clusterId !== "number") return;
        const [longitude, latitude] = feature.geometry.coordinates;
        const source = mapRef.current?.getSource<GeoJSONSource>("photos");
        source?.getClusterExpansionZoom(clusterId, (failure, zoom) => {
            if (failure || zoom == null) return;
            mapRef.current?.easeTo({
                center: [longitude, latitude],
                zoom,
                duration: 500,
            });
        });
    }

    return (
        <div className="absolute inset-0">
            <Map
                ref={mapRef}
                mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/light-v11"
                initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
                style={{ width: "100%", height: "100%" }}
                interactiveLayerIds={["photo-clusters"]}
                onLoad={() => setLoaded(true)}
                onClick={expandCluster}
                onError={() =>
                    setError(
                        "The map could not load. Check the Mapbox token, allowed URLs, and your connection.",
                    )
                }
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
