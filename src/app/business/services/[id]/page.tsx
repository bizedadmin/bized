"use client"

import { useEffect, useState, use } from "react"
import { ServiceForm } from "@/components/business/services/ServiceForm"
import { Loader2 } from "lucide-react"

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const [service, setService] = useState<any>(null)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Unwrap params using React.use()
    const resolvedParams = use(params)
    const id = resolvedParams.id

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness)
            setBusinessId(parsed._id)
            fetchService(id)
        } else {
            setLoading(false)
        }
    }, [id])

    const fetchService = async (serviceId: string) => {
        try {
            const res = await fetch(`/api/business/services/${serviceId}`)
            if (res.ok) {
                const data = await res.json()
                setService(data)
            }
        } catch (error) {
            console.error("Error fetching service:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!businessId) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center">
                <h2 className="text-xl font-semibold">No Business Selected</h2>
                <p className="text-muted-foreground mt-2">Please select a business to continue.</p>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center">
                <h2 className="text-xl font-semibold">Service Not Found</h2>
                <p className="text-muted-foreground mt-2">The service you are looking for does not exist or you do not have permission to view it.</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto py-6">
            <ServiceForm
                businessId={businessId}
                initialData={service}
                isEditing={true}
            />
        </div>
    )
}
