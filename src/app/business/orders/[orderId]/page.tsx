"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { OrderDetail } from "@/modules/orders/OrderDetail"
import { Loader2 } from "lucide-react"

export default function OrderPage() {
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
                <p className="text-muted-foreground">The order you are looking for does not exist or has been deleted.</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <OrderDetail order={order} />
        </div>
    )
}
