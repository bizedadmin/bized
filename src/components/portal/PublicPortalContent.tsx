"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import * as m from "framer-motion"
const { motion, AnimatePresence } = m
import {
    User,
    FileText,
    Calendar,
    ShoppingBag,
    ChevronRight,
    Building2,
    Loader2,
    Ticket,
    Globe,
    Store,
    Clock,
    ArrowUpRight,
    Layout,
    Phone,
    MessageCircle,
    MapPin,
    Mail,
    Share2,
    Star
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ClientPortalShell from "@/components/portal/ClientPortalShell"

interface Business {
    _id: string
    name: string
    slug: string
    industry?: string
    logo?: string
    description?: string
    themeColor?: string
    pages: any[]
}

interface PublicPortalContentProps {
    business: Business
    products?: any[]
    services?: any[]
}

const getIconForPageType = (type: string) => {
    switch (type) {
        case 'profile': return User;
        case 'bookings': return Calendar;
        case 'shop': return ShoppingBag;
        case 'quote': return FileText;
        case 'storefront': return Store;
        default: return Globe;
    }
}

export function PublicPortalContent({ business }: PublicPortalContentProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const themeColor = business.themeColor || "#007AFF"

    // Mock session for public view
    const sessionName = "Guest"

    return (
        <ClientPortalShell
            activeTab="pages"
            business={business}
        >
            <div className="p-4 sm:p-8">
                {/* Welcome Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400 border-none font-bold px-3">
                                Official Portal
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Welcome to {business.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            Explore our services, book appointments, and shop online.
                        </p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="space-y-10"
                    >
                        {/* Featured Business Card */}
                        <Card className="border-none bg-white dark:bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden lg:flex">
                            <div
                                className="lg:w-1/3 aspect-[4/3] lg:aspect-auto bg-cover bg-center relative"
                                style={{
                                    backgroundImage: business.logo ? `url(${business.logo})` : 'none',
                                    backgroundColor: `${themeColor}10`
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
                                <div className="absolute bottom-6 left-6 lg:hidden">
                                    <h2 className="text-white text-2xl font-bold">{business.name}</h2>
                                    <p className="text-white/80 text-sm">Official Platform</p>
                                </div>
                            </div>
                            <div className="flex-1 p-8 lg:p-12 space-y-6">
                                <div className="hidden lg:block">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Featured Partner</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                                        {business.name}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-xl">
                                        {business.description || `Welcome to your official portal for ${business.name}. Here you can manage your bookings, orders, and support requests directly with us.`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 lg:pt-0">
                                    <Button variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all group">
                                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MessageCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-tight">WhatsApp</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all group">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Call Us</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all group">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MapPin className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Location</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all group">
                                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Share2 className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Share</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 italic uppercase">
                                    <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: themeColor }} />
                                    Explore Services
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {business.pages
                                    .filter(p => p.enabled)
                                    .map((page, idx) => {
                                        const PageIcon = getIconForPageType(page.type);
                                        return (
                                            <Card key={idx} className="group border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden bg-white dark:bg-zinc-900 p-1 rounded-3xl">
                                                <div className="p-6 flex flex-col">
                                                    <div
                                                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-sm"
                                                        style={{ backgroundColor: `${themeColor}10` }}
                                                    >
                                                        <PageIcon className="w-6 h-6 transition-colors" style={{ color: themeColor }} />
                                                    </div>
                                                    <CardTitle className="text-xl font-bold mb-1 tracking-tight">{page.title}</CardTitle>
                                                    <CardDescription className="text-xs font-medium text-gray-500 mb-6">
                                                        Manage your {page.type} preferences.
                                                    </CardDescription>

                                                    <Button
                                                        className="w-full bg-gray-50 dark:bg-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-700 text-gray-900 dark:text-white border-none shadow-none h-11 rounded-xl group/btn transition-all duration-300 font-bold"
                                                        asChild
                                                    >
                                                        <Link href={page.type === 'storefront' ? `/${business.slug}` : `/${business.slug}/${page.slug}`}>
                                                            Launch Section
                                                            <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </Card>
                                        )
                                    })}
                            </div>
                        </section>

                        {/* Bottom Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 border-none bg-zinc-900 text-white rounded-[24px]">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">Business Hours</h3>
                                <p className="text-white/60 text-sm italic">Mon - Fri: 09:00 - 18:00</p>
                            </Card>
                            <Card className="p-6 border-none bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">Need help?</h3>
                                <p className="text-gray-500 text-sm">contact@{business.slug}.com</p>
                            </Card>
                            <Card className="p-6 border-none bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                    <Globe className="w-5 h-5 text-gray-400" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">Main Website</h3>
                                <p className="text-gray-500 text-sm truncate">www.{business.slug}.com</p>
                            </Card>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </ClientPortalShell>
    )
}
