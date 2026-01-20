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
    Globe
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ClientPortalShell from "@/components/portal/ClientPortalShell"

const CATEGORIES = [
    { name: "All", icon: Compass },
    { name: "Beauty & Wellness", icon: Sparkles },
    { name: "Retail", icon: ShoppingBag },
    { name: "Healthcare", icon: Users },
    { name: "Education", icon: Target },
    { name: "Food & Beverage", icon: Zap }, // Placeholder icon
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

    return (
        <ClientPortalShell activeTab="marketplace">
            <div className="p-4 sm:p-8 space-y-16 pb-32">
                {/* Hero Section - Super Modern & Engaging */}
                <section className="relative rounded-[48px] overflow-hidden bg-zinc-900 text-white min-h-[500px] flex items-center justify-center text-center p-8 md:p-16 isolate">
                    {/* Background Effects */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-blue-600/20 to-transparent blur-3xl opacity-50" />
                        <div className="absolute bottom-0 left-0 w-3/4 h-full bg-gradient-to-r from-purple-600/20 to-transparent blur-3xl opacity-50" />
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                    </div>

                    <div className="relative z-10 max-w-4xl space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent font-bold tracking-wide uppercase text-xs">Global Marketplace Live</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-8xl font-black tracking-tighter leading-none"
                        >
                            <span className="inline-block bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">Discover</span><br />
                            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 italic pr-2">Next-Gen</span>
                            Brands.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-zinc-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed"
                        >
                            Explore a curated collection of businesses, creators, and services. Connect instantly and start your journey.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative max-w-xl mx-auto pt-6"
                        >
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    placeholder="Search specific brands, industries, or services..."
                                    className="pl-16 pr-4 h-20 bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-transparent text-xl shadow-2xl shadow-black/50 transition-all hover:bg-white/10 focus:bg-zinc-900"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Categories - Visual Chips */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Browse Categories
                        </h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mask-gradient-x">
                        {CATEGORIES.map((cat, idx) => {
                            const Icon = cat.icon
                            return (
                                <motion.button
                                    key={cat.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`group relative flex items-center gap-3 pl-4 pr-6 h-14 rounded-2xl whitespace-nowrap text-sm font-bold transition-all border ${selectedCategory === cat.name
                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl scale-105'
                                            : 'bg-white hover:bg-gray-50 text-zinc-600 border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${selectedCategory === cat.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800'
                                        }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="uppercase tracking-wide">{cat.name}</span>
                                    {selectedCategory === cat.name && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-4 mb-2" />
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>
                </div>

                {/* Results Grid - Staggered & Premium */}
                <div className="space-y-8">
                    <div className="flex items-end justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                                <Globe className="w-8 h-8 text-indigo-500" />
                                Featured Businesses
                            </h2>
                            <p className="text-gray-500 font-medium mt-1">Curated selection based on your preferences</p>
                        </div>
                        <Badge variant="outline" className="h-9 px-4 rounded-xl border-gray-200 text-gray-500">
                            {businesses.length} Results
                        </Badge>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[450px] rounded-[40px] bg-gray-100 dark:bg-zinc-900 animate-pulse" />
                            ))}
                        </div>
                    ) : businesses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {businesses.map((biz, idx) => (
                                <motion.div
                                    key={biz._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Link href={`/${biz.slug}`} className="block h-full">
                                        <Card className="group h-full border-none bg-white dark:bg-zinc-900 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 rounded-[40px] overflow-hidden flex flex-col relative hover:-translate-y-2">
                                            {/* Image Area */}
                                            <div className="h-64 relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />

                                                {biz.image ? (
                                                    <img src={biz.image} alt={biz.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl font-black text-gray-200 dark:text-zinc-700 uppercase">
                                                        {biz.name.substring(0, 2)}
                                                    </div>
                                                )}

                                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                                    <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-lg">
                                                        {biz.industry || "Brand"}
                                                    </Badge>
                                                    {idx < 3 && (
                                                        <Badge className="bg-amber-400 text-amber-900 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-lg flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-amber-800" /> Featured
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="absolute bottom-6 left-6 z-20 w-fit">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-[20px] bg-white p-1 shadow-2xl overflow-hidden ring-2 ring-white/20 backdrop-blur-sm">
                                                            {biz.logo ? (
                                                                <img src={biz.logo} alt="" className="w-full h-full object-cover rounded-[16px]" />
                                                            ) : (
                                                                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white font-black text-xl rounded-[16px]">
                                                                    {biz.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-white">
                                                            <h3 className="text-2xl font-black tracking-tight leading-none mb-1 group-hover:text-blue-300 transition-colors">
                                                                {biz.name}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-white/80 text-xs font-medium">
                                                                <MapPin className="w-3 h-3" />
                                                                Online Business
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hover Action */}
                                                <div className="absolute bottom-6 right-6 z-20 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-8 flex-1 flex flex-col justify-between bg-white dark:bg-zinc-900">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed font-medium mb-6">
                                                    {biz.description || `Experience premium services and products from ${biz.name}. Join thousands of satisfied customers today.`}
                                                </p>

                                                <div className="flex items-center gap-2 pt-6 border-t border-gray-50 dark:border-zinc-800 mt-auto">
                                                    <div className="flex -space-x-2">
                                                        {[1, 2, 3].map(j => (
                                                            <div key={j} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                                <Users className="w-3 h-3" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400 ml-2">120+ active members</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-40">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-32 h-32 rounded-full bg-zinc-900/5 mx-auto mb-8 flex items-center justify-center"
                            >
                                <Search className="w-12 h-12 text-zinc-300" />
                            </motion.div>
                            <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-3">No matches found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">Try adjusting your filters or search for broader terms.</p>
                            <Button
                                variant="outline"
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                className="rounded-full h-12 px-8 font-bold border-zinc-200"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
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
