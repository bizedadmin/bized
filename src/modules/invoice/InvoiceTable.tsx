"use client"

import {
    MoreHorizontal,
    Eye,
    Download,
    Send
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

interface InvoiceTableProps {
    invoices: any[]
    loading: boolean
}

export function InvoiceTable({ invoices, loading }: InvoiceTableProps) {
    const router = useRouter()
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'draft':
                return <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200">Draft</Badge>
            case 'sent':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>
            case 'paid':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>
            case 'overdue':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>
            case 'cancelled':
                return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Cancelled</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="w-[120px] font-semibold">Invoice #</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Amount</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                            Loading invoices...
                        </TableCell>
                    </TableRow>
                ) : invoices.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                            No invoices found.
                        </TableCell>
                    </TableRow>
                ) : (
                    invoices.map((invoice) => {
                        const invoiceNumber = invoice.identifier
                        const paymentStatus = invoice.paymentStatus
                        const totalAmount = invoice.totalPaymentDue.price
                        const currency = invoice.totalPaymentDue.priceCurrency
                        const dueDate = invoice.paymentDueDate
                        const customer = invoice.customer

                        return (
                            <TableRow key={invoice._id} className="border-b transition-colors">
                                <TableCell className="font-medium">
                                    {invoiceNumber}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{customer.name}</span>
                                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(paymentStatus)}</TableCell>
                                <TableCell className="text-right font-bold">
                                    {currency} {totalAmount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(dueDate).toLocaleDateString()}
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
                                                onClick={() => router.push(`/business/invoices/${invoice._id}`)}
                                            >
                                                <Eye className="mr-2 h-4 w-4" /> View Invoice
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer text-primary focus:text-primary">
                                                <Send className="mr-2 h-4 w-4" /> Send to Client
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Download className="mr-2 h-4 w-4" /> Download PDF
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
