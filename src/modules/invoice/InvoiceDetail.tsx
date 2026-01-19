"use client"

import { useState } from "react"
import {
    Download,
    Send,
    Printer,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    Building2,
    Receipt,
    CreditCard
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { useRouter } from "next/navigation"

interface InvoiceDetailProps {
    invoice: any
    business: any
}

export function InvoiceDetail({ invoice: initialInvoice, business }: InvoiceDetailProps) {
    const router = useRouter()
    const [invoice, setInvoice] = useState(initialInvoice)
    const [updating, setUpdating] = useState(false)

    const handleUpdateStatus = async (newStatus: string) => {
        setUpdating(true)
        try {
            const res = await fetch(`/api/business/invoices/${invoice._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                const updated = await res.json()
                setInvoice(updated)
                toast.success(`Invoice marked as ${newStatus}`)
            } else {
                toast.error("Failed to update invoice status")
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
            case 'draft':
                return <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200">Draft</Badge>
            case 'sent':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>
            case 'paid':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>
            case 'overdue':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const invoiceNumber = invoice.identifier
    const paymentStatus = invoice.paymentStatus
    const totalAmount = invoice.totalPaymentDue.price
    const currency = invoice.totalPaymentDue.priceCurrency
    const dueDate = invoice.paymentDueDate
    const customer = invoice.customer

    return (
        <div className="space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/95 backdrop-blur sticky top-0 z-10 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{invoiceNumber}</h1>
                            {getStatusBadge(paymentStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground">Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Button className="gap-2 bg-primary text-white">
                        <Send className="h-4 w-4" />
                        Send to Client
                    </Button>
                    {paymentStatus !== 'paid' && (
                        <Button
                            variant="outline"
                            className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                            onClick={() => handleUpdateStatus('paid')}
                            disabled={updating}
                        >
                            <CreditCard className="h-4 w-4" />
                            Mark as Paid
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/business/invoices/edit/${invoice._id}`)}>
                                Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                Mark as Void
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                Delete Invoice
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Invoice Design */}
            <Card className="max-w-4xl mx-auto shadow-xl border-none ring-1 ring-border">
                <CardContent className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                        <div>
                            {business?.logo ? (
                                <img src={business.logo} alt={business.name} className="h-12 w-auto mb-4" />
                            ) : (
                                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                                    {business?.name?.[0]}
                                </div>
                            )}
                            <h2 className="text-2xl font-black uppercase tracking-tighter">{business?.name}</h2>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {business?.address || "Address not set"}</p>
                                <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {business?.email}</p>
                                <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {business?.phone || "Phone not set"}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-5xl font-black text-muted/20 absolute -top-4 right-8 select-none">INVOICE</h1>
                            <div className="relative">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Invoice Number</p>
                                <p className="text-2xl font-black">{invoiceNumber}</p>

                                <div className="mt-6 flex flex-col items-end gap-2 text-sm">
                                    <div className="flex gap-4">
                                        <span className="text-muted-foreground">Date Issued:</span>
                                        <span className="font-bold">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-muted-foreground">Due Date:</span>
                                        <span className="font-bold">{new Date(dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border my-8" />

                    {/* Bill To */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Bill To</p>
                            <h3 className="text-lg font-bold">{customer.name}</h3>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2 font-medium"><Mail className="h-3 w-3" /> {customer.email}</p>
                                {customer.address && (
                                    <p className="flex items-start gap-2 mt-2">
                                        <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                        <span>{customer.address}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="bg-muted/30 p-6 rounded-2xl flex flex-col justify-center items-end">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Amount Due</p>
                            <p className="text-4xl font-black text-primary">
                                {currency} {totalAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-12">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b-2">
                                    <TableHead className="text-foreground font-bold">Description</TableHead>
                                    <TableHead className="text-foreground font-bold text-center">Qty</TableHead>
                                    <TableHead className="text-foreground font-bold text-right">Price</TableHead>
                                    <TableHead className="text-foreground font-bold text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items.map((item: any, index: number) => (
                                    <TableRow key={index} className="border-b">
                                        <TableCell className="py-4">
                                            <p className="font-semibold">{item.description}</p>
                                        </TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{currency} {item.price.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold">{currency} {item.total.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Summary */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 mt-12">
                        <div className="max-w-xs">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Notes</p>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                {invoice.notes || "No additional notes provided."}
                            </p>
                        </div>
                        <div className="w-full md:w-64 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                <span className="font-bold">{currency} {invoice.subtotal.toLocaleString()}</span>
                            </div>
                            {invoice.tax > 0 && (
                                <div className="flex justify-between text-sm text-amber-600 font-medium">
                                    <span>Tax</span>
                                    <span>+ {currency} {invoice.tax.toLocaleString()}</span>
                                </div>
                            )}
                            {invoice.discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                    <span>Discount</span>
                                    <span>- {currency} {invoice.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t-2 border-primary pt-3 flex justify-between items-center">
                                <span className="text-lg font-black uppercase tracking-tighter">Total</span>
                                <span className="text-2xl font-black text-primary">
                                    {currency} {totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 text-center border-t pt-8">
                        <p className="text-sm text-muted-foreground font-medium">
                            Thank you for your business! If you have any questions, please contact us at {business?.email}.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
