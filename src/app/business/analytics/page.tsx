"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, BarChart3, Globe, MousePointer2, ChevronRight, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AnalyticsSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState("tracking")

    const [analyticsData, setAnalyticsData] = useState({
        gaId: "",
        fbPixelId: "",
        tagManagerId: "",
        enableHeatmaps: false,
    })
    const [originalData, setOriginalData] = useState<any>(null)

    const navItems = [
        { id: "tracking", label: "Tracking IDs", icon: Activity },
        { id: "pixel", label: "Pixel Settings", icon: MousePointer2 },
        { id: "overview", label: "Overview", icon: BarChart3 },
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
                    const loadedData = {
                        gaId: biz.configuration?.analytics?.gaId || "",
                        fbPixelId: biz.configuration?.analytics?.fbPixelId || "",
                        tagManagerId: biz.configuration?.analytics?.tagManagerId || "",
                        enableHeatmaps: biz.configuration?.analytics?.enableHeatmaps || false,
                    }
                    setAnalyticsData(loadedData)
                    setOriginalData(loadedData)
                }
            } catch (error) {
                console.error("Error loading analytics settings:", error)
                toast.error("Failed to load analytics settings")
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const hasChanges = JSON.stringify(analyticsData) !== JSON.stringify(originalData)

    const handleSave = async () => {
        if (!businessId) return

        setSaving(true)
        try {
            const res = await fetch(`/api/businesses/${businessId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    configuration: {
                        analytics: analyticsData
                    }
                })
            })

            if (!res.ok) throw new Error("Failed to update analytics settings")

            toast.success("Analytics settings saved successfully")
            setOriginalData(analyticsData)
        } catch (error) {
            console.error("Error saving analytics settings:", error)
            toast.error("Failed to save analytics settings")
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
                        Website Analytics
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track your website performance and visitor behavior.
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
                    {activeSection === "tracking" && (
                        <Accordion type="single" collapsible defaultValue="tracking-ids" className="w-full">
                            <AccordionItem value="tracking-ids" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">Tracking Configuration</span>
                                        <span className="text-sm text-muted-foreground font-normal">Connect third-party analytics tools to your store.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <div className="space-y-4 pt-1">
                                        <div className="space-y-2">
                                            <Label htmlFor="ga-id">Google Analytics Measurement ID</Label>
                                            <Input
                                                id="ga-id"
                                                value={analyticsData.gaId}
                                                onChange={(e) => setAnalyticsData(prev => ({ ...prev, gaId: e.target.value }))}
                                                placeholder="G-XXXXXXXXXX"
                                            />
                                            <p className="text-[11px] text-zinc-500">Enable tracking of page views and conversions via GA4.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gtm-id">Google Tag Manager ID</Label>
                                            <Input
                                                id="gtm-id"
                                                value={analyticsData.tagManagerId}
                                                onChange={(e) => setAnalyticsData(prev => ({ ...prev, tagManagerId: e.target.value }))}
                                                placeholder="GTM-XXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {activeSection === "pixel" && (
                        <Accordion type="single" collapsible defaultValue="pixel-tracking" className="w-full">
                            <AccordionItem value="pixel-tracking" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">Advertising Pixels</span>
                                        <span className="text-sm text-muted-foreground font-normal">Track the effectiveness of your social media ads.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <div className="space-y-4 pt-1">
                                        <div className="space-y-2">
                                            <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
                                            <Input
                                                id="fb-pixel"
                                                value={analyticsData.fbPixelId}
                                                onChange={(e) => setAnalyticsData(prev => ({ ...prev, fbPixelId: e.target.value }))}
                                                placeholder="Enter Pixel ID"
                                            />
                                            <p className="text-[11px] text-zinc-500">Used for Facebook Ads optimization and retargeting.</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {activeSection === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Today's Visits</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-2xl font-bold">0</div>
                                    <p className="text-[10px] text-zinc-400 mt-1">Connect GA4 to see real-time data.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Conversion Rate</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-2xl font-bold">0.0%</div>
                                    <p className="text-[10px] text-zinc-400 mt-1">Based on last 7 days.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Orders</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-2xl font-bold">0</div>
                                    <p className="text-[10px] text-zinc-400 mt-1">From all channels.</p>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-3 border-dashed border-2 flex flex-col items-center justify-center p-12 text-center space-y-4">
                                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                    <BarChart3 className="w-8 h-8 text-zinc-400" />
                                </div>
                                <div className="max-w-xs">
                                    <h3 className="font-semibold text-lg">Detailed Analytics</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Once you connect Google Analytics or Facebook Pixel, you'll see detailed charts and heatmaps here.
                                    </p>
                                </div>
                                <Button variant="outline" onClick={() => setActiveSection("tracking")}>
                                    Configure Tracking
                                </Button>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
