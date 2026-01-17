"use client"

import { useEffect, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
import { Card, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ClientPortalShell from "@/components/portal/ClientPortalShell"

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
            const bizRes = await fetch("/api/business/bized")
            if (bizRes.ok) {
                const data = await bizRes.json()
                setBusiness(data)
            }

            const bookingsRes = await fetch("/api/account/bookings")
            if (bookingsRes.ok) {
                const data = await bookingsRes.json()
                setBookings(data)
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

    const themeColor = business?.themeColor || "#10b981";

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
                        {/* Public Pages Content */}
                        {activeTab === "pages" && business && (
                            <div className="space-y-8">
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <Layout className="w-6 h-6" style={{ color: themeColor }} />
                                            Business Sections
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                        {business.pages.filter(p => p.enabled).map((page, idx) => {
                                            const PageIcon = getIconForPageType(page.type);
                                            return (
                                                <Card key={idx} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white dark:bg-zinc-900 flex flex-col p-2">
                                                    <div className="p-6 flex flex-col items-center text-center">
                                                        <div
                                                            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-all duration-500"
                                                            style={{ backgroundColor: `${themeColor}10` }}
                                                        >
                                                            <PageIcon className="w-8 h-8 transition-colors" style={{ color: themeColor }} />
                                                        </div>
                                                        <CardTitle className="text-lg mb-1">{page.title}</CardTitle>
                                                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                                                            {page.type}
                                                        </CardDescription>
                                                    </div>
                                                    <CardFooter className="pt-2 pb-4 px-4">
                                                        <Button
                                                            className="w-full bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-900 dark:text-white border-none shadow-none h-10 rounded-2xl group/btn transition-all duration-300"
                                                            asChild
                                                        >
                                                            <Link href={page.type === 'storefront' ? `/${business.slug}` : `/${business.slug}/${page.slug}`}>
                                                                Open Page
                                                                <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </section>
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
                                    {bookings.length > 0 ? bookings.map((booking) => (
                                        <Card key={booking._id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white dark:bg-zinc-900 group">
                                            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-5">
                                                    <div
                                                        className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
                                                        style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
                                                    >
                                                        <span className="text-[10px] font-bold uppercase">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                        <span className="text-lg font-bold">{new Date(booking.date).getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg transition-colors group-hover:text-emerald-600">
                                                            {booking.serviceId?.name || "Service Appointment"}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                            <span className="flex items-center gap-1 font-medium"><Building2 className="w-3.5 h-3.5" /> {booking.businessId?.name}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.startTime}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                                    <Badge
                                                        className="rounded-full px-4 py-1 text-xs font-bold border-none"
                                                        style={{
                                                            backgroundColor: booking.status === 'confirmed' ? `${themeColor}20` : '#fef3c7',
                                                            color: booking.status === 'confirmed' ? themeColor : '#b45309'
                                                        }}
                                                    >
                                                        {booking.status.toUpperCase()}
                                                    </Badge>
                                                    <Button variant="ghost" className="rounded-xl h-10 group-hover:bg-gray-100 dark:group-hover:bg-zinc-800" asChild>
                                                        <Link href={`/bized/bookings/${booking._id}`}>
                                                            Details <ChevronRight className="w-4 h-4 ml-1" />
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
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        }>
            <PortalContent />
        </Suspense>
    )
}
