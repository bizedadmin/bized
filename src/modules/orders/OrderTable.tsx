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
import { useRouter } from "next/navigation"

interface OrderTableProps {
    orders: any[]
    loading: boolean
}

export function OrderTable({ orders, loading }: OrderTableProps) {
    const router = useRouter()
    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase() || ''
        switch (s) {
            case 'orderpending':
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
            case 'orderprocessing':
            case 'processing':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>
            case 'orderintransit':
            case 'shipped':
                return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Shipped</Badge>
            case 'orderdelivered':
            case 'delivered':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Delivered</Badge>
            case 'ordercancelled':
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
            case 'paid':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="w-[100px] font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
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
                    orders.map((order) => {
                        const orderNumber = order.identifier
                        const paymentStatus = order.orderStatus
                        const totalPrice = order.price
                        const currency = order.priceCurrency
                        const customer = order.customer

                        return (
                            <TableRow key={order._id} className="border-b transition-colors">
                                <TableCell className="font-medium">
                                    {orderNumber}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{customer.name}</span>
                                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(paymentStatus)}</TableCell>
                                <TableCell className="text-right font-bold">
                                    {currency} {totalPrice.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[160px]">
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => router.push(`/business/orders/${order._id}`)}
                                            >
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => router.push(`/business/invoices/new?orderId=${order._id}`)}
                                            >
                                                <Receipt className="mr-2 h-4 w-4" /> Create Invoice
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                                                <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })
                )}
            </TableBody>
        </Table>
    )
}
