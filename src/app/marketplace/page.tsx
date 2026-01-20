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
    Layout
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ClientPortalShell from "@/components/portal/ClientPortalShell"

const CATEGORIES = [
    "All", "Beauty & Wellness", "Retail", "Healthcare", "Education", "Food & Beverage", "Professional Services", "Entertainment"
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
            <div className="p-4 sm:p-8 space-y-12 pb-32">
                {/* Marketplace Hero */}
                <section className="relative rounded-[40px] overflow-hidden bg-zinc-900 text-white p-8 md:p-16">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
                        <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 max-w-2xl space-y-6">
                        <Badge variant="secondary" className="bg-white/10 text-white border-none px-4 py-1 font-bold tracking-widest uppercase italic">
                            <Sparkles className="w-3 h-3 mr-2" /> Global Discovery
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] italic uppercase">
                            Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">BizEd</span> Ecosystem
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
                            Discover premier local businesses, independent creators, and professional services across the network.
                        </p>

                        <div className="relative max-w-md pt-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input
                                placeholder="Search products, services, or brands..."
                                className="pl-12 h-14 bg-white/10 border-white/5 rounded-2xl text-white placeholder:text-gray-500 focus-visible:ring-blue-500/50 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 h-12 rounded-2xl whitespace-nowrap text-sm font-black uppercase tracking-widest italic transition-all border-2 ${selectedCategory === cat
                                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl'
                                    : 'bg-white text-zinc-500 border-gray-100 hover:border-gray-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Compass className="w-8 h-8 text-blue-500" />
                            Verified Partners
                        </h2>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{businesses.length} found</span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[400px] rounded-[32px] bg-gray-100 dark:bg-zinc-900 animate-pulse" />
                            ))}
                        </div>
                    ) : businesses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {businesses.map((biz) => (
                                <Card key={biz._id} className="group border-none bg-white dark:bg-zinc-900 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[32px] overflow-hidden flex flex-col">
                                    <div className="h-48 relative bg-zinc-100 dark:bg-zinc-800">
                                        {biz.image ? (
                                            <img src={biz.image} alt={biz.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-200 uppercase">
                                                {biz.name.substring(0, 2)}
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black text-[10px] uppercase italic">
                                                {biz.industry || "General"}
                                            </Badge>
                                        </div>
                                        <div className="absolute -bottom-10 left-8">
                                            <div
                                                className="w-20 h-20 rounded-[28px] bg-white p-1 shadow-2xl overflow-hidden ring-4 ring-white"
                                            >
                                                {biz.logo ? (
                                                    <img src={biz.logo} alt="" className="w-full h-full object-cover rounded-[24px]" />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white font-black text-2xl rounded-[24px]">
                                                        {biz.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 pt-14 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-2xl font-black tracking-tight leading-none group-hover:italic transition-all">
                                                    {biz.name}
                                                </h3>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <span className="text-xs font-black">4.9</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-6 font-medium italic">
                                                {biz.description || `Discover high-quality ${biz.industry?.toLowerCase()} services and products tailored for you.`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                className="flex-1 bg-zinc-900 text-white rounded-2xl h-12 font-black uppercase italic tracking-widest text-xs group/btn"
                                                asChild
                                            >
                                                <Link href={`/${biz.slug}`}>
                                                    Visit Brand
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" className="w-12 h-12 rounded-2xl p-0 border-gray-100 hover:bg-gray-50 flex items-center justify-center" asChild>
                                                <Link href={`/${biz.slug}`}>
                                                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-zinc-800">
                            <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase mb-2">No results found</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-lg leading-relaxed font-medium">
                                We couldn't find any brands matching your current filters. Try searching for something else!
                            </p>
                            <Button
                                variant="ghost"
                                className="mt-8 font-black uppercase italic tracking-widest"
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                            >
                                Clear all filters
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
