"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Type, Smartphone, Check, Layout, Sparkles, Image as ImageIcon, Wand2, Globe, Eye, Share2, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { BusinessProfile } from "@/components/business/business-profile"
import { cn } from "@/lib/utils"
import { ColorPicker } from "@/components/ui/color-picker"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

// Mock File Uploader Component
const FileUploader = ({ label, onImageSelected, currentImage, circle }: { label: string, onImageSelected: (url: string) => void, currentImage?: string, circle?: boolean }) => {
    return (
        <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</Label>
            <div className={cn(
                "border border-dashed border-zinc-300 p-6 bg-zinc-50 text-center hover:bg-zinc-100 transition-colors relative group",
                circle ? "rounded-full aspect-square w-32 mx-auto flex items-center justify-center p-2" : "rounded-xl"
            )}>
                {currentImage ? (
                    <div className={cn(
                        "relative w-full overflow-hidden bg-white shadow-sm transition-all animate-in zoom-in-50 duration-300",
                        circle ? "rounded-full aspect-square" : "h-32 rounded-lg"
                    )}>
                        <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" onClick={() => onImageSelected("")}>Remove</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <div className={cn("bg-white rounded-full shadow-sm flex items-center justify-center", circle ? "w-10 h-10" : "p-3")}>
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                        </div>
                        {!circle && (
                            <>
                                <div className="text-sm font-medium text-zinc-600">Drag a file here or click to select one</div>
                                <div className="text-xs text-zinc-400">File should not exceed 10mb.</div>
                            </>
                        )}
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
        id: "nunito",
        name: "Nunito (Calday Style)",
        description: "Rounded, friendly, and modern",
        style: { fontFamily: 'var(--font-nunito), sans-serif' }
    },
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

export default function StylePage() {
    const [businessData, setBusinessData] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const router = useRouter()
    const [isDirty, setIsDirty] = useState(false)
    const [showExitDialog, setShowExitDialog] = useState(false)
    const [previewMode, setPreviewMode] = useState<"mobile" | "seo">("mobile")

    useEffect(() => {
        const stored = localStorage.getItem("selectedBusiness")
        if (stored) {
            const parsed = JSON.parse(stored)
            fetchPreviewData(parsed._id)
        }
    }, [])

    // Handle browser back/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])

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
        } catch (error) {
            console.error("Failed to fetch data for preview", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = (field: string, value: any) => {
        setBusinessData((prev: any) => ({
            ...prev,
            [field]: value
        }))
        setIsDirty(true)
    }

    const handleBack = () => {
        if (isDirty) {
            setShowExitDialog(true)
        } else {
            router.push('/business/design')
        }
    }

    const handleSave = async () => {
        if (!businessData?._id) return

        setSaving(true)
        try {
            const res = await fetch(`/api/businesses/${businessData._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    themeColor: businessData.themeColor,
                    secondaryColor: businessData.secondaryColor,
                    buttonColor: businessData.buttonColor,
                    fontFamily: businessData.fontFamily,
                    glassmorphism: businessData.glassmorphism,
                    borderRadius: businessData.borderRadius,
                    name: businessData.name,
                    description: businessData.description,
                    logo: businessData.logo,
                    image: businessData.image,
                })
            })

            if (res.ok) {
                toast.success("Branding settings saved successfully")
                setIsDirty(false)
                // Update local storage
                const stored = localStorage.getItem("selectedBusiness")
                if (stored) {
                    const parsed = JSON.parse(stored)
                    localStorage.setItem("selectedBusiness", JSON.stringify({ ...parsed, ...businessData }))
                }
            } else {
                toast.error("Failed to save branding settings")
            }
        } catch (error) {
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-7rem)] overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {/* Left Side - Style Controls */}
            <div className="w-full md:w-[60%] lg:w-[450px] flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={handleBack}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="font-semibold text-lg">Style & Branding</h1>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                Customize your brand identity
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-zinc-900 dark:bg-white dark:text-zinc-900"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </header>

                <div className="flex-1 overflow-y-auto p-4">
                    <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="profile">
                        {/* Business Profile */}
                        <AccordionItem value="profile" className="border-none bg-zinc-50 dark:bg-zinc-900/50 rounded-xl overflow-hidden shadow-sm">
                            <AccordionTrigger className="hover:no-underline px-4 py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-lg">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-zinc-900 dark:text-white">Business Profile</div>
                                        <div className="text-[10px] text-zinc-500 font-medium">Logo, header and business info</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-6 space-y-6">
                                <FileUploader
                                    label="Header Image"
                                    currentImage={businessData?.image}
                                    onImageSelected={(url) => handleUpdate('image', url)}
                                />

                                <FileUploader
                                    label="Avatar (Logo)"
                                    circle
                                    currentImage={businessData?.logo}
                                    onImageSelected={(url) => handleUpdate('logo', url)}
                                />

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Name</Label>
                                    <Input
                                        value={businessData?.name || ""}
                                        onChange={(e) => handleUpdate('name', e.target.value)}
                                        className="h-11 rounded-xl bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Bio</Label>
                                    <Textarea
                                        value={businessData?.description || ""}
                                        onChange={(e) => handleUpdate('description', e.target.value)}
                                        className="min-h-[100px] rounded-xl bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 resize-none"
                                        placeholder="Describe your business..."
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Brand Colors */}
                        <AccordionItem value="brand" className="border-none bg-zinc-50 dark:bg-zinc-900/50 rounded-xl overflow-hidden shadow-sm">
                            <AccordionTrigger className="hover:no-underline px-4 py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                        <Palette className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-zinc-900 dark:text-white">Brand Colors</div>
                                        <div className="text-[10px] text-zinc-500 font-medium">Primary and background tones</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Primary Theme Color</Label>
                                        <ColorPicker
                                            value={businessData?.themeColor || "#1f2937"}
                                            onChange={(c) => handleUpdate('themeColor', c)}
                                            presets={THEME_COLORS}
                                            className="w-full"
                                        />
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Used for primary actions, headers, and accents.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Secondary Background</Label>
                                        <ColorPicker
                                            value={businessData?.secondaryColor || "#f3f4f6"}
                                            onChange={(c) => handleUpdate('secondaryColor', c)}
                                            presets={[
                                                { name: "Light Gray", value: "#f3f4f6" },
                                                { name: "White", value: "#ffffff" },
                                                { name: "Wash Blue", value: "#f0f4f8" },
                                                { name: "Cream", value: "#fdf8f1" },
                                                { name: "Dark", value: "#18181b" },
                                            ]}
                                            className="w-full"
                                        />
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Used for section backgrounds and card surfaces.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Action Button Color</Label>
                                        <ColorPicker
                                            value={businessData?.buttonColor || businessData?.themeColor || "#1f2937"}
                                            onChange={(c) => handleUpdate('buttonColor', c)}
                                            presets={THEME_COLORS}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Typography */}
                        <AccordionItem value="typography" className="border-none bg-zinc-50 dark:bg-zinc-900/50 rounded-xl overflow-hidden shadow-sm">
                            <AccordionTrigger className="hover:no-underline px-4 py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                                        <Type className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-zinc-900 dark:text-white">Typography</div>
                                        <div className="text-[10px] text-zinc-500 font-medium">Font pairings and text styles</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-6">
                                <div className="grid grid-cols-1 gap-3">
                                    {FONT_OPTIONS.map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => handleUpdate('fontFamily', font.id)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left bg-white dark:bg-zinc-800",
                                                businessData?.fontFamily === font.id
                                                    ? "border-zinc-900 dark:border-white shadow-md active:scale-95"
                                                    : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                            )}
                                        >
                                            <div>
                                                <div className="font-bold text-zinc-900 dark:text-white" style={font.style}>{font.name}</div>
                                                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{font.description}</div>
                                            </div>
                                            {businessData?.fontFamily === font.id && (
                                                <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white dark:text-zinc-900" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Visual Style */}
                        <AccordionItem value="visual" className="border-none bg-zinc-50 dark:bg-zinc-900/50 rounded-xl overflow-hidden shadow-sm">
                            <AccordionTrigger className="hover:no-underline px-4 py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-zinc-900 dark:text-white">Visual Style</div>
                                        <div className="text-[10px] text-zinc-500 font-medium">UI animations and effects</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-6 space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                            <Layout className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">Glassmorphism</div>
                                            <div className="text-[10px] text-zinc-500">Frosted glass effects</div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={businessData?.glassmorphism || false}
                                        onCheckedChange={(checked) => handleUpdate('glassmorphism', checked)}
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Border Radius</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'none', label: 'None', preview: 'rounded-none' },
                                            { id: 'md', label: 'Medium', preview: 'rounded-md' },
                                            { id: 'xl', label: 'Large', preview: 'rounded-xl' },
                                            { id: 'full', label: 'Full', preview: 'rounded-full' },
                                        ].map((r) => (
                                            <button
                                                key={r.id}
                                                onClick={() => handleUpdate('borderRadius', r.id)}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                                    businessData?.borderRadius === r.id
                                                        ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800"
                                                        : "border-transparent bg-white dark:bg-zinc-900 hover:border-zinc-100 dark:hover:border-zinc-800"
                                                )}
                                            >
                                                <div className={cn("w-6 h-6 border-2 border-zinc-300 dark:border-zinc-600", r.preview)}></div>
                                                <span className="text-[9px] font-bold uppercase">{r.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>

            {/* Right Side - Live Preview */}
            <div className="hidden md:flex flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center p-8 overflow-hidden relative">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="relative w-full h-full flex flex-col items-center">
                    <div className="mb-12">
                        <div className="inline-flex items-center p-1 bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setPreviewMode("mobile")}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                    previewMode === "mobile"
                                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                )}
                            >
                                <Smartphone className="w-3 h-3" /> Mobile App
                            </button>
                            <button
                                onClick={() => setPreviewMode("seo")}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                    previewMode === "seo"
                                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                )}
                            >
                                <Search className="w-3 h-3" /> SEO & Social
                            </button>
                        </div>
                    </div>

                    {previewMode === "mobile" ? (
                        <div className="relative">
                            {/* Device Frame */}
                            <div className="w-[320px] h-[680px] bg-white dark:bg-zinc-900 rounded-[45px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[10px] border-zinc-900 dark:border-zinc-800 overflow-hidden relative group box-content">
                                {/* Dynamic Island */}
                                <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-zinc-900 dark:bg-zinc-800 rounded-[14px] z-[101] pointer-events-none"></div>

                                <div className="h-full w-full overflow-y-auto scrollbar-none">
                                    {businessData && (
                                        <BusinessProfile
                                            business={businessData}
                                            products={products}
                                            services={services}
                                            pageType="profile"
                                            isPreview={true}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Floating Indicators */}
                            <div className="absolute -right-24 top-1/4 space-y-4">
                                <Card className="p-3 w-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 shadow-xl animate-bounce-slow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-[10px] font-bold uppercase text-zinc-500">Active Theme</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: businessData?.themeColor || '#1f2937' }}></div>
                                        <span className="text-xs font-semibold">{businessData?.themeColor || '#1f2937'}</span>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Google Search Result</h3>
                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                                    <div className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                                        bized.app/{businessData?.slug || "your-slug"} <span className="text-[10px]">▼</span>
                                    </div>
                                    <div className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-1 font-medium">
                                        {businessData?.configuration?.seo?.title || businessData?.name || "Your Business Title"}
                                    </div>
                                    <div className="text-[14px] text-zinc-600 dark:text-zinc-300 leading-normal line-clamp-2">
                                        {businessData?.configuration?.seo?.description || businessData?.description || "Your business description will appear here in search results."}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Social Media Share</h3>
                                <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mx-auto max-w-md">
                                    <div className="aspect-[1.91/1] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 relative">
                                        {(businessData?.configuration?.seo?.ogImage || businessData?.logo || businessData?.image) ? (
                                            <img
                                                src={businessData?.configuration?.seo?.ogImage || businessData?.logo || businessData?.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Globe className="w-12 h-12 opacity-20" />
                                        )}
                                    </div>
                                    <div className="p-4 bg-[#f0f2f5] dark:bg-[#3a3b3c]">
                                        <div className="text-[12px] text-zinc-500 uppercase font-medium">bized.app</div>
                                        <div className="text-[16px] font-bold text-zinc-900 dark:text-white line-clamp-1">
                                            {businessData?.configuration?.seo?.title || businessData?.name || "Your Business Name"}
                                        </div>
                                        <div className="text-[14px] text-zinc-600 dark:text-zinc-300 line-clamp-1">
                                            {businessData?.configuration?.seo?.description || businessData?.description || "Your business description."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unsaved Changes Confirmation Dialog */}
            <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Unsaved Changes</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-zinc-600">
                        You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowExitDialog(false)} className="rounded-xl">
                            Stay and Save
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsDirty(false)
                                router.push('/business/design')
                            }}
                            className="rounded-xl bg-red-600 hover:bg-red-700"
                        >
                            Leave anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
