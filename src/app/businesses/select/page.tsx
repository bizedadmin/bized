"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Plus, ChevronRight, Loader2, Building2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface Business {
    _id: string
    name: string
    slug: string
    industry?: string
    plan?: string
    themeColor?: string
    logo?: string
}

export default function BusinessSelectorPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
            return
        }

        if (status === "authenticated") {
            fetchBusinesses()
        }
    }, [status, router])

    const fetchBusinesses = async () => {
        try {
            const res = await fetch("/api/businesses")
            if (res.ok) {
                const data = await res.json()
                setBusinesses(data)
            }
        } catch (error) {
            console.error("Error fetching businesses:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectBusiness = (business: Business) => {
        // Store selected business in localStorage or session
        localStorage.setItem("selectedBusiness", JSON.stringify(business))
        router.push("/business/dashboard")
    }

    const handleCreateBusiness = () => {
        router.push("/create-business")
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">B</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bized</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {session?.user?.email}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Select a business
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Choose a business to manage or create a new one
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Business Cards */}
                        {businesses.map((business, index) => (
                            <motion.div
                                key={business._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Card
                                    className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-500 dark:hover:border-blue-400 group"
                                    onClick={() => handleSelectBusiness(business)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Business Logo/Icon */}
                                            <div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                                                style={{ backgroundColor: business.themeColor || '#1f2937' }}
                                            >
                                                {business.logo ? (
                                                    <img src={business.logo} alt={business.name} className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    business.name.substring(0, 1).toUpperCase()
                                                )}
                                            </div>

                                            {/* Business Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {business.name}
                                                    </h3>
                                                    {business.plan && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs font-semibold uppercase"
                                                        >
                                                            {business.plan}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    bized.app/{business.slug}
                                                </p>
                                                {business.industry && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        {business.industry}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow Icon */}
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}

                        {/* Create New Business Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: businesses.length * 0.1 }}
                        >
                            <Card
                                className="p-6 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer group"
                                onClick={handleCreateBusiness}
                            >
                                <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold">Create new business</span>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Empty State */}
                        {businesses.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No businesses yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Get started by creating your first business
                                </p>
                                <Button
                                    onClick={handleCreateBusiness}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Business
                                </Button>
                            </motion.div>
                        )}
                    </div>

                    {/* Upgrade Banner */}
                    {businesses.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            className="mt-8"
                        >
                            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                Upgrade to Business
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Unlock advanced features and grow your business
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="bg-white dark:bg-zinc-900">
                                        Upgrade
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
    )
}
