"use client"

import { useEffect, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import * as m from "framer-motion"
const { motion, AnimatePresence } = m
import {
    User,
    FileText,
    Calendar,
    ShoppingBag,
    ChevronRight,
    Building2,
    Loader2,
    Ticket,
    Globe,
    Store,
    Clock,
    ArrowUpRight,
    Layout
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ClientPortalShell from "@/components/portal/ClientPortalShell"
import { Phone, MessageCircle, MapPin, Mail, Share2, Star } from "lucide-react"

// Types
interface BusinessPage {
    title: string
    slug: string
    enabled: boolean
    type: 'profile' | 'bookings' | 'shop' | 'quote' | 'storefront'
}

interface Business {
    _id: string
    name: string
    slug: string
    industry?: string
    logo?: string
    description?: string
    themeColor?: string
    pages: BusinessPage[]
}

interface Booking {
    _id: string
    businessId: {
        name: string
        slug: string
    }
    serviceId: {
        name: string
        price: number
        currency: string
    }
    date: string
    startTime: string
    status: string
}

function PortalContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab')
    const tabParam = searchParams.get('tab')
    const searchQuery = searchParams.get('q')?.toLowerCase() || ""
    const bizIdParam = searchParams.get('bizId')

    // State
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("pages")
    const [business, setBusiness] = useState<Business | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/bized")
        } else if (status === "authenticated") {
            fetchInitialData()
        }
    }, [status, router])

    const fetchInitialData = async () => {
        try {
            setIsLoading(true)
            const endpoint = bizIdParam ? `/api/businesses/${bizIdParam}` : "/api/business/bized"
            const bizRes = await fetch(endpoint)
            if (bizRes.ok) {
                const data = await bizRes.json()
                setBusiness(data)
            }

            const bookingsRes = await fetch("/api/account/bookings")
            if (bookingsRes.ok) {
                const data = await bookingsRes.json()
                // If viewing a specific business portal, only show bookings for that business
                const filteredBookings = bizIdParam
                    ? data.filter((b: any) => b.businessId?._id === bizIdParam)
                    : data
                setBookings(filteredBookings)
            }
        } catch (error) {
            console.error("Error fetching client data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getIconForPageType = (type: string) => {
        switch (type) {
            case 'profile': return User;
            case 'bookings': return Calendar;
            case 'shop': return ShoppingBag;
            case 'quote': return FileText;
            case 'storefront': return Store;
            default: return Globe;
        }
    }

    const themeColor = business?.themeColor || "#007AFF";

    if (!session || !business) return null

    return (
        <ClientPortalShell
            activeTab={activeTab}
            onTabChange={(tab) => {
                setActiveTab(tab)
                router.push(`/bized?tab=${tab}`)
            }}
            business={business}
        >
            <div className="p-4 sm:p-8">
                {/* Welcome Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400 border-none font-bold px-3">
                                Member Portal
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Hello, {session.user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            Manage your interaction with <span className="font-bold" style={{ color: themeColor }}>{business?.name || "the business"}</span>.
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-200 dark:border-zinc-800 flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg"
                            style={{ backgroundColor: themeColor }}
                        >
                            {business.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold">{business.name}</p>
                            <p className="text-xs text-gray-500">Official Channel</p>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* Public Pages Content - Now transformed into a Business Dashboard */}
                        {activeTab === "pages" && business && (
                            <div className="space-y-10">
                                {/* Featured Business Card */}
                                <Card className="border-none bg-white dark:bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden lg:flex">
                                    <div
                                        className="lg:w-1/3 aspect-[4/3] lg:aspect-auto bg-cover bg-center relative"
                                        style={{
                                            backgroundImage: business.logo ? `url(${business.logo})` : 'none',
                                            backgroundColor: `${themeColor}10`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
                                        <div className="absolute bottom-6 left-6 lg:hidden">
                                            <h2 className="text-white text-2xl font-bold">{business.name}</h2>
                                            <p className="text-white/80 text-sm">Official Platform</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-8 lg:p-12 space-y-6">
                                        <div className="hidden lg:block">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Featured Partner</span>
                                            </div>
                                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                                                {business.name}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-xl">
                                                {business.description || `Welcome to your official portal for ${business.name}. Here you can manage your bookings, orders, and support requests directly with us.`}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 lg:pt-0">
                                            <Button variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all group">
                                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <MessageCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-tight">WhatsApp</span>
                                            </Button>
                                            <Button variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all group">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Phone className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Call Us</span>
                                            </Button>
                                            <Button variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all group">
                                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <MapPin className="w-4 h-4 text-amber-600" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Location</span>
                                            </Button>
                                            <Button variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all group">
                                                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Share2 className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Share</span>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 italic uppercase">
                                            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: themeColor }} />
                                            Explore Services
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                        {business.pages
                                            .filter(p => p.enabled)
                                            .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery) || p.type.toLowerCase().includes(searchQuery))
                                            .map((page, idx) => {
                                                const PageIcon = getIconForPageType(page.type);
                                                return (
                                                    <Card key={idx} className="group border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden bg-white dark:bg-zinc-900 p-1 rounded-3xl">
                                                        <div className="p-6 flex flex-col">
                                                            <div
                                                                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-sm"
                                                                style={{ backgroundColor: `${themeColor}10` }}
                                                            >
                                                                <PageIcon className="w-6 h-6 transition-colors" style={{ color: themeColor }} />
                                                            </div>
                                                            <CardTitle className="text-xl font-bold mb-1 tracking-tight">{page.title}</CardTitle>
                                                            <CardDescription className="text-xs font-medium text-gray-500 mb-6">
                                                                Manage your {page.type} preferences.
                                                            </CardDescription>

                                                            <Button
                                                                className="w-full bg-gray-50 dark:bg-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-700 text-gray-900 dark:text-white border-none shadow-none h-11 rounded-xl group/btn transition-all duration-300 font-bold"
                                                                asChild
                                                            >
                                                                <Link href={page.type === 'storefront' ? `/${business.slug}` : `/${business.slug}/${page.slug}`}>
                                                                    Launch Section
                                                                    <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                )
                                            })}
                                    </div>
                                    {business.pages.filter(p => p.enabled).filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery) || p.type.toLowerCase().includes(searchQuery)).length === 0 && (
                                        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[32px] border border-dashed">
                                            <p className="text-gray-500 font-bold italic">No sections found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </section>

                                {/* Bottom Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="p-6 border-none bg-zinc-900 text-white rounded-[24px]">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">Business Hours</h3>
                                        <p className="text-white/60 text-sm italic">Mon - Fri: 09:00 - 18:00</p>
                                    </Card>
                                    <Card className="p-6 border-none bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">Need help?</h3>
                                        <p className="text-gray-500 text-sm">contact@{business.slug}.com</p>
                                    </Card>
                                    <Card className="p-6 border-none bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                            <Globe className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">Main Website</h3>
                                        <p className="text-gray-500 text-sm truncate">www.{business.slug}.com</p>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Bookings Content */}
                        {activeTab === "bookings" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">My Appointments</h2>
                                    <Button
                                        className="h-10 rounded-xl font-bold shadow-lg"
                                        style={{ backgroundColor: themeColor, boxShadow: `${themeColor}33 0px 8px 16px` }}
                                        onClick={() => router.push(`/bized/bookings`)}
                                    >
                                        New Appointment
                                    </Button>
                                </div>
                                <div className="grid gap-4">
                                    {(bookings.filter(b => !searchQuery || b.serviceId?.name.toLowerCase().includes(searchQuery))).length > 0 ?
                                        bookings.filter(b => !searchQuery || b.serviceId?.name.toLowerCase().includes(searchQuery)).map((booking) => (
                                            <Card key={booking._id} className="border-none shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden bg-white dark:bg-zinc-900 group rounded-[24px]">
                                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="flex items-center gap-6">
                                                        <div
                                                            className="w-16 h-16 rounded-[20px] flex flex-col items-center justify-center shrink-0 shadow-inner"
                                                            style={{ backgroundColor: `${themeColor}08`, border: `1px solid ${themeColor}15` }}
                                                        >
                                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: themeColor }}>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                            <span className="text-2xl font-black italic -mt-1" style={{ color: themeColor }}>{new Date(booking.date).getDate()}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight leading-none mb-2 group-hover:italic transition-all">
                                                                {booking.serviceId?.name || "Service Appointment"}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                                                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {booking.businessId?.name}</span>
                                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {booking.startTime}</span>
                                                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> On-site</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 justify-between md:justify-end">
                                                        <Badge
                                                            className="rounded-xl px-4 py-1.5 text-[10px] font-black tracking-widest border-none uppercase italic"
                                                            style={{
                                                                backgroundColor: booking.status === 'confirmed' ? `${themeColor}15` : '#fef3c7',
                                                                color: booking.status === 'confirmed' ? themeColor : '#b45309'
                                                            }}
                                                        >
                                                            {booking.status}
                                                        </Badge>
                                                        <Button variant="outline" className="rounded-xl h-11 px-6 border-gray-100 hover:bg-zinc-900 hover:text-white transition-all font-bold text-xs" asChild>
                                                            <Link href={`/bized/bookings/${booking._id}`}>
                                                                Manage
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        )) : (
                                            <Card className="border-dashed border-2 py-20 text-center bg-transparent rounded-3xl">
                                                <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Calendar className="w-10 h-10 text-gray-300" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">No Active Bookings</h3>
                                                <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">You haven't scheduled any services with {business?.name || "Bized"} yet.</p>
                                                <Button variant="outline" className="rounded-xl px-10 h-11 border-gray-200" asChild>
                                                    <Link href="/bized/bookings">Start Booking</Link>
                                                </Button>
                                            </Card>
                                        )}
                                </div>
                            </div>
                        )}

                        {/* Orders Content */}
                        {activeTab === "orders" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                                </div>
                                <div
                                    className="p-20 text-center overflow-hidden relative rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                >
                                    <div
                                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
                                        style={{ backgroundColor: `${themeColor}10` }}
                                    >
                                        <ShoppingBag className="w-10 h-10" style={{ color: themeColor, opacity: 0.3 }} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Store Access Coming Soon</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-10 text-lg leading-relaxed italic">
                                        "We are preparing our digital catalog just for you."
                                    </p>
                                    <Button disabled className="bg-gray-100 dark:bg-zinc-800 text-gray-400 h-12 rounded-xl px-12 font-semibold">Stay Tuned</Button>
                                </div>
                            </div>
                        )}

                        {/* Tickets Content */}
                        {activeTab === "tickets" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Help & Support</h2>
                                    <Button
                                        className="h-10 rounded-xl shadow-lg font-bold"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        Open Ticket
                                    </Button>
                                </div>
                                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden rounded-3xl">
                                    <div className="p-20 text-center">
                                        <div
                                            className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8"
                                            style={{ backgroundColor: `${themeColor}10` }}
                                        >
                                            <Ticket className="w-10 h-10" style={{ color: themeColor, opacity: 0.3 }} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">No Support Requests</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed">
                                            Need help with your account or a service? Your support history will appear here.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </ClientPortalShell>
    )
}

export default function ClientPortalPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        }>
            <PortalContent />
        </Suspense>
    )
}
