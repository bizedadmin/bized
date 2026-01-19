"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import { CountrySelector } from "@/components/ui/country-selector"
import html2canvas from "html2canvas"
import { uploadToFirebase } from "@/lib/firebase-upload"

// Dynamically import MapPicker to avoid SSR issues
const AddressMapPicker = dynamic(() => import("./address-map-picker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">Loading Map...</div>
})

interface AddressData {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
    lat: number
    lng: number
    mapSnapshotUrl?: string
}

interface AddressDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: AddressData
    onSave: (data: AddressData) => Promise<void>
}

export function AddressDialog({ open, onOpenChange, initialData, onSave }: AddressDialogProps) {
    const [step, setStep] = useState<1 | 2>(1)
    const [saving, setSaving] = useState(false)
    const [data, setData] = useState<AddressData>({
        streetAddress: '',
        addressLocality: '',
        addressRegion: '',
        postalCode: '',
        addressCountry: 'Kenya',
        lat: 0,
        lng: 0,
    })

    useEffect(() => {
        if (open && initialData) {
            setData({
                streetAddress: initialData.streetAddress || '',
                addressLocality: initialData.addressLocality || '',
                addressRegion: initialData.addressRegion || '',
                postalCode: initialData.postalCode || '',
                addressCountry: initialData.addressCountry || 'Kenya',
                lat: initialData.lat || 0,
                lng: initialData.lng || 0,
                mapSnapshotUrl: initialData.mapSnapshotUrl,
            })
            setStep(1)
        } else if (open) {
            // Reset if opening new
            setData({
                streetAddress: '',
                addressLocality: '',
                addressRegion: '',
                postalCode: '',
                addressCountry: 'Kenya',
                lat: 0,
                lng: 0
            })
            setStep(1)

            // Auto-locate as soon as dialog opens if creating new
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setData(prev => ({
                            ...prev,
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }))
                    },
                    (error) => {
                        console.warn("Auto-geolocation failed:", error)
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                )
            }
        }
    }, [open, initialData])

    const handleSave = async () => {
        setSaving(true)
        try {
            let snapshotUrl = data.mapSnapshotUrl;

            // If we are on step 2 (Map), try to capture snapshot
            if (step === 2) {
                const mapElement = document.getElementById('address-map-container')
                if (mapElement) {
                    try {
                        const canvas = await html2canvas(mapElement, {
                            useCORS: true,
                            allowTaint: true,
                            logging: false
                        })

                        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
                        if (blob) {
                            const file = new File([blob], `map-snapshot-${Date.now()}.png`, { type: 'image/png' })
                            snapshotUrl = await uploadToFirebase(file, `business-maps/${Date.now()}.png`)
                        }
                    } catch (err) {
                        console.warn("Failed to capture map snapshot", err)
                        // Continue saving even if snapshot fails
                    }
                }
            }

            await onSave({ ...data, mapSnapshotUrl: snapshotUrl })
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{step === 1 ? "Enter address" : "Drag map to exact location"}</DialogTitle>
                    {step === 2 && <DialogDescription>Pinpoint your business location on the map.</DialogDescription>}
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Street Address / P.O. Box</Label>
                            <Input
                                placeholder="e.g. 123 Business St, Suite 100"
                                value={data.streetAddress}
                                onChange={e => setData(d => ({ ...d, streetAddress: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Building / Floor / Landmark</Label>
                            <Input
                                placeholder="e.g. Empire State Building, Floor 24"
                                value={data.addressRegion}
                                onChange={e => setData(d => ({ ...d, addressRegion: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>City / Locality</Label>
                            <Input
                                placeholder="e.g. New York, London, Nairobi"
                                value={data.addressLocality}
                                onChange={e => setData(d => ({ ...d, addressLocality: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Postal Code</Label>
                                <Input
                                    placeholder="e.g. 10001"
                                    value={data.postalCode}
                                    onChange={e => setData(d => ({ ...d, postalCode: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <CountrySelector
                                    value={data.addressCountry}
                                    onChange={(v) => setData(d => ({ ...d, addressCountry: v }))}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-4" id="address-map-container">
                        <AddressMapPicker
                            lat={data.lat}
                            lng={data.lng}
                            onChange={(lat, lng) => setData(d => ({ ...d, lat, lng }))}
                        />
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                            <MapPin className="w-4 h-4" />
                            <span>{data.lat.toFixed(6)}, {data.lng.toFixed(6)}</span>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {step === 2 && (
                        <Button variant="outline" onClick={() => setStep(1)} disabled={saving} className="w-full sm:w-auto">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    )}

                    {step === 1 ? (
                        <Button className="w-full sm:w-auto" onClick={() => setStep(2)}>
                            Next
                        </Button>
                    ) : (
                        <Button className="w-full sm:w-auto" onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
