"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Search, Globe, Share2, ChevronRight, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SeoSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState("search")

    const [seoData, setSeoData] = useState({
        title: "",
        description: "",
        keywords: "",
        ogImage: "",
    })
    const [originalSeoData, setOriginalSeoData] = useState<any>(null)
    const [businessSlug, setBusinessSlug] = useState("your-slug")

    const navItems = [
        { id: "search", label: "Search Listing", icon: Search },
        { id: "social", label: "Social Preview", icon: Share2 },
        { id: "preview", label: "Live Preview", icon: Eye },
    ]

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/businesses')
                if (!res.ok) throw new Error('Failed to fetch business')
                const businesses = await res.json()
                const biz = businesses[0]
                if (biz) {
                    setBusinessId(biz._id)
                    setBusinessSlug(biz.slug)

                    // Use existing name/description as fallback if SEO fields aren't set
                    const loadedSeo = {
                        title: biz.configuration?.seo?.title || biz.name || "",
                        description: biz.configuration?.seo?.description || biz.description || "",
                        keywords: biz.configuration?.seo?.keywords || "",
                        ogImage: biz.configuration?.seo?.ogImage || biz.logo || "",
                    }
                    setSeoData(loadedSeo)
                    setOriginalSeoData(loadedSeo)
                }
            } catch (error) {
                console.error("Error loading SEO settings:", error)
                toast.error("Failed to load SEO settings")
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const hasChanges = JSON.stringify(seoData) !== JSON.stringify(originalSeoData)

    const handleSave = async () => {
        if (!businessId) return

        setSaving(true)
        try {
            const res = await fetch(`/api/businesses/${businessId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    configuration: {
                        seo: seoData
                    }
                })
            })

            if (!res.ok) throw new Error("Failed to update SEO settings")

            toast.success("SEO settings saved successfully")
            setOriginalSeoData(seoData)
        } catch (error) {
            console.error("Error saving SEO settings:", error)
            toast.error("Failed to save SEO settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        SEO & Meta Tags
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Optimize how your business appears on search engines and social media.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving || !hasChanges}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                <aside className="w-full md:w-56 shrink-0 flex md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-2 no-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                activeSection === item.id
                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white",
                                "w-auto md:w-full justify-start"
                            )}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                            {activeSection === item.id && <ChevronRight className="w-4 h-4 ml-auto hidden md:block text-gray-400" />}
                        </button>
                    ))}
                </aside>

                <div className="flex-1 w-full min-w-0">
                    {activeSection === "search" && (
                        <Accordion type="single" collapsible defaultValue="search-listing" className="w-full">
                            <AccordionItem value="search-listing" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">Search Engine Listing</span>
                                        <span className="text-sm text-muted-foreground font-normal">How your business appears in Google search results.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <div className="space-y-4 pt-1">
                                        <div className="space-y-2">
                                            <Label htmlFor="seo-title">Meta Title</Label>
                                            <Input
                                                id="seo-title"
                                                value={seoData.title}
                                                onChange={(e) => setSeoData(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Enter page title"
                                            />
                                            <div className="flex justify-between items-center text-[11px]">
                                                <p className="text-zinc-500">Recommended length: 50-60 characters.</p>
                                                <p className={cn(seoData.title.length > 60 ? "text-red-500" : "text-zinc-500")}>
                                                    {seoData.title.length} characters
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="seo-desc">Meta Description</Label>
                                            <Textarea
                                                id="seo-desc"
                                                value={seoData.description}
                                                onChange={(e) => setSeoData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Enter meta description"
                                                rows={4}
                                            />
                                            <div className="flex justify-between items-center text-[11px]">
                                                <p className="text-zinc-500">Recommended length: 150-160 characters.</p>
                                                <p className={cn(seoData.description.length > 160 ? "text-red-500" : "text-zinc-500")}>
                                                    {seoData.description.length} characters
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="seo-keywords">Keywords (Comma separated)</Label>
                                            <Input
                                                id="seo-keywords"
                                                value={seoData.keywords}
                                                onChange={(e) => setSeoData(prev => ({ ...prev, keywords: e.target.value }))}
                                                placeholder="e.g. fashion, store, online shop"
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {activeSection === "social" && (
                        <Accordion type="single" collapsible defaultValue="social-appearance" className="w-full">
                            <AccordionItem value="social-appearance" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">Social Media Appearance</span>
                                        <span className="text-sm text-muted-foreground font-normal">Control your links when shared on Facebook, Twitter, and WhatsApp.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <div className="space-y-6 pt-1">
                                        <div className="space-y-2">
                                            <Label>OG Preview Image</Label>
                                            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                                                {seoData.ogImage ? (
                                                    <div className="relative group">
                                                        <img src={seoData.ogImage} alt="OG Preview" className="max-h-40 rounded-lg shadow-sm" />
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => setSeoData(prev => ({ ...prev, ogImage: "" }))}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                            <Globe className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">No image uploaded</p>
                                                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Recommended: 1200 x 630 px</p>
                                                        </div>
                                                    </>
                                                )}
                                                <Button variant="outline" size="sm">Upload Image</Button>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {activeSection === "preview" && (
                        <div className="space-y-6">
                            <Card className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Google Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm space-y-1 border border-zinc-100 dark:border-zinc-800 max-w-2xl">
                                        <div className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                                            bized.app/{businessSlug} <span className="text-[10px]">▼</span>
                                        </div>
                                        <div className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-1 font-medium">
                                            {seoData.title || "Your Business Title"}
                                        </div>
                                        <div className="text-[14px] text-zinc-600 dark:text-zinc-300 leading-normal line-clamp-2">
                                            {seoData.description || "Enter a description to see how it looks in search results."}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Social Share Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 max-w-md">
                                        <div className="aspect-[1.91/1] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 relative">
                                            {seoData.ogImage ? (
                                                <img src={seoData.ogImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Globe className="w-12 h-12 opacity-20" />
                                            )}
                                        </div>
                                        <div className="p-4 bg-[#f0f2f5] dark:bg-[#3a3b3c]">
                                            <div className="text-[12px] text-zinc-500 uppercase font-medium">bized.app</div>
                                            <div className="text-[16px] font-bold text-zinc-900 dark:text-white line-clamp-1">
                                                {seoData.title || "Your Business Name"}
                                            </div>
                                            <div className="text-[14px] text-zinc-600 dark:text-zinc-300 line-clamp-1">
                                                {seoData.description || "Your business description."}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
