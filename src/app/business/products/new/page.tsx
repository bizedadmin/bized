"use client"

import { useState, useRef, useEffect } from "react"
import {
    X,
    Upload,
    Loader2,
    ChevronLeft,
    PlusCircle,
    Info,
    Package,
    Sparkles,
    Wand2
} from "lucide-react"
import { ImageGeneratorModal } from "@/components/ui/image-generator-modal"
import { ImageEditorModal } from "@/components/ui/image-editor-modal"
import { useRouter } from "next/navigation"
import { AddCategoryModal } from "@/components/business/products/AddCategoryModal"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { toast } from "sonner"

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [generatingDescription, setGeneratingDescription] = useState(false)
    const [businessId, setBusinessId] = useState<string | null>(null)

    // Form state
    const [name, setName] = useState("")
    const [type, setType] = useState<"Product" | "Service">("Product")
    const [category, setCategory] = useState("")
    const [price, setPrice] = useState("")
    const [cost, setCost] = useState("")
    const [discount, setDiscount] = useState("0")
    const [tax, setTax] = useState("16")
    const [unit, setUnit] = useState("")
    const [sku, setSku] = useState("")
    const [mpn, setMpn] = useState("")
    const [brand, setBrand] = useState("")
    const [isOnline, setIsOnline] = useState(true)
    const [description, setDescription] = useState("")
    const [url, setUrl] = useState("")
    const [images, setImages] = useState<string[]>([])
    const [categories, setCategories] = useState<{ _id: string, name: string }[]>([])

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // AI & Image Studio state
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const business = JSON.parse(storedBusiness)
            setBusinessId(business._id)
            fetchCategories(business._id)
        }
    }, [])

    const fetchCategories = async (id: string) => {
        try {
            const res = await fetch(`/api/categories?businessId=${id}`)
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const handleGenerateDescription = async () => {
        if (!name) {
            toast.error("Please enter a product name first")
            return
        }

        setGeneratingDescription(true)
        try {
            const res = await fetch("/api/ai/generate-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            })

            if (res.ok) {
                const data = await res.json()
                setDescription(data.description)
                toast.success("Description generated successfully!")
            } else {
                toast.error("Failed to generate description")
            }
        } catch (error) {
            console.error("Error generating description:", error)
            toast.error("Failed to generate description")
        } finally {
            setGeneratingDescription(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !category || !price || !businessId) return

        setLoading(true)
        try {
            // Process images - find any that need uploading (data URLs or external Replicate URLs)
            const processedImages = await Promise.all(images.map(async (img) => {
                if (img.startsWith("data:") || img.includes("replicate.delivery") || img.includes("replicate.com")) {
                    const blob = await fetch(img).then(r => r.blob())
                    const file = new File([blob], `product-image-${Date.now()}.png`, { type: "image/png" })

                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("businessId", businessId)

                    const uploadRes = await fetch("/api/upload", {
                        method: "POST",
                        body: formData
                    })

                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json()
                        return uploadData.url
                    } else {
                        throw new Error("Failed to persist image to cloud")
                    }
                }
                return img
            }))

            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business: businessId,
                    type,
                    name,
                    category,
                    description,
                    url,
                    image: processedImages,
                    sku,
                    mpn,
                    brand,
                    unit,
                    offers: {
                        price: parseFloat(price),
                        cost: cost ? parseFloat(cost) : undefined,
                        discount: parseFloat(discount),
                        tax: parseFloat(tax),
                        priceCurrency: "KES",
                        availability: isOnline ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                    },
                    status: isOnline ? "online" : "offline"
                })
            })

            if (res.ok) {
                router.push("/business/products")
                router.refresh()
            }
        } catch (error) {
            console.error("Error creating product:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUploadTrigger = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            const dataUrl = reader.result as string
            setImages(prev => [...prev, dataUrl])
        }
        reader.readAsDataURL(file)
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-9 w-9 border border-border"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Add {type.toLowerCase()}</h1>
                        <p className="text-sm text-muted-foreground">Fill in the details to create a new offering.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !name || !category || !price}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-sm font-bold"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Save {type}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-sm font-medium">Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Italian Leather Shoes"
                                    className="h-11"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                    <span className="text-[10px] text-muted-foreground">{description.length}/1,000</span>
                                </div>
                                <div className="relative">
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Tell your customers about this product..."
                                        className="min-h-[150px] resize-none leading-relaxed pr-10"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-blue-600"
                                        onClick={handleGenerateDescription}
                                        disabled={generatingDescription}
                                        title="Generate description with AI"
                                    >
                                        {generatingDescription ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                Media & Images
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 font-semibold gap-1.5"
                                    onClick={() => setIsGeneratorOpen(true)}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    AI Visual Assistant
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-muted">
                                    <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-zinc-900"
                                            onClick={() => {
                                                setSelectedImageIndex(index)
                                                setIsEditorOpen(true)
                                            }}
                                        >
                                            <Wand2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleImageUploadTrigger}
                                disabled={uploading}
                                className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors disabled:opacity-50"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                {uploading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                ) : (
                                    <>
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <Upload className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Upload</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic">
                            Tip: High quality square images (1080x1080) work best.
                        </p>
                    </div>

                    {/* Financials Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            Pricing & Inventory
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="price" className="text-sm font-medium">Selling Price (KES) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="h-11 font-medium text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="cost" className="text-sm font-medium">Cost Price</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    placeholder="What it cost you"
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="discount" className="text-sm font-medium">Discount (%)</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="tax" className="text-sm font-medium">Tax Rate (%)</Label>
                                <Select value={tax} onValueChange={setTax}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select tax" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">0% (Tax Exempt)</SelectItem>
                                        <SelectItem value="8">8% (Reduced)</SelectItem>
                                        <SelectItem value="16">16% (Standard)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sku" className="text-xs uppercase tracking-widest text-muted-foreground">SKU</Label>
                                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="STK-001" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="mpn" className="text-xs uppercase tracking-widest text-muted-foreground">MPN</Label>
                                <Input id="mpn" value={mpn} onChange={(e) => setMpn(e.target.value)} placeholder="Part number" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="unit" className="text-xs uppercase tracking-widest text-muted-foreground">Unit</Label>
                                <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. piece" className="h-10" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground">Visibility</h3>
                            <Badge variant={isOnline ? "secondary" : "outline"} className={isOnline ? "bg-green-50 text-green-700 border-green-200" : ""}>
                                {isOnline ? 'Online' : 'Draft'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                            <Label htmlFor="online" className="text-sm font-medium cursor-pointer">Available Online</Label>
                            <Switch id="online" checked={isOnline} onCheckedChange={setIsOnline} />
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            If online, this {type.toLowerCase()} will be visible on your public storefront and searchable by customers.
                        </p>
                    </div>

                    {/* Organization Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-foreground">Categorization</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Collection</Label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(true)}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        NEW CATEGORY
                                    </button>
                                </div>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select collection" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Offering Type</Label>
                                <Select value={type} onValueChange={(v: "Product" | "Service") => setType(v)}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Product">Physical Product</SelectItem>
                                        <SelectItem value="Service">Digital Service</SelectItem>
                                    </SelectContent>
                                </Select>
                                {type === "Service" && (
                                    <p className="text-[11px] text-blue-600 font-medium mt-1 animate-in fade-in slide-in-from-top-1">
                                        Note: This service will be bookable online.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SEO Insights */}
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Info className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">SEO Insight</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Adding a clear <strong>Description</strong> and <strong>Brand</strong> name significantly improves your ranking on Google and help customers find your products.
                        </p>
                    </div>
                </div>
            </form >

            <AddCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                businessId={businessId || ""}
                onSuccess={(newCat) => {
                    setCategories([...categories, newCat])
                    setCategory(newCat.name)
                }}
            />

            <ImageGeneratorModal
                isOpen={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
                onImageSelect={(dataUrl) => {
                    setImages(prev => [...prev, dataUrl])
                }}
                serviceName={name}
                serviceDescription={description}
            />

            <ImageEditorModal
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false)
                    setSelectedImageIndex(null)
                }}
                imageUrl={selectedImageIndex !== null ? images[selectedImageIndex] : ""}
                onSave={(dataUrl) => {
                    if (selectedImageIndex !== null) {
                        const newImages = [...images]
                        newImages[selectedImageIndex] = dataUrl
                        setImages(newImages)
                    }
                }}
            />
        </div >
    )
}
