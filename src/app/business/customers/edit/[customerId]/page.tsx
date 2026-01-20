"use client"

import { useState, useEffect, use } from "react"
import {
    ChevronLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CustomerForm } from "@/modules/customers/CustomerForm"
import { toast } from "sonner"

export default function EditCustomerPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = use(params)
    const router = useRouter()
    const [customer, setCustomer] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await fetch(`/api/business/customers/${customerId}`)
                if (res.ok) {
                    const data = await res.json()
                    setCustomer(data)
                } else {
                    toast.error("Customer not found")
                    router.push('/business/customers')
                }
            } catch (error) {
                console.error("Failed to fetch customer", error)
                toast.error("An error occurred")
            } finally {
                setLoading(false)
            }
        }
        fetchCustomer()
    }, [customerId, router])

    if (loading) {
        return <div className="flex h-96 items-center justify-center">Loading...</div>
    }

    if (!customer) return null

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
                    <p className="text-muted-foreground">Update customer profile for {customer.name}.</p>
                </div>
            </div>

            <CustomerForm
                initialData={customer}
                isEditing
                onSuccess={() => router.push('/business/customers')}
                onCancel={() => router.back()}
            />
        </div>
    )
}
