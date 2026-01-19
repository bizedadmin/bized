"use client"

import { InvoiceForm } from "@/modules/invoice/InvoiceForm"

export default function NewInvoicePage() {
    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight">Create Invoice</h1>
                <p className="text-muted-foreground mt-2">Bill your clients professionally in seconds.</p>
            </div>

            <InvoiceForm />
        </div>
    )
}
