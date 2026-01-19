"use client"

import { useState, useEffect } from "react"
import {
    ShoppingCart,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Receipt,
    Truck,
    CheckCircle2,
    Clock,
    XCircle
} from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { OrderTable } from "@/modules/orders/OrderTable"

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchOrders = async () => {
            const stored = localStorage.getItem("selectedBusiness");
            if (!stored) return;
            const business = JSON.parse(stored);

            try {
                const res = await fetch(`/api/business/orders?businessId=${business._id}`)
                if (res.ok) {
                    const data = await res.json()
                    setOrders(data)
                }
            } catch (error) {
                console.error("Failed to fetch orders", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
            case 'paid':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>
            case 'shipped':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Shipped</Badge>
            case 'delivered':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const filteredOrders = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order._id && order._id.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Orders</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Manage and track your customer orders.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity">
                        Create Order
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">{orders.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                            {orders.filter(o => o.status === 'pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Processing</CardTitle>
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                            {orders.filter(o => o.status === 'processing').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                            {orders.filter(o => o.status === 'delivered').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold">All Orders</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Search orders..."
                                    className="pl-9 w-full md:w-[300px] h-9 bg-white dark:bg-zinc-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" className="h-9 gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <OrderTable orders={filteredOrders} loading={loading} />
                </CardContent>
            </Card>
        </div>
    )
}

function RefreshCw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    )
}
