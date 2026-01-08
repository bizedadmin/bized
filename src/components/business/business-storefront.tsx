"use client"

import { useState, useEffect } from "react"
import { Phone, MapPin, Clock, ShoppingBag, Search, Filter, Menu, X, Share2, Globe, Heart, Home, ChevronDown, Download, Monitor } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Product {
    _id: string
    name: string
    description?: string
    image?: string
    category?: string
    type?: string
    offers: {
        price: number
        priceCurrency: string
        availability: string
    }
}

interface Business {
    name: string
    slug: string
    description?: string
    industry?: string
    themeColor?: string
    secondaryColor?: string
    whatsappNumber?: string
    whatsappConnected?: boolean
    phone?: {
        code: string
        number: string
    }
    businessHours?: Array<{
        day: string
        isOpen: boolean
        openTime: string
        closeTime: string
    }>
}

interface BusinessStorefrontProps {
    business: Business
    products: Product[]
}

export function BusinessStorefront({ business, products }: BusinessStorefrontProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(true)

    // Close sidebar when selecting a category on mobile
    const handleCategorySelect = (cat: string) => {
        setSelectedCategory(cat)
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false)
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: business.name,
                    text: business.description || `Check out ${business.name} on Bized!`,
                    url: window.location.href,
                })
            } catch (error) {
                console.log('Error sharing:', error)
            }
        } else {
            // Fallback
            alert("Sharing is not supported on this browser")
        }
    }

    // Extract unique categories
    const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[]]

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const formatBusinessHours = (hours: any[]) => {
        if (!hours || hours.length === 0) return null
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
        const todaySchedule = hours.find(h => h.day === today)

        if (!todaySchedule) return null

        return todaySchedule.isOpen
            ? `Open today: ${todaySchedule.openTime} - ${todaySchedule.closeTime}`
            : "Closed today"
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
            {/* Sidebar & Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/40 z-[60]"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-zinc-950 z-[70] shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Sidebar Header */}
                            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                                <div className="font-bold text-lg">Menu</div>
                                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Sidebar Content */}
                            <div className="flex-1 overflow-y-auto py-4">
                                <div className="px-4 mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search items..."
                                            className="pl-9 bg-gray-50 dark:bg-zinc-900 border-none"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleCategorySelect("All")}
                                        className={cn(
                                            "w-full flex items-center px-6 py-3 text-sm font-medium transition-colors",
                                            selectedCategory === "All"
                                                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/10"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
                                        )}
                                    >
                                        <Home className="w-4 h-4 mr-3" />
                                        Home
                                    </button>

                                    {/* Categories Accordion */}
                                    <div>
                                        <button
                                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                            className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
                                        >
                                            <span className="flex items-center">
                                                <Filter className="w-4 h-4 mr-3" />
                                                Categories
                                            </span>
                                            <ChevronDown className={cn("w-4 h-4 transition-transform", isCategoriesOpen ? "rotate-180" : "")} />
                                        </button>
                                        <AnimatePresence>
                                            {isCategoriesOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    {categories.filter(c => c !== "All").map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => handleCategorySelect(cat)}
                                                            className={cn(
                                                                "w-full flex items-center px-12 py-2.5 text-sm transition-colors",
                                                                selectedCategory === cat
                                                                    ? "text-blue-600 font-medium"
                                                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
                                                            )}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-zinc-800 my-4 mx-4" />

                                <div className="space-y-1">
                                    <button className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900">
                                        <Download className="w-4 h-4 mr-3" />
                                        Add to Home Screen
                                    </button>
                                    <button className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900">
                                        <Heart className="w-4 h-4 mr-3" />
                                        Follow
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
                                    >
                                        <Share2 className="w-4 h-4 mr-3" />
                                        Share
                                    </button>
                                    <button className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900">
                                        <span className="flex items-center">
                                            <Globe className="w-4 h-4 mr-3" />
                                            Language
                                        </span>
                                        <span className="text-xs text-gray-500">English</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
                                <Button
                                    variant="outline"
                                    className="w-full rounded-full gap-2 border-gray-200"
                                    onClick={() => window.open('https://bized.com', '_blank')}
                                >
                                    <Monitor className="w-4 h-4" />
                                    Create your Bized App
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <div
                className="relative h-[180px] md:h-[250px] w-full overflow-hidden"
                style={{ backgroundColor: business.secondaryColor || '#f3f4f6' }}
            >
                {/* Menu Toggle Button */}
                <div className="absolute top-4 left-4 z-40">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg bg-white/90 backdrop-blur hover:bg-white"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5 text-gray-900" />
                    </Button>
                </div>

                <div className="absolute inset-0 bg-black/20" /> {/* Overlay for better text contrast/clean look */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent h-24" />
            </div>

            {/* Main Content Container - Overlapping Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-20 pb-20">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-800 min-h-[600px]">

                    {/* Header Info */}
                    <div className="p-6 md:p-8 relative">
                        {/* View Location Button - Desktop top right */}
                        <div className="absolute top-6 right-6 hidden md:block">
                            <Button variant="outline" className="rounded-full border-gray-200 dark:border-zinc-700 text-xs h-8">
                                <MapPin className="w-3 h-3 mr-2" />
                                View Location
                            </Button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Logo */}
                            <div
                                className="w-20 h-20 md:w-32 md:h-32 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-3xl md:text-5xl font-bold shadow-xl border-4 border-white dark:border-zinc-800"
                                style={{ backgroundColor: business.themeColor || '#1f2937' }}
                            >
                                {business.name.substring(0, 1).toUpperCase()}
                            </div>

                            {/* Text Details */}
                            <div className="flex-1 space-y-3 pt-1">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {business.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium my-1">@{business.slug}</p>
                                </div>

                                {business.description && (
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 max-w-2xl">
                                        {business.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-3 items-center">
                                    {business.industry && (
                                        <Badge variant="secondary" className="px-2.5 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium">
                                            {business.industry}
                                        </Badge>
                                    )}
                                    {business.phone && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>{business.phone.code} {business.phone.number}</span>
                                        </div>
                                    )}
                                    {business.businessHours && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{formatBusinessHours(business.businessHours) || "Check hours"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile WhatsApp/Location Actions */}
                        <div className="flex gap-3 mt-6 md:hidden">
                            {business.whatsappConnected && business.whatsappNumber && (
                                <Button
                                    className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-10 text-sm rounded-lg"
                                    onClick={() => window.open(`https://wa.me/${business.whatsappNumber?.replace(/[^0-9]/g, '')}`, '_blank')}
                                >
                                    WhatsApp
                                </Button>
                            )}
                            <Button variant="outline" className="flex-1 rounded-lg border-gray-200 dark:border-zinc-700 h-10 text-sm">
                                <MapPin className="w-3.5 h-3.5 mr-2" />
                                Location
                            </Button>
                        </div>
                    </div>

                    {/* Divider */}
                    {/* <div className="h-px bg-gray-50 dark:bg-zinc-800" /> */}

                    {/* Store Section */}
                    <div className="p-6 md:p-8 pt-2">
                        {/* Title and Search Row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products & Services</h2>

                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-9 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none focus:ring-1 focus:ring-gray-200 transition-all text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                                        selectedCategory === cat
                                            ? "text-white shadow-md"
                                            : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-100 dark:border-zinc-800"
                                    )}
                                    style={selectedCategory === cat ? { backgroundColor: business.themeColor || '#1f2937' } : {}}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Product Grid */}
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={product._id}
                                        className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:shadow-xl hover:border-gray-200 dark:hover:border-zinc-700 transition-all duration-300 overflow-hidden flex flex-col"
                                    >
                                        <div className="aspect-[4/3] relative bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ShoppingBag className="w-12 h-12" />
                                                </div>
                                            )}
                                            {product.type === 'service' && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold rounded-full text-gray-900 shadow-sm">
                                                        Service
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="flex-1">
                                                {product.category && (
                                                    <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">{product.category}</p>
                                                )}
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">{product.name}</h3>
                                                {product.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <span
                                                    className="text-xl font-bold"
                                                    style={{ color: business.themeColor || '#1f2937' }}
                                                >
                                                    {product.offers.priceCurrency === "USD" ? "$" : product.offers.priceCurrency}
                                                    {product.offers.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    className="rounded-xl font-semibold opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                                    style={{ backgroundColor: business.themeColor || '#1f2937' }}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No products found</h3>
                                <p className="text-gray-500">Try changing the category or search for something else.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer simple */}
                <div className="text-center mt-12 text-gray-500 text-sm">
                    <p>Powered by Bized</p>
                </div>
            </div>
        </div>
    )
}
