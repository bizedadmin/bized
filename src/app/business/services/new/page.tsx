"use client"

import { useEffect, useState } from "react"
import { ServiceForm } from "@/components/business/services/ServiceForm"
import { Loader2 } from "lucide-react"

export default function NewServicePage() {
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedBusiness = localStorage.getItem("selectedBusiness")
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness)
            setBusinessId(parsed._id)
        }
        setLoading(false)
    }, [])

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

    return (
        <div className="max-w-5xl mx-auto py-6">
            <ServiceForm businessId={businessId} />
        </div>
    )
}
