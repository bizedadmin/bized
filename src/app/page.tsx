"use client"

import { useEffect, useState, Suspense, useRef } from "react"
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
    Clock,
    Store,
    X
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

const POPULAR_SERVICES = [
    "Male Haircut", "Haircut & Beard", "Kid's Haircut",
    "Female Haircut", "Skin Fade", "Gel Manicure",
    "Lash Lift", "Massage", "Eyebrow Shaping"
]

const ALL_MOCK_SERVICES = [
    ...POPULAR_SERVICES,
    "Beard Trim", "Hair Coloring", "Blow Dry", "Pedicure", "Facial",
    "Waxing", "Makeup", "Tattoo", "Piercing", "Physiotherapy"
]

function MarketplaceContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "")
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "All")
    const [businesses, setBusinesses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [showStickySearch, setShowStickySearch] = useState(false)
    // Removed searchContainerRef for scroll logic, kept for click outside logic if needed
    // Actually we still use searchContainerRef for the 'click outside' dropdown logic, so keep the ref definition
    const searchContainerRef = useRef<HTMLDivElement>(null)

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

    // Close category dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

    // Sticky Search Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            setShowStickySearch(window.scrollY > 400)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })

        // Initial check
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const StickySearchBar = (
        <div className="flex-1 w-full max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    placeholder="Search services..."
                    className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(() => {
                            document.getElementById('search-input')?.focus();
                            setIsSearchFocused(true);
                        }, 500);
                    }}
                />
            </div>
            <div className="relative hidden sm:block w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    placeholder="Location"
                    className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-zinc-800 border-none outline-none font-medium text-sm"
                />
            </div>
            <Button size="sm" className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Search
            </Button>
        </div>
    )

    return (
        <ClientPortalShell
            activeTab="marketplace"
            hideSidebar={true}
            headerContent={showStickySearch ? StickySearchBar : <div />}
        >
            <div className="p-4 sm:p-8 space-y-10 pb-32 max-w-7xl mx-auto">
                {/* Hero Section - Clean, Books/Fresha Style */}
                <section className="relative z-30 p-8 md:p-12 min-h-[500px] flex flex-col items-center justify-center">

                    {/* Abstract Background Decor */}
                    {/* Abstract Background Decor - Now handles the clipping/border */}
                    <div className="absolute inset-0 z-0 rounded-[32px] overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-50 dark:bg-purple-900/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 w-full">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Find local <span className="text-blue-600">favorites</span><br />
                                <span className="opacity-40">Book & Shop Instantly.</span>
                            </h1>
                        </div>

                        {/* Search Bar Container */}
                        <div ref={searchContainerRef} className="relative bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-zinc-700 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto transition-all duration-300">

                            {/* Search Input Area */}
                            <div className="flex-1 relative group z-20">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    id="search-input"
                                    placeholder="Service, business, or category..."
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-transparent font-medium border-none outline-none focus:bg-gray-50 dark:focus:bg-zinc-700 transition-colors placeholder:text-gray-400 text-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    // onFocus={() => setIsSearchFocused(true)}
                                    onMouseDown={() => setIsSearchFocused(true)}
                                    autoComplete="off"
                                />

                                {/* Smart Search Dropdown */}
                                <AnimatePresence>
                                    {isSearchFocused && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full left-0 w-[120%] -ml-[10%] md:w-[140%] md:-ml-[20%] lg:w-full lg:ml-0 mt-4 p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 z-50 overflow-hidden text-left"
                                        >
                                            {/* Pointer Arrow */}
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-900 border-t border-l border-gray-100 dark:border-zinc-800 rotate-45 transform" />

                                            {searchQuery.length === 0 ? (
                                                /* Empty State: Popular Services */
                                                <div className="relative z-10">
                                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Popular services</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {POPULAR_SERVICES.map(service => (
                                                            <button
                                                                key={service}
                                                                onClick={() => { setSearchQuery(service); setIsSearchFocused(false); }}
                                                                className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors"
                                                            >
                                                                {service}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Refined State: Search Matches */
                                                <div className="relative z-10 space-y-6">
                                                    {/* Services Matches */}
                                                    <div>
                                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Services</h3>
                                                        <div className="space-y-1">
                                                            {ALL_MOCK_SERVICES.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(service => (
                                                                <button
                                                                    key={service}
                                                                    onClick={() => { setSearchQuery(service); setIsSearchFocused(false); }}
                                                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:text-blue-500">
                                                                        <Search className="w-4 h-4" />
                                                                    </div>
                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                        {service.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                                                                            part.toLowerCase() === searchQuery.toLowerCase() ? <strong key={i}>{part}</strong> : part
                                                                        )}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                            {/* No service matches fallback */}
                                                            {ALL_MOCK_SERVICES.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                                                <div className="text-sm text-gray-400 italic px-2">No matching services</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Business Matches */}
                                                    <div>
                                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Businesses</h3>
                                                        <div className="space-y-2">
                                                            {businesses.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                                                businesses.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(biz => (
                                                                    <Link href={`/${biz.slug}`} key={biz._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group">
                                                                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                                                                            {biz.logo ? <img src={biz.logo} className="w-full h-full object-cover" /> : null}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                                                {biz.name}
                                                                            </h4>
                                                                            <p className="text-xs text-gray-500 truncate">{biz.address || "Online Business"}</p>
                                                                        </div>
                                                                    </Link>
                                                                ))
                                                            ) : (
                                                                <div className="text-sm text-gray-400 italic px-2">No matching businesses</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="md:w-px h-px md:h-12 bg-gray-200 dark:bg-zinc-700 mx-2" />

                            <div className="flex-1 relative group z-10">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    placeholder="Current Location"
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-transparent font-medium border-none outline-none focus:bg-gray-50 dark:focus:bg-zinc-700 transition-colors placeholder:text-gray-400 text-lg"
                                />
                            </div>
                            <Button className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 z-10">
                                Search
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Dual CTA Section - Customer vs Business */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Card */}
                    <div className="relative overflow-hidden rounded-[32px] bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-8 md:p-10 flex flex-col items-start justify-center group h-[400px]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-48 h-48 text-blue-600 rotate-12" />
                        </div>
                        <div className="z-10 bg-white dark:bg-zinc-800 p-3 rounded-2xl mb-6 shadow-sm ring-1 ring-black/5">
                            <Search className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="z-10 text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            Book your next<br />appointment
                        </h2>
                        <p className="z-10 text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-sm text-lg leading-relaxed">
                            Discover local professionals, read reviews, and book instantly.
                        </p>
                        <Button className="z-10 h-14 px-8 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 w-auto text-lg transition-all hover:scale-105" onClick={() => {
                            document.getElementById('search-input')?.focus();
                            setIsSearchFocused(true);
                        }}>
                            Explore Marketplace
                        </Button>
                    </div>

                    {/* Business Card */}
                    <div className="relative overflow-hidden rounded-[32px] bg-zinc-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 p-8 md:p-10 flex flex-col items-start justify-center group h-[400px]">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp className="w-56 h-56 text-zinc-900 dark:text-white -rotate-12" />
                        </div>
                        <div className="z-10 bg-zinc-900 dark:bg-white p-3 rounded-2xl mb-6 shadow-sm ring-1 ring-white/10">
                            <Store className="w-8 h-8 text-white dark:text-black" />
                        </div>
                        <h2 className="z-10 text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            Bized for your<br />business
                        </h2>
                        <p className="z-10 text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-sm text-lg leading-relaxed">
                            Calendar, Marketing, and Payments all in one place.
                        </p>
                        <Button className="z-10 h-14 px-8 rounded-2xl font-bold bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white shadow-xl w-auto text-lg transition-all hover:scale-105" asChild>
                            <Link href="/create-business">
                                Grow My Business
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 py-4">
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-full h-10 px-5 text-sm font-bold border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300">
                            <Filter className="w-4 h-4 mr-2" /> Filters
                        </Button>
                        <Button variant="outline" className="rounded-full h-10 px-5 text-sm font-bold border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300">
                            Mobile Services
                        </Button>
                        <Button variant="outline" className="rounded-full h-10 px-5 text-sm font-bold border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300">
                            Top Rated
                        </Button>
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                        {businesses.length} spots near you
                    </div>
                </div>

                {/* Listing Grid - Fresha/Booksy Inspired */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 rounded-[32px] bg-gray-100 dark:bg-zinc-900 animate-pulse border border-gray-200 dark:border-zinc-800" />
                        ))}
                    </div>
                ) : businesses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {businesses.map((biz, idx) => (
                            <motion.div
                                key={biz._id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link href={`/${biz.slug}`} className="block h-full">
                                    <div className="group h-full bg-transparent hover:-translate-y-2 transition-transform duration-300">
                                        <Card className="h-full border-none bg-transparent shadow-none">
                                            {/* Image Card */}
                                            <div className="aspect-[4/3] rounded-[32px] overflow-hidden bg-gray-100 dark:bg-zinc-800 relative mb-4 shadow-sm border border-gray-100 dark:border-zinc-800 group-hover:shadow-2xl transition-all duration-300">
                                                {biz.image ? (
                                                    <img src={biz.image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-200 dark:text-zinc-700 uppercase">
                                                        {biz.name.substring(0, 2)}
                                                    </div>
                                                )}

                                                <div className="absolute top-4 left-4">
                                                    <div className="bg-white/90 backdrop-blur-xl rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm border border-white/20">
                                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                        <span className="text-xs font-bold text-gray-900">5.0</span>
                                                        <span className="text-[10px] text-gray-400 font-semibold">(128)</span>
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                                                    {biz.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {biz.description || "Premium styling & wellness services"}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 pt-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>0.8 miles • {biz.industry || "General"}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-50 dark:bg-zinc-900 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-zinc-800 col-span-full">
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

export default function Home() {
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
