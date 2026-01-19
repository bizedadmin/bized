"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Calendar,
    Clock,
    MapPin,
    Building2,
    ArrowLeft,
    Share2,
    CalendarCheck2,
    Info,
    CreditCard,
    MessageSquare,
    Loader2,
    ExternalLink
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ClientPortalShell from "@/components/portal/ClientPortalShell"

interface BookingDetail {
    _id: string
    businessId: {
        _id: string
        name: string
        slug: string
        logo?: string
        themeColor?: string
        address?: {
            streetAddress: string
            addressLocality: string
        }
        industry?: string
        description?: string
    }
    serviceId: {
        _id: string
        name: string
        description?: string
        duration: number
        image?: string[]
        category?: string
    }
    date: string
    startTime: string
    endTime: string
    status: string
    notes?: string
    totalPrice: number
    currency: string
}

export default function BookingDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const { data: session, status } = useSession()
    const router = useRouter()

    const [booking, setBooking] = useState<BookingDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/login?callbackUrl=/bized/bookings/${params.id}`)
        } else if (status === "authenticated") {
            fetchBookingDetail()
        }
    }, [status, params.id, router])

    const fetchBookingDetail = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(`/api/account/bookings/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setBooking(data)
            } else {
                const err = await res.json()
                setError(err.error || "Failed to load booking details")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm max-w-md w-full text-center border border-gray-100 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Info className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
                    <p className="text-gray-500 mb-8">{error || "We couldn't find the appointment you're looking for."}</p>
                    <Button asChild className="rounded-xl w-full h-12">
                        <Link href="/bized">Back to Portal</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const themeColor = booking.businessId.themeColor || "#007AFF"

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-green-50 text-green-600 border-green-100'
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100'
            case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100'
            default: return 'bg-gray-50 text-gray-600 border-gray-100'
        }
    }

    return (
        <ClientPortalShell activeTab="bookings" business={booking.businessId}>
            <div className="pb-20">
                {/* Internal Page Header */}
                <div className="px-4 sm:px-8 py-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="rounded-xl -ml-2">
                            <Link href="/bized?tab=bookings" className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back to Bookings</span>
                            </Link>
                        </Button>
                        <h1 className="font-bold text-lg text-gray-900 dark:text-white">Appointment Details</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl text-gray-400">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-6 lg:grid-cols-3"
                    >
                        {/* Main Detail Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status Card */}
                            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
                                <div className="h-2 w-full" style={{ backgroundColor: themeColor }} />
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${themeColor}15` }}
                                            >
                                                <CalendarCheck2 className="w-8 h-8" style={{ color: themeColor }} />
                                            </div>
                                            <div>
                                                <Badge className={`mb-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </Badge>
                                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                    {booking.serviceId?.name}
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {booking.currency} {booking.totalPrice.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timing & Details */}
                            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-zinc-900 p-8 space-y-8">
                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Date & Time</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        {new Date(booking.date).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Scheduled Date</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        {booking.startTime} - {booking.endTime}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {booking.serviceId?.duration} min duration
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Service Info</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        {booking.businessId?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{booking.businessId?.industry || 'Business'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        {booking.businessId?.address?.streetAddress || 'Virtual Meeting'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {booking.businessId?.address?.addressLocality || 'Online'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Additional Notes</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl italic">
                                            "{booking.notes}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 pt-6">
                                    <Button className="rounded-2xl h-12 px-6 flex-1 sm:flex-none bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                                        Reschedule
                                    </Button>
                                    <Button variant="outline" className="rounded-2xl h-12 px-6 flex-1 sm:flex-none border-gray-200 dark:border-zinc-800">
                                        Cancel Appointment
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar Area */}
                        <div className="space-y-6">
                            {/* Business Card */}
                            <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                                <CardHeader className="p-6">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-12 h-12 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-sm">
                                            <AvatarImage src={booking.businessId?.logo} />
                                            <AvatarFallback className="rounded-2xl bg-zinc-100 text-zinc-900 font-bold">
                                                {booking.businessId?.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base">{booking.businessId?.name}</CardTitle>
                                            <CardDescription className="text-xs">Service Provider</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                        {booking.businessId?.description || "A professional service provider on Bized app."}
                                    </p>
                                    <Button variant="outline" className="w-full rounded-xl h-10 text-xs border-gray-200 dark:border-zinc-800" asChild>
                                        <Link href={`/${booking.businessId?.slug}`} className="flex items-center justify-center gap-2">
                                            View Profile <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Helper Card */}
                            <Card className="rounded-[2rem] border-none shadow-sm bg-indigo-600 text-white p-6 relative overflow-hidden">
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <MessageSquare className="w-8 h-8 mb-4 opacity-80" />
                                <h3 className="font-bold text-lg mb-2 leading-tight">Need assistance?</h3>
                                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                    Chat with the support team for any questions about your booking.
                                </p>
                                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl h-10 font-bold text-xs">
                                    Open Chat
                                </Button>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="ghost" className="rounded-2xl h-14 flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-gray-400">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-[10px] font-bold">SHARE</span>
                                </Button>
                                <Button variant="ghost" className="rounded-2xl h-14 flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-gray-400">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-[10px] font-bold">INVOICE</span>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </ClientPortalShell>
    )
}
