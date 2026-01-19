"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ShoppingBag, FileText, ArrowRight, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function OverviewPage() {
    const [user, setUser] = useState<{ name: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch basic user info for greeting
        fetch("/api/profile")
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            {/* Header / Greeting */}
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Overview
                </h1>
                <p className="text-muted-foreground text-lg">
                    Welcome back, <span className="font-semibold text-foreground">{user?.name || "User"}</span>! Here's what's happening with your account.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Bookings
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            No upcoming bookings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Orders
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            No active orders
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Open Invoices
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            All paid up
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="grid gap-8 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your recent interactions across the platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                            <p>No recent activity provided.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks you might want to do.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Link href="/account/profile">
                            <Button variant="outline" className="w-full justify-between">
                                <span className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" /> Edit Profile
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/account/bookings">
                            <Button variant="outline" className="w-full justify-between">
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> View Bookings
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
