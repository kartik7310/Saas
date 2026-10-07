"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

interface LocationMapProps {
    setLocation: (location: { lat: number; lng: number }) => void;
}

export default function LocationMap({ setLocation }: LocationMapProps) {
    const [position, setPosition] = useState<[number, number]>([28.6139, 77.209]);

    function LocationMarker() {
        useMapEvents({
            click(e: L.LeafletMouseEvent) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                setLocation({ lat, lng });
            },
        });

        return <Marker position={position} />;
    }

    return (
        <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="rounded-xl"
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
        </MapContainer>
    );
}