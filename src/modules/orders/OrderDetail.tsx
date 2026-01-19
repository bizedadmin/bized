"use client"

import {
    ChevronLeft,
    ShoppingCart,
    Package,
    Truck,
    CheckCircle2,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    Receipt,
    MoreVertical,
    Edit,
    XCircle
} from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface OrderDetailProps {
    order: any
}

export function OrderDetail({ order: initialOrder }: OrderDetailProps) {
    const router = useRouter()
    const [order, setOrder] = useState(initialOrder)
    const [updating, setUpdating] = useState(false)

    const handleUpdateStatus = async (newStatus: string) => {
        setUpdating(true)
        try {
            const res = await fetch(`/ api / business / orders / ${order._id} `, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                const updated = await res.json()
                setOrder(updated)
                toast.success(`Order status updated to ${newStatus} `)
            } else {
                toast.error("Failed to update order status")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setUpdating(false)
        }
    }

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

    const orderNumber = order.identifier
    const currentStatus = order.orderStatus
    const totalPrice = order.price
    const currency = order.priceCurrency
    const customer = order.customer
    const items = order.orderedItem
    const delivery = order.orderDelivery

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black">{orderNumber}</h1>
                            {getStatusBadge(currentStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push(`/ business / invoices / new? orderId = ${order._id} `)}
                    >
                        <Receipt className="h-4 w-4" />
                        Create Invoice
                    </Button>
                    {currentStatus !== 'OrderInTransit' && currentStatus !== 'shipped' && currentStatus !== 'OrderDelivered' && currentStatus !== 'delivered' && currentStatus !== 'OrderCancelled' && currentStatus !== 'cancelled' && (
                        <Button
                            className="gap-2"
                            onClick={() => handleUpdateStatus('OrderInTransit')}
                            disabled={updating}
                        >
                            <Truck className="h-4 w-4" />
                            Mark as Shipped
                        </Button>
                    )}
                    {(currentStatus === 'OrderInTransit' || currentStatus === 'shipped') && (
                        <Button
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleUpdateStatus('OrderDelivered')}
                            disabled={updating}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as Delivered
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/ business / orders / edit / ${order._id} `)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Order
                            </DropdownMenuItem>
                            {currentStatus !== 'OrderCancelled' && currentStatus !== 'cancelled' && (
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleUpdateStatus('OrderCancelled')}
                                    disabled={updating}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Order
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b">
                                        <TableHead className="font-bold">Item</TableHead>
                                        <TableHead className="text-center font-bold">Qty</TableHead>
                                        <TableHead className="text-right font-bold">Price</TableHead>
                                        <TableHead className="text-right font-bold">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="py-4">
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">ID: {item.productId || item.serviceId || 'N/A'}</p>
                                            </TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{currency} {item.price.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-bold">{currency} {item.total.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Summary Card for Mobile/Side */}
                    <Card className="lg:hidden">
                        <CardHeader>
                            <CardTitle>Total Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold">{currency} {order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black pt-4 border-t">
                                <span>Total</span>
                                <span className="text-primary">{currency} {totalPrice.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {(customer.name || "?")[0]}
                                </div>
                                <div>
                                    <p className="font-bold">{customer.name}</p>
                                    <p className="text-xs text-muted-foreground">Customer</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{customer.email}</span>
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {delivery?.address?.streetAddress ? (
                                <div className="text-sm space-y-1 text-muted-foreground">
                                    <p>{delivery.address.streetAddress}</p>
                                    <p>{delivery.address.addressLocality}, {delivery.address.addressRegion} {delivery.address.postalCode}</p>
                                    <p>{delivery.address.addressCountry}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No shipping address provided.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className="hidden lg:block bg-muted/30">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold">{currency} {order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-bold">{currency} {order.tax?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-bold text-emerald-600">-{currency} {order.discount?.toLocaleString() || '0'}</span>
                            </div>
                            <hr className="border-border" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-lg font-black">Total</span>
                                <span className="text-2xl font-black text-primary">
                                    {currency} {totalPrice.toLocaleString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
