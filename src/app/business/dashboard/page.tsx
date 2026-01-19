"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Package,
    Settings,
    Globe,
    BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function BusinessDashboard() {
    return (
        <>
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Welcome back! Here&apos;s what&apos;s happening with your business today.
                </p>
            </div>

            {/* Stats Grid */}
            < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Sales</CardDescription>
                        <CardTitle className="text-3xl">$0.00</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">+0% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Orders</CardDescription>
                        <CardTitle className="text-3xl">0</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">No orders yet</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Customers</CardDescription>
                        <CardTitle className="text-3xl">0</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">Start growing your base</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Conversion Rate</CardDescription>
                        <CardTitle className="text-3xl">0%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">Track your performance</p>
                    </CardContent>
                </Card>
            </div >

            {/* Quick Actions */}
            < Card >
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Get started with these essential tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/business/products">
                            <div className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                                <Package className="w-8 h-8 text-blue-600 mb-2" />
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Add Products</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Start selling by adding your products</p>
                            </div>
                        </Link>
                        <Link href="/business/design">
                            <div className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                                <Globe className="w-8 h-8 text-blue-600 mb-2" />
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Customize Website</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Design your online storefront</p>
                            </div>
                        </Link>
                        <Link href="/business/settings">
                            <div className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                                <Settings className="w-8 h-8 text-purple-600 mb-2" />
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Configure Settings</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Set up payments and shipping</p>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card >

            {/* Recent Activity */}
            < Card >
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest business updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
