
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    MoreVertical,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Store
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface Booking {
    _id: string
    businessId: {
        _id: string
        name: string
        slug: string
        logo?: string
    }
    serviceId: {
        _id: string
        name: string
        price: number
        currency: string
        duration: number
    }
    date: string
    startTime: string
    endTime: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    totalPrice: number
    currency: string
    notes?: string
}

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/account/bookings')
                if (res.ok) {
                    const data = await res.json()
                    setBookings(data)
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error)
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmed</Badge>
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1"><Clock className="w-3 h-3" /> Pending</Badge>
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 gap-1"><XCircle className="w-3 h-3" /> Cancelled</Badge>
            case 'completed':
                return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const upcomingBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status))
    const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status))

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                    <p className="text-muted-foreground mt-1">View and manage your appointments</p>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    {upcomingBookings.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50">
                            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground">No upcoming bookings</h3>
                            <p className="text-muted-foreground">You don't have any scheduled appointments.</p>
                        </div>
                    ) : (
                        upcomingBookings.map(booking => (
                            <BookingCard key={booking._id} booking={booking} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    {pastBookings.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50">
                            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground">No past bookings</h3>
                            <p className="text-muted-foreground">Your booking history will appear here.</p>
                        </div>
                    ) : (
                        pastBookings.map(booking => (
                            <BookingCard key={booking._id} booking={booking} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )

    function BookingCard({ booking }: { booking: Booking }) {
        return (
            <Card className="overflow-hidden border-border/50 hover:border-border transition-colors">
                <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                    {/* Date Box */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-muted/50 rounded-xl border border-border">
                        <span className="text-xs font-bold uppercase text-muted-foreground mb-0.5">
                            {format(new Date(booking.date), 'MMM')}
                        </span>
                        <span className="text-xl font-bold text-foreground">
                            {format(new Date(booking.date), 'd')}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-foreground truncate">
                                    {booking.serviceId?.name || "Unknown Service"}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Store className="w-3.5 h-3.5" />
                                    <span>{booking.businessId?.name || "Unknown Business"}</span>
                                </div>
                            </div>
                            {getStatusBadge(booking.status)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{booking.startTime} - {booking.endTime}</span>
                            </div>
                            <div className="w-px h-3 bg-border" />
                            <div className="font-medium text-foreground">
                                {booking.currency} {booking.totalPrice?.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                            Details
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </Card>
        )
    }
}
