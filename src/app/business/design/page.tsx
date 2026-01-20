"use client"

import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, ShoppingBag, FileText, Smartphone, Edit, ArrowRight, Palette, Type, Check } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { BusinessProfile } from "@/components/business/business-profile"
import { cn } from "@/lib/utils"
import { ColorPicker } from "@/components/ui/color-picker"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Wand2, User, ChevronDown } from "lucide-react"


// Mock File Uploader Component
const FileUploader = ({ label, onImageSelected, currentImage }: { label: string, onImageSelected: (url: string) => void, currentImage?: string }) => {
    return (
        <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</Label>
            <div className="border border-dashed border-zinc-300 rounded-xl p-6 bg-zinc-50 text-center hover:bg-zinc-100 transition-colors relative group">
                {currentImage ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white shadow-sm">
                        <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" onClick={() => onImageSelected("")}>Remove</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="text-sm font-medium text-zinc-600">Drag a file here or click to select one</div>
                        <div className="text-xs text-zinc-400">File should not exceed 10mb.</div>
                        <Input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    // Mock upload by reading as data URL for now
                                    const reader = new FileReader()
                                    reader.onload = (e) => {
                                        if (e.target?.result) onImageSelected(e.target.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                }
                            }}
                        />
                    </div>
                )}
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-zinc-600">
                <Wand2 className="w-3.5 h-3.5" /> Generate image
            </Button>
        </div>
    )
}


// Layout options with icons and descriptions
const DESIGN_OPTIONS = [
    {
        id: "profile",
        label: "Storefront",
        description: "Main profile page for your business",
        icon: Store,
        color: "text-orange-600",
        bg: "bg-orange-100 dark:bg-orange-900/20",
        borderHover: "hover:border-orange-500",
    },
    {
        id: "my-profile",
        label: "My Profile",
        description: "Your personal professional profile",
        icon: User,
        color: "text-green-600",
        bg: "bg-green-100 dark:bg-green-900/20",
        borderHover: "hover:border-green-500",
        isUser: true,
    },
    {
        id: "bookings",
        label: "Bookings",
        description: "Service booking & appointments",
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/20",
        borderHover: "hover:border-blue-500",
    },
    {
        id: "shop",
        label: "Shop",
        description: "Online store product listing",
        icon: ShoppingBag,
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/20",
        borderHover: "hover:border-blue-500",
    },
    {
        id: "quote",
        label: "Quote",
        description: "Request for quote forms",
        icon: FileText,
        color: "text-purple-600",
        bg: "bg-purple-100 dark:bg-purple-900/20",
        borderHover: "hover:border-purple-500",
    },
]

