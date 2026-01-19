"use client"

import { OrderForm } from "@/modules/orders/OrderForm"

export default function NewOrderPage() {
    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    New Order
                </h1>
                <p className="text-muted-foreground mt-2">Create a new customer order manually.</p>
            </div>

            <OrderForm />
        </div>
    )
}
