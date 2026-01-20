"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { CustomerDetail } from "@/modules/customers/CustomerDetail"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
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

    return <CustomerDetail customer={customer} />
}
