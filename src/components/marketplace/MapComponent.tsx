
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js/Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    businesses: any[];
    center?: [number, number];
    zoom?: number;
    className?: string;
    onMarkerClick?: (businessId: string) => void;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function MapComponent({
    businesses,
    center = [51.505, -0.09], // Default to London or generic
    zoom = 13,
    className = "h-full w-full",
    onMarkerClick
}: MapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className={`bg-gray-100 animate-pulse ${className}`} />;

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className={className}
        >
            <ChangeView center={center} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {businesses.map((business) => (
                // Only render if we have coordinates
                (business.address?.lat && business.address?.lng) && (
                    <Marker
                        key={business._id}
                        position={[business.address.lat, business.address.lng]}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => onMarkerClick && onMarkerClick(business._id)
                        }}
                    >
                        <Popup className="font-sans">
                            <div className="text-sm font-semibold">{business.name}</div>
                            <div className="text-xs text-gray-500">{business.address.addressLocality}</div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}
