"use client"

import { useState, useEffect } from "react"
import {
    Calendar as CalendarIcon,
    DollarSign,
    Clock,
    CheckCircle2,
    CalendarDays
} from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function BookingsOverviewPage() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTickets = async () => {
            const stored = localStorage.getItem("selectedBusiness");
            if (!stored) return;
            const business = JSON.parse(stored);

            try {
                const res = await fetch(`/api/business/tickets?businessId=${business._id}`)
                if (res.ok) {
                    const data = await res.json()
                    setTickets(data)
                }
            } catch (error) {
                console.error("Failed to fetch tickets", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTickets()
    }, [])

    const totalTickets = tickets.length
    const pendingTickets = tickets.filter(t => t.status === 'pending').length
    const confirmedTickets = tickets.filter(t => t.status === 'confirmed').length
    const totalRevenue = tickets.reduce((acc, t) => acc + (t.totalPrice || 0), 0)

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Bookings Overview</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Get a high-level view of your booking performance.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">KES {totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Bookings</CardTitle>
                        <CalendarDays className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">{totalTickets}</div>
                        <p className="text-xs text-zinc-500 mt-1">+12 since last week</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">{pendingTickets}</div>
                        <p className="text-xs text-zinc-500 mt-1">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Confirmed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">{confirmedTickets}</div>
                        <p className="text-xs text-zinc-500 mt-1">Scheduled appointments</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
