"use client"
import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Loader2, RefreshCw, CheckCircle, ExternalLink,
    Upload, Clock, Plus, X, Building2, MapPin,
    Globe, Phone, Info, Image as ImageIcon,
    Star, MessageSquare, BarChart3, Megaphone,
    ShoppingBag, ListChecks, Calendar, HelpCircle,
    ChevronLeft, Palette, Layout
} from "lucide-react"

import EditInfoForm from "./edit-info"
import ContactForm from "./contact-form"
import HoursForm from "./hours-form"
import PhotosForm from "./photos-form"
import ReviewsView from "./reviews-view"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

type ViewMode = "hub" | "edit-info" | "contact" | "hours" | "photos" | "reviews"

export default function ProfileHub() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState<ViewMode>("hub")
    const [syncError, setSyncError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        id: null as string | null,
        name: "",
        description: "",
        phone: "",
        website: "",
        address: "",
        logo: "",
        image: "",
        industry: "",
        businessCategories: [] as string[],
        lastGoogleSync: null as string | null,
        businessHours: DAYS.map(day => ({ day, isOpen: false, openTime: "09:00", closeTime: "17:00" }))
    })

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await fetch("/api/businesses")
                const data = await res.json()
                if (data && data.length > 0) {
                    const biz = data[0]
                    setFormData({
                        id: biz._id,
                        name: biz.name || "",
                        description: biz.description || "",
                        phone: biz.telephone || biz.phone?.number || "",
                        website: biz.url || biz.website || "",
                        address: biz.address?.streetAddress || (typeof biz.address === 'string' ? biz.address : "") || "",
                        logo: biz.logo || "",
                        image: biz.image || "",
                        industry: biz.industry || "",
                        businessCategories: biz.businessCategories || [],
                        lastGoogleSync: biz.lastGoogleSync || null,
                        businessHours: DAYS.map(d => {
                            const existing = biz.businessHours?.find((h: any) => h.day === d)
                            return existing ? { ...existing, isOpen: existing.isOpen ?? false } : { day: d, isOpen: false, openTime: "09:00", closeTime: "17:00" }
                        })
                    })
                }
            } catch (error) {
                console.error("Failed to load business", error)
            }
        }
        fetchBusiness()
    }, [])

    const handleSave = async (updatedData: any) => {
        if (!formData.id) {
            toast.error("No business found to update.")
            return
        }

        setLoading(true)
        try {
            const payload = {
                name: updatedData.name,
                description: updatedData.description,
                telephone: updatedData.phone,
                url: updatedData.website,
                address: { streetAddress: updatedData.address },
                logo: updatedData.logo,
                image: updatedData.image,
                industry: updatedData.industry,
                businessCategories: updatedData.businessCategories,
                businessHours: updatedData.businessHours
            }

            const res = await fetch(`/api/businesses/${formData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to update")

            setFormData(updatedData)
            toast.success("Profile updated successfully!")
            setView("hub")
        } catch (error) {
            toast.error("Failed to save changes.")
        } finally {
            setLoading(false)
        }
    }

    const handleConnectGoogle = () => {
        signIn("google", {
            callbackUrl: "/business/profile",
            prompt: "consent"
        })
    }

    const handleSyncFromGoogle = async () => {
        setLoading(true)
        setSyncError(null)
        try {
            const res = await fetch('/api/google/sync')
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || "Failed to sync")
            }
            const data = await res.json()
            setFormData(prev => ({
                ...prev,
                name: data.name || prev.name,
                phone: data.phone || prev.phone,
                website: data.website || prev.website,
                address: data.address || prev.address,
                lastGoogleSync: new Date().toISOString()
            }))
            toast.success("Profile details synced from Google!")
        } catch (error: any) {
            const msg = error.message || "Failed to sync with Google."
            setSyncError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    if (view !== "hub") {
        return (
            <div className="max-w-4xl mx-auto pb-20">
                <Button
                    variant="ghost"
                    onClick={() => setView("hub")}
                    className="mb-8 hover:bg-transparent -ml-2 text-gray-500"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Button>

                <h1 className="text-3xl font-extrabold mb-8 tracking-tight capitalize">
                    {view.replace("-", " ")}
                </h1>

                {view === "edit-info" && <EditInfoForm bizData={formData} onSave={handleSave} onCancel={() => setView("hub")} />}
                {view === "contact" && <ContactForm bizData={formData} onSave={handleSave} onCancel={() => setView("hub")} />}
                {view === "hours" && <HoursForm bizData={formData} onSave={handleSave} onCancel={() => setView("hub")} />}
                {view === "photos" && <PhotosForm bizData={formData} onSave={handleSave} onCancel={() => setView("hub")} />}
                {view === "reviews" && <ReviewsView bizData={formData} onBack={() => setView("hub")} />}
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Google Presence
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium whitespace-nowrap overflow-x-auto no-scrollbar pb-1">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100/50 dark:border-blue-900/20 shadow-sm">
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span className="text-[13px] font-bold">324 customer interactions</span>
                        </div>

                        <span className="text-gray-200 dark:text-zinc-800">|</span>

                        <button className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[13px]">
                            Complete profile info
                        </button>

                        <span className="text-gray-200 dark:text-zinc-800">|</span>

                        <div className="flex items-center gap-3">
                            {/* @ts-ignore */}
                            {session?.accessToken ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSyncFromGoogle}
                                        disabled={loading}
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[13px] flex items-center gap-1.5"
                                    >
                                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-blue-500" />}
                                        Sync with Google
                                    </button>
                                    {formData.lastGoogleSync && (
                                        <span className="text-[10px] font-black uppercase tracking-tight text-gray-400 bg-gray-50 dark:bg-zinc-900/50 px-2 py-0.5 rounded border border-gray-100 dark:border-zinc-800/50">
                                            Last sync: {new Date(formData.lastGoogleSync).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleConnectGoogle}
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[13px] flex items-center gap-1.5"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                                    Sync with Google
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Icon Grid (Matching Google UX but Bized Theme) */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                <HubIcon
                    icon={<Building2 className="w-5 h-5" />}
                    label="Edit profile"
                    onClick={() => setView("edit-info")}
                />
                <HubIcon
                    icon={<Star className="w-5 h-5" />}
                    label="Reviews"
                    onClick={() => setView("reviews")}
                />
                <HubIcon
                    icon={<ImageIcon className="w-5 h-5" />}
                    label="Photos"
                    onClick={() => setView("photos")}
                />
                <HubIcon
                    icon={<Clock className="w-5 h-5" />}
                    label="Hours"
                    onClick={() => setView("hours")}
                />
                <HubIcon
                    icon={<BarChart3 className="w-5 h-5" />}
                    label="Performance"
                    onClick={() => toast.info("Performance analytics coming soon!")}
                />
                <HubIcon
                    icon={<Megaphone className="w-5 h-5" />}
                    label="Advertise"
                    onClick={() => toast.info("Advertising center coming soon!")}
                />
                <HubIcon
                    icon={<ShoppingBag className="w-5 h-5" />}
                    label="Products"
                    onClick={() => window.location.href = "/business/page-builder"}
                />
                <HubIcon
                    icon={<ListChecks className="w-5 h-5" />}
                    label="Services"
                    onClick={() => toast.info("Services editor coming soon!")}
                />
                <HubIcon
                    icon={<Calendar className="w-5 h-5" />}
                    label="Bookings"
                    onClick={() => toast.info("Booking system integration coming soon!")}
                />
                <HubIcon
                    icon={<HelpCircle className="w-5 h-5" />}
                    label="Q & A"
                    onClick={() => toast.info("Question & Answer section coming soon!")}
                />
                <HubIcon
                    icon={<MapPin className="w-5 h-5" />}
                    label="Location"
                    onClick={() => setView("contact")}
                />
                <HubIcon
                    icon={<Palette className="w-5 h-5" />}
                    label="Customize"
                    onClick={() => window.location.href = "/business/design"}
                />
            </div>

            {/* Bottom Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-gray-200 dark:border-zinc-800">
                <InsightCard
                    title="Google Business Sync"
                    description="Keep your local business data synced with Google Search & Maps automatically."
                />
                <InsightCard
                    title="Claim your credit"
                    description="Get discovered in Google, Facebook, Instagram and WhatsApp with focused campaigns."
                />
                <InsightCard
                    title="Set up booking"
                    description="Let customers schedule appointments directly from your profile or website."
                />
            </div>

            {syncError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                    <X className="w-5 h-5 shrink-0" />
                    <p className="font-medium">{syncError}</p>
                </div>
            )}
        </div>
    )
}

function HubIcon({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-3 group transition-all"
        >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] dark:shadow-none border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:bg-blue-50/10 active:scale-95">
                {icon}
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center tracking-tight opacity-90 transition-opacity group-hover:opacity-100">
                {label}
            </span>
        </button>
    )
}

function InsightCard({ title, description, action }: { title: string, description: string, action?: React.ReactNode }) {
    return (
        <Card className="shadow-none border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {description}
                </p>
                {action}
            </CardContent>
        </Card>
    )
}
