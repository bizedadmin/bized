"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Upload,
    Loader2,
    ArrowLeft,
    Trash2,
    Wand2,
    PlusCircle,
    Sparkles,
    Pencil,
    Image as ImageIcon
} from "lucide-react"

import { ImageGeneratorModal } from "@/components/ui/image-generator-modal"
import { ImageEditorModal } from "@/components/ui/image-editor-modal"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import Link from "next/link"

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 240, 300];

const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

interface ServiceFormProps {
    initialData?: any
    businessId: string
    isEditing?: boolean
}

export function ServiceForm({ initialData, businessId, isEditing = false }: ServiceFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(initialData?.name || "")
    const [serviceType, setServiceType] = useState(initialData?.serviceType || "")
    const [price, setPrice] = useState(initialData?.offers?.price?.toString() || "")
    const [currency, setCurrency] = useState(initialData?.offers?.priceCurrency || "USD")
    const [duration, setDuration] = useState(initialData?.duration?.toString() || "60")
    const [description, setDescription] = useState(initialData?.description || "")
    const [images, setImages] = useState<string[]>(initialData?.image || [])
    const [isOnline, setIsOnline] = useState(initialData ? initialData.status === "online" : true)
    const [uploading, setUploading] = useState(false)
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [generatorInitialImage, setGeneratorInitialImage] = useState<string | undefined>(undefined)
    const [isCustomDuration, setIsCustomDuration] = useState(() => {
        const d = parseInt(initialData?.duration || "60");
        return !DURATION_OPTIONS.includes(d);
    });
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)

    // Schema.org Extended Fields
    const [slogan, setSlogan] = useState(initialData?.slogan || "")
    const [brand, setBrand] = useState(initialData?.brand || "")
    const [category, setCategory] = useState(initialData?.category || "")
    const [audience, setAudience] = useState(initialData?.audience || "")
    const [areaServed, setAreaServed] = useState(initialData?.areaServed || "")
    const [availableChannel, setAvailableChannel] = useState(initialData?.availableChannel || "Online")
    const [serviceOutput, setServiceOutput] = useState(initialData?.serviceOutput || "")
    const [availability, setAvailability] = useState(initialData?.offers?.availability || "https://schema.org/InStock")
    const [url, setUrl] = useState(initialData?.offers?.url || "")
    const [categories, setCategories] = useState<{ _id: string, name: string }[]>([])
    const [isFetchingCategories, setIsFetchingCategories] = useState(false)

    // Attachment Fields
    const [bufferTime, setBufferTime] = useState(initialData?.bufferTime?.toString() || "0")
    const [color, setColor] = useState(initialData?.color || "Blue")
    const [unit, setUnit] = useState(initialData?.unit || "")
    const [discount, setDiscount] = useState(initialData?.offers?.discount?.toString() || "0")
    const [cost, setCost] = useState(initialData?.offers?.cost?.toString() || "")
    const [tax, setTax] = useState(initialData?.offers?.tax?.toString() || "15")

    const handleGenerateDescription = async () => {
        if (!name || isGeneratingDescription) {
            toast.error("Please enter a service name first.")
            return
        }

        setIsGeneratingDescription(true)
        try {
            const response = await fetch('/api/ai/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slogan }),
            })

            const data = await response.json()
            if (response.ok && data.description) {
                setDescription(data.description)
                toast.success("Description generated!")
            } else {
                throw new Error(data.message || "Generation failed")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to generate description")
        } finally {
            setIsGeneratingDescription(false)
        }
    }


    useEffect(() => {
        if (businessId) {
            fetchCategories()
        }
    }, [businessId])

    const fetchCategories = async () => {
        setIsFetchingCategories(true)
        try {
            const res = await fetch(`/api/categories?businessId=${businessId}`)
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setIsFetchingCategories(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !price || !businessId) return

        setLoading(true)
        try {
            // Process images: upload any data URLs or external CDN URLs to the cloud
            const processedImages = await Promise.all(images.map(async (img) => {
                const isDataUrl = img.startsWith('data:');
                const isExternalCloud = img.includes('replicate.delivery') || img.includes('replicate.com');

                if (isDataUrl || isExternalCloud) {
                    // Convert to File/Blob for upload
                    const response = await fetch(img)
                    const blob = await response.blob()
                    const file = new File([blob], `service-image-${Date.now()}.webp`, { type: 'image/webp' })

                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("businessId", businessId)

                    const uploadRes = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    })

                    if (uploadRes.ok) {
                        const data = await uploadRes.json()
                        return data.url
                    } else {
                        throw new Error("Failed to persist image to cloud")
                    }
                }
                return img
            }))

            // Check if the current category exists, if not, create it
            const existingCat = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
            if (!existingCat && category.trim()) {
                await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        business: businessId,
                        name: category.trim()
                    })
                });
            }

            const apiUrl = isEditing
                ? `/api/business/services/${initialData._id}`
                : "/api/business/services"

            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(apiUrl, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business: businessId,
                    name,
                    description,
                    serviceType: serviceType || category, // Fallback to category if type is empty
                    image: processedImages,
                    duration: parseInt(duration),
                    slogan,
                    brand,
                    category,
                    audience,
                    areaServed,
                    availableChannel,
                    serviceOutput,
                    bufferTime: parseInt(bufferTime),
                    color,
                    unit,
                    offers: {
                        price: parseFloat(price),
                        cost: cost ? parseFloat(cost) : undefined,
                        discount: parseFloat(discount),
                        tax: parseFloat(tax),
                        priceCurrency: currency,
                        availability: availability,
                        url: url
                    },
                    status: isOnline ? "online" : "offline"
                })
            })

            if (res.ok) {
                toast.success(isEditing ? "Service updated successfully" : "Service created successfully")
                router.push("/business/services")
                router.refresh()
            } else {
                toast.error("Something went wrong")
            }
        } catch (error) {
            console.error("Error saving service:", error)
            toast.error("Error saving service")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this service?")) return

        setLoading(true)
        try {
            const res = await fetch(`/api/business/services/${initialData._id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Service deleted successfully")
                router.push("/business/services")
                router.refresh()
            } else {
                toast.error("Failed to delete service")
            }
        } catch (error) {
            console.error("Error deleting service:", error)
        } finally {
            setLoading(false)
        }
    }


    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-20 lg:pb-0">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/business/services">
                        <Button variant="ghost" size="icon" type="button" className="h-8 w-8">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">
                        {isEditing ? "Edit Service" : "Add Service"}
                    </h1>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isEditing && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={loading || !name || !price}
                        className="bg-black hover:bg-zinc-800 text-white min-w-[100px]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Save
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Service name*</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="e.g. Haircut, Consultation"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Slogan / Short Catchphrase</Label>
                                <Input
                                    value={slogan}
                                    onChange={(e) => setSlogan(e.target.value)}
                                    className="h-10 text-sm italic"
                                    placeholder="e.g. Look your best, feel your best"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium text-foreground">Description</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-[10px] gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold uppercase tracking-wider transition-all"
                                            onClick={handleGenerateDescription}
                                            disabled={!name || isGeneratingDescription}
                                        >
                                            {isGeneratingDescription ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3 h-3" />
                                            )}
                                            Ai Assist
                                        </Button>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{description.length}/1500</span>
                                </div>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value.slice(0, 1500))}
                                    className="min-h-[120px] text-sm resize-none leading-relaxed focus-visible:ring-blue-500"
                                    placeholder="Provide a comprehensive description of what this service entails..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3 flex items-center gap-2">
                            Full Service Details (Schema.org)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Area Served</Label>
                                <Input
                                    value={areaServed}
                                    onChange={(e) => setAreaServed(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="e.g. Worldwide, Nairobi, 50km radius"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Audience</Label>
                                <Input
                                    value={audience}
                                    onChange={(e) => setAudience(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="e.g. Men, Business Owners, Athletes"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Available Channel</Label>
                                <Select value={availableChannel} onValueChange={setAvailableChannel}>
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online / Digital</SelectItem>
                                        <SelectItem value="In-person">In-person / Physical</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid (Both)</SelectItem>
                                        <SelectItem value="Home-delivery">At Customer Location</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Service Output</Label>
                                <Input
                                    value={serviceOutput}
                                    onChange={(e) => setServiceOutput(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="e.g. Certified Certificate, PDF Report"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Pricing & Duration</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Price*</Label>
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="h-10 text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                        <SelectItem value="KES">KES</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Duration</Label>
                                <div className="space-y-2">
                                    <Select
                                        value={isCustomDuration ? "custom" : duration}
                                        onValueChange={(val) => {
                                            if (val === "custom") {
                                                setIsCustomDuration(true);
                                            } else {
                                                setIsCustomDuration(false);
                                                setDuration(val);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-10 text-sm">
                                            <SelectValue>
                                                {isCustomDuration ? "Custom" : formatDuration(parseInt(duration))}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DURATION_OPTIONS.map((mins) => (
                                                <SelectItem key={mins} value={mins.toString()}>
                                                    {formatDuration(mins)}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {isCustomDuration && (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="h-10 text-sm flex-1"
                                                placeholder="Minutes"
                                            />
                                            <span className="text-xs text-muted-foreground mr-1">mins</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-xs font-normal"
                                                onClick={() => {
                                                    setIsCustomDuration(false);
                                                    setDuration("60");
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Initial Availability</Label>
                                <Select value={availability} onValueChange={setAvailability}>
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="https://schema.org/InStock">Immediate (In Stock)</SelectItem>
                                        <SelectItem value="https://schema.org/OnlineOnly">Online Only</SelectItem>
                                        <SelectItem value="https://schema.org/PreOrder">Accepting Pre-orders</SelectItem>
                                        <SelectItem value="https://schema.org/OutOfStock">Fully Booked (Out of Stock)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Booking / Info URL</Label>
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="https://example.com/booking"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Buffer Time (min)</Label>
                                <Input
                                    type="number"
                                    value={bufferTime}
                                    onChange={(e) => setBufferTime(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="0"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Buffer time is a brief gap between appointments for transitions or delays.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Financials & Variants</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Discount (%)</Label>
                                <Input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Tax (%)</Label>
                                <Select value={tax} onValueChange={setTax}>
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">0%</SelectItem>
                                        <SelectItem value="8">8%</SelectItem>
                                        <SelectItem value="15">15%</SelectItem>
                                        <SelectItem value="16">16%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Unit</Label>
                                <Input
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="e.g. Session, Hour"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Colour</Label>
                                <Select value={color} onValueChange={setColor}>
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Blue">Blue</SelectItem>
                                        <SelectItem value="Red">Red</SelectItem>
                                        <SelectItem value="Green">Green</SelectItem>
                                        <SelectItem value="Purple">Purple</SelectItem>
                                        <SelectItem value="Orange">Orange</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Cost Price</Label>
                                <Input
                                    type="number"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="0.00"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">What this service costs you to provide (internal use).</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">Service Image</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/80 hover:text-blue-800 font-bold uppercase tracking-wider transition-all duration-300 shadow-sm"
                                onClick={() => setIsGeneratorOpen(true)}
                            >
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                Ai Assist
                            </Button>
                        </div>
                        <div className="aspect-[16/9] w-full rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted transition-colors relative group" onClick={() => setIsEditorOpen(true)}>
                            {uploading && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 rounded-lg">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            )}
                            {images.length > 0 ? (
                                <div className="relative w-full h-full p-2 bg-zinc-50/50">
                                    <img src={images[0]} alt="Thumbnail" className="w-full h-full object-contain rounded-md" />
                                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="h-8 w-8 rounded-full bg-white shadow-md border-zinc-200 hover:bg-blue-50 hover:text-blue-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setGeneratorInitialImage(images[0]);
                                                setIsGeneratorOpen(true);
                                            }}
                                            title="Magic Branding"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="h-8 w-8 rounded-full bg-white shadow-md border-zinc-200 hover:bg-zinc-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditorOpen(true);
                                            }}
                                            title="Edit Image"
                                        >
                                            <Pencil className="w-4 h-4 text-zinc-600" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="h-8 w-8 rounded-full bg-white shadow-md border-zinc-200 hover:bg-red-50 hover:text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImages([]);
                                            }}
                                            title="Remove Image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-center px-4">
                                    <div className="p-3 bg-muted rounded-full">
                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Open Image Studio</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Upload or brand your service photo</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Options */}
                <div className="space-y-6">
                    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Organization</h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Category</Label>
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Input
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="h-10 text-sm"
                                            placeholder="e.g. Health & Beauty"
                                            list="category-suggestions"
                                        />
                                        <datalist id="category-suggestions">
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat.name} />
                                            ))}
                                        </datalist>
                                        {!categories.some(c => c.name.toLowerCase() === category.toLowerCase()) && category.trim() !== "" && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 italic">
                                                <PlusCircle className="w-3 h-3" />
                                                New
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Suggested: {categories.slice(0, 3).map(c => c.name).join(", ")}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Service Type</Label>
                                <Input
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="e.g. Automation, Consulting"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Specific type of service (shows as 'Type' in list).</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium text-foreground">Brand Association</Label>
                                <Input
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="h-10 text-sm"
                                    placeholder="e.g. Premium Hub"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-semibold text-foreground">Service Availability</h3>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                                <Label className="text-sm font-medium">Available Online</Label>
                                <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-normal">
                                Toggle visibility for bookings. Offline services will not be visible to customers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            <ImageGeneratorModal
                isOpen={isGeneratorOpen}
                onClose={() => {
                    setIsGeneratorOpen(false);
                    setGeneratorInitialImage(undefined);
                }}
                onImageSelect={(imageUrl) => setImages([imageUrl])}
                serviceName={name}
                serviceDescription={description}
                initialImage={generatorInitialImage}
            />

            <ImageEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                imageUrl={images[0]}
                onSave={(newUrl) => setImages([newUrl])}
                businessId={businessId}
            />
        </form>
    )
}
