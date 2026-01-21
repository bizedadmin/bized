"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Business, BusinessCard } from "./BusinessCard"

const CATEGORIES = [
    { id: "All", label: "All" },
    { id: "Retail", label: "Retail" },
    { id: "Digital", label: "Digital" },
    { id: "Food", label: "Food" },
    { id: "Services", label: "Services" }
]

export function MarketplaceSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get("q") || "")
    const [category, setCategory] = useState(searchParams.get("category") || "All")
    const [location, setLocation] = useState(searchParams.get("location") || "")
    const [results, setResults] = useState<Business[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch()
        }, 500)
        return () => clearTimeout(timer)
    }, [query, category, location])

    const handleSearch = useCallback(async () => {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (query) params.set("q", query)
        if (category && category !== "All") params.set("category", category)
        if (location) params.set("location", location)

        // Update URL without full reload
        router.push(`/marketplace?${params.toString()}`, { scroll: false })

        try {
            // Mock API call - in real app replace with actual fetch
            const res = await fetch(`/api/marketplace/search?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setResults(data)
            } else {
                // Fallback/Mock data if API fails or doesn't exist yet
                setResults([])
            }
        } catch (e) {
            console.error("Search error", e)
        } finally {
            setIsLoading(false)
        }
    }, [query, category, location, router])


    // Command-K feel keyboard shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                document.getElementById("marketplace-search-input")?.focus()
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">

            {/* Search Bar Section */}
            <div className="bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-zinc-700 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto sticky top-4 z-30">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        id="marketplace-search-input"
                        type="text"
                        placeholder="Search businesses... (⌘K)"
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-transparent font-medium border-none outline-none focus:bg-gray-50 dark:focus:bg-zinc-700 transition-colors placeholder:text-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="hidden md:block w-px h-8 self-center bg-gray-200 dark:bg-zinc-700" />
                <div className="relative group md:w-1/3">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="City or Zip"
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-transparent font-medium border-none outline-none focus:bg-gray-50 dark:focus:bg-zinc-700 transition-colors placeholder:text-gray-400"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <Button
                    className="h-12 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                    onClick={() => { }} // "Near Me" could trigger valid geolocation
                >
                    Near Me
                </Button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${category === cat.id
                                ? "bg-gray-900 text-white shadow-lg scale-105 dark:bg-white dark:text-zinc-900"
                                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700"
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Results */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1">
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin w-5 h-5" /> Searching...
                        </span>
                    ) : (
                        `${results.length} results`
                    )}
                </h2>

                {isLoading && results.length === 0 ? (
                    // Skeleton
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-gray-100 dark:bg-zinc-900 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((biz) => (
                            <BusinessCard key={biz._id} business={biz} />
                        ))}
                        {!isLoading && results.length === 0 && (
                            <div className="col-span-full py-24 text-center text-gray-400">
                                <p className="text-lg">No businesses found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
