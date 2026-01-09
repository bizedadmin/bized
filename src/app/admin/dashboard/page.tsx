"use client"

import { useEffect, useState } from "react"
import { AdminNavbar } from "@/components/admin/AdminNavbar"
import { BusinessCard } from "@/components/admin/BusinessCard"
import { Button } from "@/components/ui/button"
import { Add } from "iconsax-reactjs"
import { Loader2, Zap } from "lucide-react"

import { useRouter } from "next/navigation"

interface Business {
    _id: string
    name: string
    slug: string
    plan: string
}

export default function DashboardPage() {
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)

    const router = useRouter()



    useEffect(() => {
        fetchBusinesses()
    }, [])

    const fetchBusinesses = async () => {
        try {
            const res = await fetch("/api/businesses")
            if (res.ok) {
                const data = await res.json()
                setBusinesses(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <AdminNavbar />

            <main className="container max-w-3xl mx-auto py-12 px-4 space-y-8">

                {/* Business List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                        </div>
                    ) : businesses.length > 0 ? (
                        businesses.map(biz => (
                            <BusinessCard
                                key={biz._id}
                                id={biz._id}
                                name={biz.name}
                                slug={biz.slug}
                                plan={biz.plan}
                            />
                        ))
                    ) : (
                        <div className="text-center p-8 text-muted-foreground">
                            No organizations found. Create one directly below.
                        </div>
                    )}
                </div>

                {/* Create Button */}
                <button
                    onClick={() => router.push("/create-business")}
                    className="w-full bg-white dark:bg-card border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent transition-colors"
                >
                    <Add size="20" />
                    <span className="font-medium">Create organization</span>
                </button>

                {/* Upgrade Banner */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Zap size="16" fill="currentColor" />
                        </div>
                        <span className="font-medium text-blue-900 dark:text-blue-100">Upgrade to Business</span>
                    </div>
                    <Button variant="secondary" className="bg-white dark:bg-card text-blue-900 dark:text-blue-100 shadow-sm hover:bg-blue-50">
                        Upgrade
                    </Button>
                </div>

            </main>
        </div>
    )
}
