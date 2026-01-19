"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { OrderForm } from "@/modules/orders/OrderForm"
import { Loader2 } from "lucide-react"

export default function EditOrderPage() {
    const params = useParams()
    const orderId = params.orderId as string

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/business/orders/${orderId}`)
                if (res.ok) {
                    const data = await res.json()
                    setOrder(data)
                }
            } catch (error) {
                console.error("Failed to fetch order details", error)
            } finally {
                setLoading(false)
            }
        }

        if (orderId) {
            fetchOrder()
        }
    }, [orderId])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold italic">Order not found</h2>
                <p className="text-muted-foreground">The order you are trying to edit does not exist.</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight">Edit Order</h1>
                <p className="text-muted-foreground mt-2">Update details for order #{order._id?.substring(order._id.length - 6).toUpperCase()}.</p>
            </div>

            <OrderForm initialData={order} isEditing={true} />
        </div>
    )
}
