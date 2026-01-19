/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useSearchParams, useRouter, useParams } from "next/navigation"
import { useEffect, useState, Suspense, use } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ReusablePageBuilder } from "@/components/page-builder/ReusablePageBuilder"
import { ProfileData } from "@/types/profile"

function UserPageBuilderContent({ pageType }: { pageType: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userData, setUserData] = useState<ProfileData | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/profile", { cache: "no-store" })
                if (res.ok) {
                    const data = await res.json()
                    setUserData(data)
                } else {
                    toast.error("Failed to load profile")
                }
            } catch (err) {
                console.error("Error fetching user profile:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handleSave = async (updatedData: ProfileData) => {
        setSaving(true)
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            })

            if (res.ok) {
                toast.success("Profile saved successfully!")
                setUserData(updatedData)
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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (!userData) return null

    return (
        <ReusablePageBuilder
            initialData={userData}
            pageType={pageType as any}
            onSave={handleSave}
            onBack={() => router.push('/account')}
            isSaving={saving}
        />
    )
}

export default function UserPageBuilder() {
    const params = useParams()
    const pageType = params.pageType as string

    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        }>
            <UserPageBuilderContent pageType={pageType} />
        </Suspense>
    )
}
