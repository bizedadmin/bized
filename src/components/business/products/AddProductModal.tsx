"use client"

import { useState, useRef } from "react"
import {
    X,
    Upload,
    Loader2,
    Plus,
    ChevronLeft,
    MoreVertical,
    Image as ImageIcon,
    PlusCircle,
    Info
} from "lucide-react"
import { AddCategoryModal } from "./AddCategoryModal"
import { useEffect } from "react"
import { Switch } from "@/components/ui/switch"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
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

interface AddProductModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    businessId: string
}

export function AddProductModal({ isOpen, onClose, onSuccess, businessId }: AddProductModalProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [type, setType] = useState<"Product" | "Service">("Product")
    const [category, setCategory] = useState("")
    const [price, setPrice] = useState("")
    const [cost, setCost] = useState("")
    const [discount, setDiscount] = useState("0")
    const [tax, setTax] = useState("16") // Default 16% as an example
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

    useEffect(() => {
        if (isOpen && businessId) {
            fetchCategories()
        }
    }, [isOpen, businessId])

    const fetchCategories = async () => {
        try {
            const res = await fetch(`/api/categories?businessId=${businessId}`)
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !category || !price) return

        setLoading(true)
        try {
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
                    image: images,
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
                    status: isOnline ? "active" : "draft"
                })
            })

            if (res.ok) {
                onSuccess()
                handleClose()
            }
        } catch (error) {
            console.error("Error creating product:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setName("")
        setType("Product")
        setCategory("")
        setPrice("")
        setCost("")
        setDiscount("0")
        setTax("16")
        setUnit("")
        setSku("")
        setMpn("")
        setBrand("")
        setIsOnline(true)
        setDescription("")
        setUrl("")
        setImages([])
        onClose()
    }

    const handleImageUploadTrigger = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("businessId", businessId)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()
                setImages(prev => [...prev, data.url])
            } else {
                console.error("Upload failed")
            }
        } catch (error) {
            console.error("Error uploading file:", error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-background">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <DialogTitle className="text-lg font-medium">Add {type.toLowerCase()}</DialogTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* The X button is handled by DialogContent built-in close button */}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-0 flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex border-b border-border">
                            {/* Main Context - LEFT */}
                            <div className="flex-1 p-6 space-y-6 border-r border-border min-w-0">
                                <div className="space-y-4">
                                    <div className="aspect-[4/3] w-32 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors relative" onClick={handleImageUploadTrigger}>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-lg">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            </div>
                                        )}
                                        {images.length > 0 ? (
                                            <div className="relative w-full h-full p-1">
                                                <img src={images[0]} alt="Thumbnail" className="w-full h-full object-cover rounded-md" />
                                                {images.length > 1 && (
                                                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                        +{images.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5 text-center px-2">
                                                <Upload className="w-5 h-5 text-muted-foreground" />
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Upload Image (JPG, PNG, or GIF)</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product name*</Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value.slice(0, 58))}
                                            className="h-10 text-sm"
                                            placeholder="Enter name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-end">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                                            <span className="text-[10px] text-muted-foreground">{description.length}/1,000</span>
                                        </div>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                                            className="min-h-[120px] text-sm resize-none"
                                            placeholder="Describe your product..."
                                        />
                                    </div>

                                    {/* Financials Grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price*</Label>
                                            <Input
                                                type="number"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="h-10 text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost</Label>
                                            <Input
                                                type="number"
                                                value={cost}
                                                onChange={(e) => setCost(e.target.value)}
                                                className="h-10 text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount (%)</Label>
                                            <Input
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(e.target.value)}
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</Label>
                                            <Input
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                placeholder="e.g. piece, kg, hour"
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TAX (%)*</Label>
                                            <Select value={tax} onValueChange={setTax}>
                                                <SelectTrigger className="h-10 text-sm">
                                                    <SelectValue placeholder="Select tax rate" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">0 %</SelectItem>
                                                    <SelectItem value="8">8 %</SelectItem>
                                                    <SelectItem value="15">15 %</SelectItem>
                                                    <SelectItem value="16">16 % (Default)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Inventory & SEO - Collapsible or just space out */}
                                    <div className="pt-4 border-t border-border mt-6">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU</Label>
                                                <Input value={sku} onChange={(e) => setSku(e.target.value)} className="h-9 text-xs" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MPN</Label>
                                                <Input value={mpn} onChange={(e) => setMpn(e.target.value)} className="h-9 text-xs" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brand</Label>
                                                <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="h-9 text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Context - RIGHT */}
                            <div className="w-[280px] bg-muted/10 flex-shrink-0 flex flex-col">
                                <div className="p-6 space-y-8">
                                    {/* Availability */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-sm font-semibold text-foreground">Product availability</h3>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                            <Label className="text-sm font-medium">Online Store</Label>
                                            <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Once enabled, the product will appear in your Online Store ready to be ordered. <a href="#" className="underline font-medium text-blue-600">Learn more.</a>
                                        </p>
                                    </div>

                                    {/* Collections/Categories */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-foreground">Collections</h3>
                                            <button
                                                type="button"
                                                onClick={() => setIsCategoryModalOpen(true)}
                                                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                                            >
                                                Add Category
                                            </button>
                                        </div>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="h-10 text-sm">
                                                <SelectValue placeholder="Nothing selected" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[11px] text-muted-foreground">
                                            Group your products into collections to make it easier to find.
                                        </p>
                                    </div>

                                    {/* Type Selector (Moved here to save space on main side) */}
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Offering Type</Label>
                                        <Select value={type} onValueChange={(v: "Product" | "Service") => setType(v)}>
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Product">Product</SelectItem>
                                                <SelectItem value="Service">Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Replaces Save Button */}
                    <div className="px-6 py-4 flex items-center justify-end gap-3 bg-background border-t border-border shrink-0">
                        <Button type="button" variant="outline" onClick={handleClose} className="h-10 px-6 font-medium">
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !name || !price}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-10 font-bold shadow-sm transition-all active:scale-95"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Save
                        </Button>
                    </div>
                </form>

            </DialogContent>

            <AddCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                businessId={businessId}
                onSuccess={(newCat) => {
                    setCategories([...categories, newCat])
                    setCategory(newCat.name)
                }}
            />
        </Dialog>
    )
}
