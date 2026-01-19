"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { InvoiceForm } from "@/modules/invoice/InvoiceForm"
import { Loader2 } from "lucide-react"

export default function EditInvoicePage() {
    const params = useParams()
    const invoiceId = params.invoiceId as string

    const [invoice, setInvoice] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await fetch(`/api/business/invoices/${invoiceId}`)
                if (res.ok) {
                    const data = await res.json()
                    setInvoice(data)
                }
            } catch (error) {
                console.error("Failed to fetch invoice details", error)
            } finally {
                setLoading(false)
            }
        }

        if (invoiceId) {
            fetchInvoice()
        }
    }, [invoiceId])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold">Invoice not found</h2>
                <p className="text-muted-foreground">The invoice you are trying to edit does not exist.</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight">Edit Invoice</h1>
                <p className="text-muted-foreground mt-2">Update the details for invoice {invoice.invoiceNumber}.</p>
            </div>

            <InvoiceForm initialData={invoice} isEditing={true} />
        </div>
    )
}
