"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { MapPin, Loader2 } from "lucide-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

import { cn } from "@/lib/utils"

interface AddressMapPickerProps {
    lat: number
    lng: number
    onChange: (lat: number, lng: number) => void
    className?: string
    readOnly?: boolean
}

function LocationMarker({ position, setPosition, readOnly }: { position: [number, number], setPosition: (pos: [number, number]) => void, readOnly?: boolean }) {
    const map = useMap()

    useEffect(() => {
        map.flyTo(position, map.getZoom())
    }, [position, map])

    useMapEvents({
        click(e) {
            if (!readOnly) setPosition([e.latlng.lat, e.latlng.lng])
        },
        dragend(e) {
            if (!readOnly) {
                const center = e.target.getCenter();
                setPosition([center.lat, center.lng]);
            }
        }
    })

    return position === null ? null : (
        <Marker position={position} icon={icon} />
    )
}

export default function AddressMapPicker({ lat, lng, onChange, className, readOnly }: AddressMapPickerProps) {
    // Default to Nairobi if 0,0
    const center: [number, number] = (lat === 0 && lng === 0) ? [-1.2921, 36.8219] : [lat, lng]

    const [locating, setLocating] = useState(false)

    const handleLocate = () => {
        if (!("geolocation" in navigator)) return
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                onChange(latitude, longitude)
                setLocating(false)
            },
            (error) => {
                console.error("Error getting user location:", error)
                setLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    useEffect(() => {
        if (lat === 0 && lng === 0 && !readOnly) {
            handleLocate()
        }
    }, []) // Run once on mount if 0,0

    return (
        <div className={cn("h-[300px] w-full rounded-md overflow-hidden border z-0 relative", className)}>
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                dragging={!readOnly}
                zoomControl={!readOnly}
                doubleClickZoom={!readOnly}
            >
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                />
                <LocationMarker
                    position={[lat || center[0], lng || center[1]]}
                    setPosition={(pos) => onChange(pos[0], pos[1])}
                    readOnly={readOnly}
                />
            </MapContainer>

            {!readOnly && (
                <button
                    type="button"
                    onClick={handleLocate}
                    disabled={locating}
                    className="absolute top-2 right-2 z-[401] bg-white dark:bg-zinc-900 border border-input p-2 rounded-md shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    title="Find my location"
                >
                    {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                </button>
            )}

            {!readOnly && (
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-black/90 p-2 text-xs text-center rounded backdrop-blur-sm z-[400] pointer-events-none">
                    Click map to set location
                </div>
            )}
        </div>
    )
}
