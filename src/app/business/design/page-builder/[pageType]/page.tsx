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
        const fetchData = async () => {
            try {
                if (businessId) {
                    const [bRes, pRes, sRes] = await Promise.all([
                        fetch(`/api/businesses/${businessId}`),
                        fetch(`/api/products?businessId=${businessId}`),
                        fetch(`/api/services?businessId=${businessId}`)
                    ])
                    if (bRes.ok) setBusiness(await bRes.json())
                    if (pRes.ok) setProducts((await pRes.json()).products || [])
                    if (sRes.ok) setServices((await sRes.json()).services || [])
                } else {
                    // Fetch Personal Profile
                    const res = await fetch('/api/profile')
                    if (res.ok) setBusiness(await res.json())
                }
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
            const url = businessId ? `/api/businesses/${businessId}` : '/api/profile'
            const method = businessId ? "PUT" : "PUT" // Both use PUT now
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            })
            if (res.ok) {
                toast.success(businessId ? "Business profile saved!" : "Personal profile saved!")
                setBusiness(updatedData)
            } else {
                toast.error("Failed to save changes")
            }
        } catch (error) {
            console.error("Error saving profile:", error)
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
