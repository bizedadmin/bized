"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import * as m from "framer-motion"
const { motion, AnimatePresence } = m
import {
    Search,
    Compass,
    MapPin,
    ArrowRight,
    Sparkles,
    ShoppingBag,
    Calendar,
    Target,
    Users,
    ChevronRight,
    ChevronDown,
    Layout,
    Zap,
    TrendingUp,
    Globe,
    Filter,
    Clock,
    Store,
    X,
    Utensils,
    Hotel,
    Coffee,
    Music,
    Dumbbell,
    Palette,
    ShoppingCart,
    Shirt,
    Fuel,
    Stethoscope,
    MoreHorizontal,
    Pizza,
    Beer,
    Bike,
    Trees as Tree,
    Clapperboard,
    Landmark,
    MapPin as Attraction,
    BookOpen as Library,
    Martini,
    Apple,
    Monitor,
    Home as HomeIcon,
    Car,
    Trophy,
    Key,
    Mail,
    Plus,
    PlayCircle,
    PlayCircle as Parking
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { ResponsiveDrawer } from "@/components/ui/responsive-drawer"
import ClientPortalShell from "@/components/portal/ClientPortalShell"

const GROUPED_CATEGORIES = [
    {
        name: "Food & Drink",
        icon: Utensils,
        items: [
            { name: "Restaurants", icon: Utensils },
            { name: "Takeout", icon: Pizza },
            { name: "Bars", icon: Beer },
            { name: "Delivery", icon: Bike },
            { name: "Coffee", icon: Coffee }
        ]
    },
    {
        name: "Things to do",
        icon: Compass,
        items: [
            { name: "Parks", icon: Tree },
            { name: "Live music", icon: Music },
            { name: "Gyms", icon: Dumbbell },
            { name: "Movies", icon: Clapperboard },
            { name: "Art", icon: Palette },
            { name: "Museums", icon: Landmark },
            { name: "Attractions", icon: Attraction },
            { name: "Libraries", icon: Library },
            { name: "Nightlife", icon: Martini }
        ]
    },
    {
        name: "Shopping",
        icon: ShoppingBag,
        items: [
            { name: "Groceries", icon: Apple },
            { name: "Shopping centers", icon: Store },
            { name: "Beauty supplies", icon: Sparkles },
            { name: "Electronics", icon: Monitor },
            { name: "Car dealers", icon: Car },
            { name: "Sporting goods", icon: Trophy },
            { name: "Home & garden", icon: HomeIcon },
            { name: "Convenience stores", icon: Store },
            { name: "Apparel", icon: Shirt }
        ]
    },
    {
        name: "Services",
        icon: Sparkles,
        items: [
            { name: "Hotels", icon: Hotel },
            { name: "Gas", icon: Fuel },
            { name: "ATMs", icon: Library }, // Using library icon as filler for ATM if Banknote not imported
            { name: "Hospitals & clinics", icon: Stethoscope },
            { name: "Beauty salons", icon: Sparkles },
            { name: "Libraries", icon: Library },
            { name: "Car rental", icon: Key },
            { name: "Mail & shipping", icon: Mail },
            { name: "Car wash", icon: Zap },
            { name: "Parking", icon: Parking },
            { name: "Dry cleaning", icon: Shirt },
            { name: "Pharmacies", icon: Plus },
            { name: "Charging stations", icon: Zap }
        ]
    }
]

const CATEGORIES = GROUPED_CATEGORIES.flatMap(g => g.items)

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
    const [location, setLocation] = useState("")
    const [businesses, setBusinesses] = useState<any[]>([])
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [showStickySearch, setShowStickySearch] = useState(false)
    // Removed searchContainerRef for scroll logic, kept for click outside logic if needed
    // Actually we still use searchContainerRef for the 'click outside' dropdown logic, so keep the ref definition
    const searchContainerRef = useRef<HTMLDivElement>(null)

    const fetchBusinesses = async () => {
        try {
            const params = new URLSearchParams()
            if (searchQuery) params.set('q', searchQuery)
            if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory)
            // Note: We don't filter by location in the dropdown preview for now, or we could if we want

            const res = await fetch(`/api/marketplace/search?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setBusinesses(data)
            }
        } catch (error) {
            console.error("Error fetching marketplace data:", error)
        }
    }

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (searchQuery) params.set('q', searchQuery)
        if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory)
        if (location) params.set('location', location)

        router.push(`/marketplace/search?${params.toString()}`)
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

    // Hover state text
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleCategoryEnter = (category: string) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        setHoveredCategory(category)
    }

    const handleCategoryLeave = (category: string) => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCategory((prev) => (prev === category ? null : prev))
        }, 300)
    }

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        }
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <Button size="sm" className="rounded-full px-3 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleSearch}>
                <Search className="sm:hidden w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
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

                    <div className="mt-8 w-full max-w-lg mx-auto">
                        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
                            {GROUPED_CATEGORIES.map((category) => (
                                <button
                                    key={category.name}
                                    onClick={() => {
                                        handleSearch()
                                        setSelectedCategory(category.name)
                                    }}
                                    className="flex items-center justify-center gap-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm shadow-sm hover:shadow-md border border-gray-200/50 dark:border-zinc-700/50 rounded-full py-2.5 px-4 transition-all duration-300 group"
                                >
                                    <category.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Abstract Background Decor */}
                    {/* Abstract Background Decor - Now handles the clipping/border */}
                    <div className="absolute inset-0 z-0 rounded-[32px] overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-50 dark:bg-purple-900/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 w-full">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Discover, Book, and Buy <br />
                                <span className="text-blue-600">Every Essential Local Service</span> and Product Here
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
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                                    placeholder="Location (e.g. Nairobi)"
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-transparent font-medium border-none outline-none focus:bg-gray-50 dark:focus:bg-zinc-700 transition-colors placeholder:text-gray-400 text-lg"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button
                                className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 z-10"
                                onClick={handleSearch}
                            >
                                Search
                            </Button>
                        </div>

                        {/* Quick Category Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                            {GROUPED_CATEGORIES.map((group) => (
                                <div
                                    key={group.name}
                                    className="relative"
                                    onMouseEnter={() => handleCategoryEnter(group.name)}
                                    onMouseLeave={() => handleCategoryLeave(group.name)}
                                >
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-10 md:h-14 px-4 md:px-8 rounded-full bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 group flex items-center gap-2 md:gap-3 relative z-[60]"
                                        onClick={() => {
                                            // Optional: Click toggles or opens
                                            if (hoveredCategory === group.name) setHoveredCategory(null)
                                            else handleCategoryEnter(group.name)
                                        }}
                                    >
                                        <group.icon className="w-4 h-4 md:w-6 h-6 text-gray-900 dark:text-white" />
                                        <span className="font-bold text-gray-900 dark:text-white text-sm md:text-lg">{group.name}</span>
                                        <ChevronDown className={`w-3 h-3 md:w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${hoveredCategory === group.name ? 'rotate-180' : ''}`} />
                                    </Button>

                                    <AnimatePresence>
                                        {hoveredCategory === group.name && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[340px] p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl z-50 origin-top"
                                            >
                                                {/* Arrow Pointer */}
                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-900 border-t border-l border-gray-100 dark:border-zinc-800 rotate-45" />

                                                <div className="relative z-10 grid grid-cols-2 gap-2">
                                                    {group.items.map((item) => (
                                                        <button
                                                            key={item.name}
                                                            className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-left transition-colors group/item"
                                                            onClick={() => {
                                                                setSelectedCategory(item.name);
                                                                setSearchQuery("");
                                                                setIsSearchFocused(false);
                                                                setHoveredCategory(null)
                                                            }}
                                                        >
                                                            <item.icon className="w-4 h-4 text-blue-500 shrink-0 group-hover/item:text-blue-600" />
                                                            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white truncate">{item.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


            </div >
        </ClientPortalShell >
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
