"use client"

import { useState } from "react"
import { Search, Globe, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function SeoSettingsPage() {
    const [isSaving, setIsSaving] = useState(false)
    const [seoData, setSeoData] = useState({
        title: "Bized | All-in-One Business Operating System",
        description: "Bized empowers businesses to build their online presence, manage operations, and handle finances in one unified platform.",
        keywords: "business, platform, management, storefront, bized",
        ogImage: "",
    })

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
        toast.success("SEO settings updated successfully")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">SEO & Meta Tags</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Optimize how your business appears on search engines and social media.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Search className="w-5 h-5 text-zinc-400" />
                                Search Engine Listing
                            </CardTitle>
                            <CardDescription>
                                These tags help search engines like Google understand and rank your page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="seo-title">Meta Title</Label>
                                <Input
                                    id="seo-title"
                                    value={seoData.title}
                                    onChange={(e) => setSeoData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter page title"
                                />
                                <p className="text-[11px] text-zinc-500">Recommended length: 50-60 characters.</p>
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
                                <p className="text-[11px] text-zinc-500">Recommended length: 150-160 characters.</p>
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Share2 className="w-5 h-5 text-zinc-400" />
                                Social Media Appearance (Open Graph)
                            </CardTitle>
                            <CardDescription>
                                Control how your links look when shared on platforms like Facebook, Twitter, and WhatsApp.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>OG Preview Image</Label>
                                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">No image uploaded</p>
                                        <p className="text-xs text-zinc-500">Recommended size: 1200 x 630 pixels.</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-2">Upload Image</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-zinc-50 dark:bg-zinc-900 border-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Google Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm space-y-1 border border-zinc-100 dark:border-zinc-700">
                                <div className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                                    bized.app/your-slug <span className="text-[10px]">▼</span>
                                </div>
                                <div className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-1">
                                    {seoData.title}
                                </div>
                                <div className="text-[14px] text-zinc-600 dark:text-zinc-300 leading-normal line-clamp-2">
                                    {seoData.description || "Enter a description to see how it looks in search results."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#f0f2f5] dark:bg-[#18191a] border-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Social Share Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                <div className="aspect-[1.91/1] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300">
                                    <Globe className="w-12 h-12 opacity-20" />
                                </div>
                                <div className="p-4 space-y-1">
                                    <div className="text-[12px] text-zinc-500 uppercase font-medium">bized.app</div>
                                    <div className="text-[16px] font-bold text-zinc-900 dark:text-white line-clamp-1">{seoData.title}</div>
                                    <div className="text-[14px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{seoData.description}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
