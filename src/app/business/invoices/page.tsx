"use client"

import { useState, useEffect } from "react"
import {
    FileText,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Download,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus
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
import { InvoiceTable } from "@/modules/invoice/InvoiceTable"

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchInvoices = async () => {
            const stored = localStorage.getItem("selectedBusiness");
            if (!stored) return;
            const business = JSON.parse(stored);

            try {
                const res = await fetch(`/api/business/invoices?businessId=${business._id}`)
                if (res.ok) {
                    const data = await res.json()
                    setInvoices(data)
                }
            } catch (error) {
                console.error("Failed to fetch invoices", error)
            } finally {
                setLoading(false)
            }
        }
        fetchInvoices()
    }, [])

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

    const filteredInvoices = invoices.filter(invoice =>
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Invoices</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Create and manage professional invoices for your clients.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity gap-2">
                        <Plus className="h-4 w-4" />
                        New Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Total Outstanding</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                            KES {invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + i.total, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Paid Invoices</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                            {invoices.filter(i => i.status === 'paid').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Overdue</CardTitle>
                        <Clock className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                            {invoices.filter(i => i.status === 'overdue').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Drafts</CardTitle>
                        <FileText className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                            {invoices.filter(i => i.status === 'draft').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold">Recent Invoices</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Search invoices..."
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
                    <InvoiceTable invoices={filteredInvoices} loading={loading} />
                </CardContent>
            </Card>
        </div>
    )
}
