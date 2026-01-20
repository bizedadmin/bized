
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Map as MapIcon, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BusinessListingCard } from "@/components/business/BusinessListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/marketplace/MapComponent"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div>
});

interface Business {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    industry?: string;
    image?: string;
    address?: {
        addressLocality?: string;
        addressRegion?: string;
        addressCountry?: string;
        lat?: number;
        lng?: number;
    };
    rating?: number;
    reviewCount?: number;
}

export default function MarketplaceSearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialQuery = searchParams.get("q") || "";
    const initialLocation = searchParams.get("location") || "";
    const initialCategory = searchParams.get("category") || "";

    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState(initialLocation);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [showMapMobile, setShowMapMobile] = useState(false);

    const categories = ["All", "Beauty", "Health", "Home", "Auto", "Professional", "Food"];

    const fetchResults = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.append("q", query);
            if (location) params.append("location", location);
            if (activeCategory && activeCategory !== "All") params.append("category", activeCategory);

            const res = await fetch(`/api/marketplace/search?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setBusinesses(data);
            }
        } catch (error) {
            console.error("Failed to fetch search results", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [searchParams, activeCategory]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (location) params.append("location", location);
        if (activeCategory && activeCategory !== "All") params.append("category", activeCategory);

        router.push(`/marketplace/search?${params.toString()}`);
    };

    // Calculate map center based on results or default to generic location (e.g., Nairobi/London)
    const mapCenter: [number, number] = businesses.length > 0 && businesses[0].address?.lat && businesses[0].address?.lng
        ? [businesses[0].address.lat, businesses[0].address.lng]
        : [51.505, -0.09]; // Default fallback

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Header / Search Bar */}
            <div className="bg-background border-b z-20 shadow-sm flex-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex-1 w-full relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search for services..."
                                className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-72 relative group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Location"
                                className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full md:w-auto font-semibold px-6">
                            Search
                        </Button>
                    </form>

                    {/* Categories */}
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${activeCategory === cat || (cat === "All" && !activeCategory)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Split Layout Content */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Left Side: Results List */}
                <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${showMapMobile ? 'hidden md:block' : 'block'}`}>
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-xl font-bold mb-6">
                            {loading ? "Searching..." : `${businesses.length} venues found`}
                        </h1>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="h-48 w-full rounded-xl" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : businesses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                                {businesses.map((business) => (
                                    <BusinessListingCard key={business._id} business={business} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No results found</h3>
                                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Map (Sticky/Fixed on Desktop) */}
                <div className={`md:w-[40%] ls:w-[45%] xl:w-[50%] h-full bg-muted border-l border-border relative ${showMapMobile ? 'block w-full fixed inset-0 z-50 top-[130px]' : 'hidden md:block'}`}>
                    <MapComponent
                        businesses={businesses}
                        center={mapCenter}
                        className="h-full w-full"
                    />
                    {/* Toggle Button for Mobile inside Map View to close it */}
                    {showMapMobile && (
                        <Button
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full shadow-lg z-[1000] px-6"
                            onClick={() => setShowMapMobile(false)}
                        >
                            <List className="w-4 h-4 mr-2" /> Show List
                        </Button>
                    )}
                </div>

                {/* Floating Map Toggle for Mobile List View */}
                {!showMapMobile && (
                    <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                        <Button
                            className="rounded-full shadow-xl px-6"
                            onClick={() => setShowMapMobile(true)}
                        >
                            <MapIcon className="w-4 h-4 mr-2" /> Map View
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
