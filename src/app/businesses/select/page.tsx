"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Plus, ChevronRight, Loader2, Building2, Zap, LogOut, User, Settings, Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

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
    const { theme, resolvedTheme } = useTheme()
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
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
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex items-center gap-2">
                                <Image
                                    src={mounted && (theme === "dark" || resolvedTheme === "dark") ? "/logo-dark-mode.png" : "/logo-light-mode.png"}
                                    alt="Bized Logo"
                                    width={40}
                                    height={40}
                                    className={cn(
                                        "h-10 w-auto group-hover:scale-105 transition-transform rounded-sm"
                                    )}
                                    priority
                                />
                                <span className={cn(
                                    "font-bold text-xl tracking-tight text-foreground"
                                )}>
                                    BizedApp
                                </span>
                            </div>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200">
                                    <Avatar className="h-9 w-9 border border-gray-200 dark:border-zinc-700">
                                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                        <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-700 text-sm font-medium">
                                            {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-2 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl rounded-xl" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal p-2">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">{session?.user?.name || "User"}</p>
                                        <p className="text-xs leading-none text-gray-500 dark:text-gray-400 truncate">
                                            {session?.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />
                                <DropdownMenuItem
                                    onClick={() => router.push('/account')}
                                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">My Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <Settings className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Account Settings</span>
                                </DropdownMenuItem>
                                {session?.user?.role === 'admin' && (
                                    <DropdownMenuItem
                                        onClick={() => router.push('/admin')}
                                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Admin Portal</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                    <div className="text-center mb-8 relative">
                        <Button
                            variant="ghost"
                            className="absolute left-0 top-0 pl-0 hover:bg-transparent hover:text-muted-foreground hidden sm:flex"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
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
