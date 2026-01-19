"use client"

import {
    MoreHorizontal,
    Eye,
    Receipt,
    XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface OrderTableProps {
    orders: any[]
    loading: boolean
}

export function OrderTable({ orders, loading }: OrderTableProps) {
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

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                    <TableHead className="w-[100px] font-bold">Order ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Total</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                            Loading orders...
                        </TableCell>
                    </TableRow>
                ) : orders.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                            No orders found.
                        </TableCell>
                    </TableRow>
                ) : (
                    orders.map((order) => (
                        <TableRow key={order._id} className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                            <TableCell className="font-medium text-zinc-900 dark:text-zinc-50">
                                #{order._id?.substring(order._id.length - 6).toUpperCase()}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{order.customerName}</span>
                                    <span className="text-xs text-zinc-500">{order.customerEmail}</span>
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-right font-black text-zinc-900 dark:text-zinc-50">
                                {order.currency} {order.total.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-zinc-500 text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Receipt className="mr-2 h-4 w-4" /> Create Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                                            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}
