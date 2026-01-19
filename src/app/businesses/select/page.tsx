"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import {
    Plus,
    Search,
    User,
    ArrowRight,
    LogOut,
    Loader2,
    Briefcase,
    Building2,
    Settings,
    Info,
    ChevronRight,
    Home,
    BadgeCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

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
    const [searchQuery, setSearchQuery] = useState("")
    const [activeInfo, setActiveInfo] = useState<"profile" | "portal" | "business" | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const touchStartY = useRef(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // Gradient Colors
    const myPortalGradient = { light: "from-blue-50/90 via-cyan-50/80 to-sky-50/70", dark: "from-blue-950/40 via-cyan-950/40 to-sky-950/30" }
    const businessPortalGradient = { light: "from-slate-50/90 via-gray-50/80 to-zinc-50/70", dark: "from-slate-950/40 via-gray-950/40 to-zinc-950/30" }

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

    // Pull-to-refresh handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY
        }
    }, [])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (touchStartY.current === 0) return

        const touchY = e.touches[0].clientY
        const pull = touchY - touchStartY.current

        if (pull > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
            setPullDistance(Math.min(pull, 100))
        }
    }, [])

    const handleTouchEnd = useCallback(async () => {
        if (pullDistance > 60 && !isRefreshing) {
            setIsRefreshing(true)
            // Refresh data
            await fetchBusinesses()
            // Small delay for better UX
            setTimeout(() => {
                setIsRefreshing(false)
                setPullDistance(0)
            }, 500)
        } else {
            setPullDistance(0)
        }
        touchStartY.current = 0
    }, [pullDistance, isRefreshing])

    const handleSelectBusiness = (business: Business) => {
        localStorage.setItem("selectedBusiness", JSON.stringify(business))
        router.push("/business/dashboard")
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Searching for:", searchQuery)
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // Refined Glass Card Component
    const GlassCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-sm transition-all duration-300",
                onClick ? "hover:shadow-md hover:border-white/20 dark:hover:border-white/10 cursor-pointer hover:scale-[1.02]" : "",
                className
            )}
        >
            {children}
        </div>
    )

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="min-h-screen font-sans text-foreground overflow-x-hidden overflow-y-auto selection:bg-primary/30 relative flex flex-col items-center"
            style={{ overscrollBehavior: 'contain' }}
        >

            {/* GLOBAL BACKGROUND - Refined & Subtle */}
            <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-20" />
            <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-30 dark:opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[70vw] md:w-[50vw] h-[70vw] md:h-[50vw] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-blue-500/5 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
            </div>

            {/* Pull-to-Refresh Indicator */}
            {pullDistance > 0 && (
                <div
                    className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center transition-all duration-200"
                    style={{
                        height: `${pullDistance}px`,
                        opacity: pullDistance / 100,
                        paddingTop: 'env(safe-area-inset-top)'
                    }}
                >
                    <Loader2
                        className={cn(
                            "w-6 h-6 text-primary transition-transform",
                            isRefreshing ? "animate-spin" : ""
                        )}
                        style={{
                            transform: `rotate(${pullDistance * 3.6}deg)`
                        }}
                    />
                </div>
            )}

            {/* Header / Nav - FIXED & PINNED WITH OFFICIAL LOGO & SAFE AREA */}
            <header
                className="fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-white/10 dark:border-white/5 shadow-sm"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)', paddingBottom: '1rem' }}
            >
                <div className="max-w-lg mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group z-10">
                        {mounted && (
                            <Image
                                src={(theme === "dark" || resolvedTheme === "dark") ? "/logo-dark-mode.png" : "/logo-light-mode.png"}
                                alt="Bized Logo"
                                width={40}
                                height={40}
                                className="h-10 w-auto group-hover:scale-105 transition-transform"
                                priority
                            />
                        )}
                        {!mounted && <div className="w-10 h-10 bg-muted/20 rounded-lg animate-pulse" />}

                        <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">BizedApp</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => signOut()} className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 z-10 w-10 h-10">
                        <LogOut className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                    </Button>
                </div>
            </header>

            {/* MAIN CONTENT - Added Top Padding for Fixed Header */}
            <main
                className="w-full max-w-lg mx-auto px-6 pb-12 flex flex-col gap-8 z-10"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 6rem)' }}
            >

                {/* 1. User Profile Focus - WRAPPED IN LINK */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 mb-3 ml-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">My Portal</h2>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveInfo("profile") }}
                            className="ml-auto p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors group/info"
                        >
                            <Info className="w-5 h-5 text-muted-foreground/60 group-hover/info:text-primary transition-colors" />
                        </button>
                    </div>

                    <Link href="/account" className="block group">
                        <GlassCard className={`aspect-[16/9] p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden hover:shadow-xl hover:border-white/20 dark:hover:border-white/10 cursor-pointer hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br ${myPortalGradient.light} dark:${myPortalGradient.dark}`}>
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                            {/* Top section with avatar and status */}
                            <div className="flex items-start justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-14 w-14 border-2 border-white/40 dark:border-white/20 shadow-lg ring-2 ring-primary/10">
                                        <AvatarImage src={session?.user?.image || ""} />
                                        <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight text-foreground tracking-tight">{session?.user?.name || "User"}</h3>
                                        <p className="text-xs font-medium text-muted-foreground mt-0.5">Personal Account</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Verified</span>
                                </div>
                            </div>

                            {/* Bottom section with details */}
                            <div className="z-10 flex flex-col gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">Email</span>
                                        <span className="text-xs font-medium text-foreground/80 truncate max-w-[140px]">{session?.user?.email}</span>
                                    </div>
                                    <div className="h-8 w-px bg-white/20 dark:bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">Businesses</span>
                                        <span className="text-xs font-bold text-foreground">{businesses.length} Active</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-1 text-primary/60 group-hover:text-primary transition-colors">
                                    <span className="text-xs font-medium">View Portal</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                </motion.div>



                {/* 3. Business Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-4 pl-1 pr-1">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Business Portal</label>
                        </div>
                        <button
                            onClick={() => setActiveInfo("business")}
                            className="mr-auto ml-2 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors group/info"
                        >
                            <Info className="w-5 h-5 text-muted-foreground/60 group-hover/info:text-primary transition-colors" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {businesses.map((business, idx) => (
                            <motion.div
                                key={business._id}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.05) }}
                            >
                                <GlassCard className={`aspect-[16/9] p-5 flex flex-col justify-between hover:bg-white/80 dark:hover:bg-black/60 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${businessPortalGradient.light} dark:${businessPortalGradient.dark}`} onClick={() => handleSelectBusiness(business)}>
                                    {/* Decorative corner accent */}
                                    <div
                                        className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl pointer-events-none"
                                        style={{ backgroundColor: business.themeColor || '#2563eb' }}
                                    />

                                    {/* Top section with logo and badge */}
                                    <div className="flex items-start justify-between z-10">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0 ring-2 ring-white/20"
                                                style={{ backgroundColor: business.themeColor || '#2563eb' }}
                                            >
                                                {business.logo ? (
                                                    <img src={business.logo} alt={business.name} className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <Building2 className="w-6 h-6" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-foreground tracking-tight leading-tight">{business.name}</h3>
                                                <p className="text-xs font-medium text-muted-foreground mt-0.5">{business.industry || "Business"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom section with plan info and action */}
                                    <div className="flex flex-col gap-3 z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">Plan</span>
                                                <span className="text-xs font-bold text-foreground">{business.plan || "Free Plan"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-1.5 transition-colors">
                                            <span className="text-xs font-semibold" style={{ color: business.themeColor || '#2563eb' }}>Open Dashboard</span>
                                            <ChevronRight className="w-3.5 h-3.5" style={{ color: business.themeColor || '#2563eb' }} />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}

                        {/* Create Business Card - WRAPPED IN LINK */}
                        {businesses.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (businesses.length * 0.05) }}
                            >
                                <Link href="/create-business" className="block group/create-link">
                                    <GlassCard
                                        className="p-3 flex items-center justify-center gap-2 border-dashed border-black/10 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 group/create hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-300"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/create:scale-110 transition-transform">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-primary">Create new business</span>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        )}

                        {/* Empty State - Refined & WRAPPED IN LINK */}
                        {businesses.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Link href="/create-business" className="block">
                                    <GlassCard
                                        className="text-center py-10 px-4 border-dashed border-black/10 dark:border-white/10 hover:border-primary/50 cursor-pointer flex flex-col items-center hover:scale-[1.02] transition-all duration-300"
                                    >
                                        <Building2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-foreground">No businesses found</p>
                                        <p className="text-xs font-medium text-muted-foreground mt-1 mb-4">Start your journey by creating a business.</p>
                                        <Button variant="outline" size="sm" className="text-xs h-8 pointer-events-none">
                                            Create Business
                                        </Button>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

            </main>

            {/* Contextual Help Sheet - PROFESSIONAL REDESIGN */}
            <Sheet open={!!activeInfo} onOpenChange={() => setActiveInfo(null)}>
                <SheetContent side="bottom" className="rounded-t-[40px] border-t border-white/20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden outline-none">
                    {/* Access handle */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full z-20" />

                    <div className="relative p-8 pb-10 flex flex-col items-center">
                        {/* Decorative Background Blur */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none -z-10" />

                        {/* Large Icon Container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/20",
                                activeInfo === 'profile' ? "bg-primary text-white shadow-primary/30" :
                                    activeInfo === 'portal' ? "bg-purple-500 text-white shadow-purple-500/30" :
                                        "bg-emerald-500 text-white shadow-emerald-500/30"
                            )}>
                            {activeInfo === "profile" && <User className="w-10 h-10" />}
                            {activeInfo === "portal" && <Search className="w-10 h-10" />}
                            {activeInfo === "business" && <Building2 className="w-10 h-10" />}
                        </motion.div>

                        <div className="text-center space-y-2 max-w-xs mx-auto mb-8">
                            <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                                {activeInfo === "profile" && "User Profile"}
                                {activeInfo === "portal" && "Client Portals"}
                                {activeInfo === "business" && "Business Management"}
                            </SheetTitle>
                            <SheetDescription className="text-center text-sm font-medium text-muted-foreground leading-relaxed">
                                {activeInfo === "profile" && "Manage your personal account settings, verify your identity, and customize your application preferences."}
                                {activeInfo === "portal" && "Securely access specific client portals. Use a unique access code provided to you to enter."}
                                {activeInfo === "business" && "Overview of all business entities you manage. Select a business to access its dashboard."}
                            </SheetDescription>
                        </div>

                        <Button
                            className="w-full max-w-sm h-12 rounded-2xl text-base font-semibold shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.02]"
                            onClick={() => setActiveInfo(null)}
                        >
                            Got it
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    )
}
