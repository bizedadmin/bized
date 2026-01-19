"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { InvoiceDetail } from "@/modules/invoice/InvoiceDetail"
import { Loader2 } from "lucide-react"

export default function InvoicePage() {
    const params = useParams()
    const invoiceId = params.invoiceId as string

    const [invoice, setInvoice] = useState<any>(null)
    const [business, setBusiness] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch invoice
                const invRes = await fetch(`/api/business/invoices/${invoiceId}`)
                if (invRes.ok) {
                    const invData = await invRes.json()
                    setInvoice(invData)
                }

                // Get business from local storage
                const stored = localStorage.getItem("selectedBusiness")
                if (stored) {
                    setBusiness(JSON.parse(stored))
                }
            } catch (error) {
                console.error("Failed to fetch invoice details", error)
            } finally {
                setLoading(false)
            }
        }

        if (invoiceId) {
            fetchData()
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
                <h2 className="text-2xl font-bold italic">Invoice not found</h2>
                <p className="text-muted-foreground">The invoice you are looking for does not exist or has been deleted.</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <InvoiceDetail invoice={invoice} business={business} />
        </div>
    )
}
