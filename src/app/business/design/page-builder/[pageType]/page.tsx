/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useSearchParams, useRouter, useParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ReusablePageBuilder } from "@/components/page-builder/ReusablePageBuilder"
import { ProfileData } from "@/types/profile"

function BusinessPageBuilderContent({ pageType }: { pageType: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const businessId = searchParams.get("businessId")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [business, setBusiness] = useState<ProfileData | null>(null)
    const [products, setProducts] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])

    useEffect(() => {
        if (!businessId) return
        const fetchData = async () => {
            try {
                const [bRes, pRes, sRes] = await Promise.all([
                    fetch(`/api/businesses/${businessId}`),
                    fetch(`/api/products?businessId=${businessId}`),
                    fetch(`/api/services?businessId=${businessId}`)
                ])
                if (bRes.ok) setBusiness(await bRes.json())
                if (pRes.ok) setProducts((await pRes.json()).products || [])
                if (sRes.ok) setServices((await sRes.json()).services || [])
            } catch (err) {
                console.error("Error fetching business data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [businessId])

    const handleSave = async (updatedData: ProfileData) => {
        setSaving(true)
        try {
            const res = await fetch(`/api/businesses/${businessId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            })
            if (res.ok) {
                toast.success("Business profile saved!")
                setBusiness(updatedData)
            } else {
                toast.error("Failed to save changes")
            }
        } catch (error) {
            console.error("Error saving business:", error)
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
    if (!business) return null

    return (
        <ReusablePageBuilder
            initialData={business}
            pageType={pageType as any}
            onSave={handleSave}
            onBack={() => router.push('/business/design')}
            products={products}
            services={services}
            isSaving={saving}
        />
    )
}

export default function BusinessPageBuilder() {
    const params = useParams()
    const pageType = params.pageType as string

    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <BusinessPageBuilderContent pageType={pageType} />
        </Suspense>
    )
}
