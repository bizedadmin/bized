"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import * as m from "framer-motion"
const { motion, AnimatePresence } = m
import {
    Search,
    Compass,
    Star,
    ArrowUpRight,
    MapPin,
    ArrowRight,
    Sparkles,
    ShoppingBag,
    Calendar,
    Target,
    Users,
    ChevronRight,
    Layout,
    Zap,
    TrendingUp,
    Globe,
    Filter,
    Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ClientPortalShell from "@/components/portal/ClientPortalShell"

const CATEGORIES = [
    { name: "All", icon: Compass },
    { name: "Beauty & Wellness", icon: Sparkles },
    { name: "Barbers & Hair", icon: Users },
    { name: "Retail", icon: ShoppingBag },
    { name: "Education", icon: Target },
    { name: "Food & Beverage", icon: Zap },
    { name: "Professional Services", icon: Calendar },
    { name: "Entertainment", icon: Star }
]

function MarketplaceContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "")
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "All")
    const [businesses, setBusinesses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchBusinesses = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()
            if (searchQuery) params.set('q', searchQuery)
            if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory)

            const res = await fetch(`/api/marketplace/search?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setBusinesses(data)
            }
        } catch (error) {
            console.error("Error fetching marketplace data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBusinesses()
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery, selectedCategory])

    // Generate Sidebar Items for Marketplace
    const marketplaceNavItems = [
        {
            id: 'discover',
            label: 'Discover',
            icon: Compass,
            onClick: () => { setSelectedCategory("All"); setSearchQuery(""); }
        },
        ...CATEGORIES.map(cat => ({
            id: `cat-${cat.name}`,
            label: cat.name,
            icon: cat.icon,
            onClick: () => setSelectedCategory(cat.name)
        }))
    ]

    return (
        <ClientPortalShell
            activeTab="marketplace"
            customNavItems={marketplaceNavItems}
        >
            <div className="p-4 sm:p-8 space-y-10 pb-32">
                {/* Hero Section - Clean, Books/Fresha Style */}
                <section className="relative rounded-[32px] overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm p-8 md:p-12">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Find local <span className="text-blue-600">favorites</span><br />
                                <span className="opacity-40">Book & Shop Instantly.</span>
                            </h1>
                        </div>

                        {/* Search Bar Container */}
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-zinc-700 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    placeholder="Service, business, or product..."
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-transparent font-medium border-none outline-none focus:bg-gray-50 dark:focus:bg-zinc-700 transition-colors placeholder:text-gray-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="md:w-px h-px md:h-12 bg-gray-200 dark:bg-zinc-700 mx-2" />
                            <div className="flex-1 relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    placeholder="Current Location"
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-transparent font-medium border-none outline-none focus:bg-gray-50 dark:focus:bg-zinc-700 transition-colors placeholder:text-gray-400"
                                />
                            </div>
                            <Button className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                                Search
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Filters Row */}
                <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-full h-9 text-xs font-bold border-gray-200 bg-white hover:bg-gray-50">
                            <Filter className="w-3 h-3 mr-2" /> Filters
                        </Button>
                        <Button variant="outline" className="rounded-full h-9 text-xs font-bold border-gray-200 bg-white hover:bg-gray-50">
                            Mobile Services
                        </Button>
                        <Button variant="outline" className="rounded-full h-9 text-xs font-bold border-gray-200 bg-white hover:bg-gray-50">
                            Top Rated
                        </Button>
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                        {businesses.length} spots near you
                    </div>
                </div>

                {/* Listing Grid - Fresha/Booksy Inspired */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-gray-100 dark:bg-zinc-900 animate-pulse border border-gray-200 dark:border-zinc-800" />
                        ))}
                    </div>
                ) : businesses.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {businesses.map((biz, idx) => (
                            <motion.div
                                key={biz._id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link href={`/${biz.slug}`} className="block h-full">
                                    <Card className="group h-full border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-row">
                                        {/* Left: Image (Larger) */}
                                        <div className="w-1/3 sm:w-2/5 relative bg-gray-100 dark:bg-zinc-800">
                                            {biz.image ? (
                                                <img src={biz.image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-200 dark:text-zinc-700 uppercase">
                                                    {biz.name.substring(0, 2)}
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <div className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    <span className="text-xs font-bold text-gray-900">5.0</span>
                                                    <span className="text-[10px] text-gray-500 font-medium">(120)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Info */}
                                        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-[10px] font-bold uppercase tracking-wide mb-2 line-clamp-1 w-fit">
                                                        {biz.industry || "Business"}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{biz.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                                    {biz.description || "Premium services available for booking."}
                                                </p>

                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-4">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>2.5 km • Downtown</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                                        {biz.logo ? <img src={biz.logo} className="w-full h-full object-cover" /> : null}
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-semibold hidden sm:inline-block">Official Partner</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:underline">
                                                    Book Now <ArrowUpRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-50 dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-zinc-700">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No results found</h3>
                        <p className="text-sm text-gray-500">Simplify your search or try new keywords.</p>
                    </div>
                )}
            </div>
        </ClientPortalShell>
    )
}

export default function MarketplacePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Layout className="w-12 h-12 animate-pulse text-zinc-300" />
            </div>
        }>
            <MarketplaceContent />
        </Suspense>
    )
}