const THEME_COLORS = [
    { name: "Black", value: "#1f2937" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Green", value: "#22c55e" },
    { name: "Teal", value: "#06b6d4" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
]

const FONT_OPTIONS = [
    {
        id: "system",
        name: "Instagram Classic",
        description: "Clean, native, and familiar",
        style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
    },
    {
        id: "inter",
        name: "Modern Sans",
        description: "Geometric and professional",
        style: { fontFamily: 'Inter, sans-serif' }
    },
    {
        id: "serif",
        name: "Elegant Serif",
        description: "Sophisticated and trustworthy",
        style: { fontFamily: 'Georgia, serif' }
    },
    {
        id: "mono",
        name: "Technical Mono",
        description: "Bold and industrial",
        style: { fontFamily: 'Courier New, monospace' }
    },
]

export default function DesignPage() {
    const [selectedType, setSelectedType] = useState<string>("profile")
    const [businessData, setBusinessData] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Fetch business data for preview
    useEffect(() => {
        const stored = localStorage.getItem("selectedBusiness")
        if (stored) {
            const parsed = JSON.parse(stored)
            fetchPreviewData(parsed._id)
        }

        // Refetch on window focus to get updates from builder
        const onFocus = () => {
            const stored = localStorage.getItem("selectedBusiness")
            if (stored) {
                const parsed = JSON.parse(stored)
                fetchPreviewData(parsed._id)
            }
        }
        window.addEventListener('focus', onFocus)
        return () => window.removeEventListener('focus', onFocus)
    }, [])

    const fetchPreviewData = async (id: string) => {
        try {
            // Fetch Business
            const bRes = await fetch(`/api/businesses/${id}`, { cache: 'no-store' })
            if (bRes.ok) {
                const business = await bRes.json()
                setBusinessData(business)

                // Fetch Products
                const pRes = await fetch(`/api/products?businessId=${id}`)
                if (pRes.ok) {
                    const pData = await pRes.json()
                    setProducts(pData)
                }

                // Fetch Services
                const sRes = await fetch(`/api/business/services?businessId=${id}`)
                if (sRes.ok) {
                    const sData = await sRes.json()
                    setServices(sData)
                }
            }

            // Fetch User Profile
            const uRes = await fetch(`/api/profile`, { cache: 'no-store' })
            if (uRes.ok) {
                const user = await uRes.json()
                setUserData(user)
            }
        } catch (error) {
            console.error("Failed to fetch data for preview", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStyleUpdate = (field: string, value: string) => {
        setBusinessData((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden bg-gray-50 rounded-2xl border border-zinc-200 shadow-sm">
            {/* Left Side - Options Grid */}
            <div className="w-full md:w-[60%] lg:w-[500px] xl:w-[600px] flex flex-col border-r bg-white shadow-sm z-10">
                <header className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0">
                    <div>
                        <h1 className="font-semibold text-lg">Design</h1>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Choose a page to customize
                        </p>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    <div className="grid grid-cols-1 gap-4">
                        {DESIGN_OPTIONS.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => setSelectedType(option.id)}
                                className={cn(
                                    "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer group bg-white dark:bg-zinc-900",
                                    selectedType === option.id
                                        ? "bg-white border-transparent shadow-sm dark:bg-zinc-800 dark:border-zinc-700"
                                        : "bg-white border-transparent hover:border-zinc-200 dark:bg-zinc-900 dark:hover:border-zinc-800 shadow-sm"
                                )}
                            >
                                {/* Hide header if selected for style OR profile (they handle their own headers) */}
                                {(selectedType !== option.id || (option.id !== 'style')) && (
                                    <div className="flex items-center w-full">
                                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mr-4", option.bg)}>
                                            <option.icon className={cn("w-6 h-6", option.color)} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{option.label}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                                        </div>

                                        {/* Edit Button for Pages (not Style) */}
                                        {option.id !== 'style' && (
                                            <Link href={`/business/design/page-builder/${option.id}${option.isUser ? '' : `?businessId=${businessData?._id}`}`}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={cn(
                                                        "h-9 w-9 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                                        selectedType === option.id ? "text-zinc-900 dark:text-white" : "text-gray-400"
                                                    )}
                                                    title="Open Page Builder"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        )}

                                        {/* Chevron for Profile/Style when not selected */}
                                        {(option.id === 'style') && (
                                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                                        )}

                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Preview */}
            <div className="hidden md:flex flex-1 bg-gray-100 items-center justify-center p-8 overflow-hidden relative">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative">
                    <div className="absolute -top-12 left-0 right-0 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            <Smartphone className="w-3 h-3" /> Live Preview: {selectedType === 'profile' ? 'Profile' : selectedType}
                        </div>
                    </div>

                    {/* Device Frame - Compact Preview */}
                    <div className="w-[320px] h-[680px] bg-white rounded-[45px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[10px] border-[#151515] overflow-hidden relative group box-content flex-shrink-0">
                        {/* Dynamic Island / Notch */}
                        <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-[#151515] rounded-[14px] z-[101] pointer-events-none"></div>

                        <div className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
                            {loading && (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    Loading preview...
                                </div>
                            )}

                            {!loading && (businessData || userData) && (
                                <BusinessProfile
                                    business={selectedType === 'my-profile' ? userData : businessData}
                                    products={selectedType === 'my-profile' ? [] : products}
                                    services={selectedType === 'my-profile' ? [] : services}
                                    pageType={selectedType === 'my-profile' ? 'profile' : (selectedType === 'profile' ? 'profile' : selectedType as any)}
                                    isPreview={true}
                                />
                            )}

                            {!loading && !businessData && (
                                <div className="h-full flex items-center justify-center text-center p-6">
                                    <p className="text-sm text-gray-500">
                                        Unable to load business data for preview.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


