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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export function PublicPortalContent({ business, services, products }: PublicPortalContentProps) {
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

                <Tabs defaultValue="overview" className="space-y-8">
                    <div className="sticky top-16 z-30 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-gray-200 dark:border-zinc-800 rounded-none overflow-x-auto flex-nowrap">
                            {['overview', 'services', 'products', 'reviews', 'about'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none px-6 py-3 capitalize font-bold text-gray-500 data-[state=active]:text-blue-600 border-transparent relative"
                                    style={{ borderColor: tab === searchQuery ? themeColor : undefined }} // logic placeholder
                                >
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2">
                        {/* Hero / Featured Card */}
                        <Card className="border-none bg-white dark:bg-zinc-900 shadow-sm rounded-[32px] overflow-hidden lg:flex">
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
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
                                        {business.name}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-xl">
                                        {business.description || `Welcome to your official portal for ${business.name}.`}
                                    </p>
                                </div>
                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
                                        { label: 'Call Us', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Location', icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
                                        { label: 'Share', icon: Share2, color: 'text-gray-600', bg: 'bg-zinc-50' },
                                    ].map((action) => (
                                        <Button key={action.label} variant="outline" className="h-20 rounded-2xl flex-col gap-2 border-gray-100 hover:bg-gray-50 transition-all group">
                                            <div className={`w-8 h-8 rounded-full ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <action.icon className={`w-4 h-4 ${action.color}`} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-tight">{action.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Recent Products/Services Preview */}
                        {services && services.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Featured Services</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {services.slice(0, 3).map((service: any) => (
                                        <Card key={service._id} className="p-4 border-none shadow-sm rounded-2xl bg-white dark:bg-zinc-900">
                                            <div className="h-40 bg-gray-100 rounded-xl mb-4 bg-cover bg-center" style={{ backgroundImage: `url(${service.image || ''})` }} />
                                            <h4 className="font-bold">{service.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                                            <p className="mt-2 font-bold text-blue-600">{service.price ? `$${service.price}` : 'Custom Pricing'}</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="services" className="space-y-6 animate-in fade-in-50">
                        <h2 className="text-2xl font-bold">Our Services</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services?.map((service: any) => (
                                <Card key={service._id} className="overflow-hidden border-none shadow-sm rounded-3xl bg-white dark:bg-zinc-900 hover:shadow-md transition-all">
                                    <div className="aspect-video bg-gray-100 bg-cover bg-center" style={{ backgroundImage: `url(${service.image || ''})` }} />
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{service.name}</h3>
                                            <Badge variant="secondary" className="font-bold transform translate-x-1">{service.price ? `$${service.price}` : 'Ask'}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-3 mb-4">{service.description}</p>
                                        <Button className="w-full rounded-xl font-bold" style={{ backgroundColor: themeColor }}>Book Now</Button>
                                    </div>
                                </Card>
                            )) || <p className="text-gray-500 italic">No services listed yet.</p>}
                        </div>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-6 animate-in fade-in-50">
                        <h2 className="text-2xl font-bold">Store Products</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products?.map((product: any) => (
                                <Card key={product._id} className="overflow-hidden border-none shadow-sm rounded-3xl bg-white dark:bg-zinc-900 hover:shadow-md transition-all">
                                    <div className="aspect-square bg-gray-100 bg-cover bg-center" style={{ backgroundImage: `url(${product.images?.[0] || ''})` }} />
                                    <div className="p-4">
                                        <h3 className="font-bold text-sm mb-1 truncate">{product.name}</h3>
                                        <p className="font-bold text-blue-600">{product.price ? `$${product.price}` : 'Free'}</p>
                                        <Button className="w-full mt-3 rounded-xl h-8 text-xs font-bold" variant="outline">Add to Cart</Button>
                                    </div>
                                </Card>
                            )) || <p className="text-gray-500 italic">No products available.</p>}
                        </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="animate-in fade-in-50">
                        <Card className="p-12 text-center border-none bg-white dark:bg-zinc-900 rounded-3xl">
                            <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                            <p className="text-gray-500">Be the first to review {business.name}!</p>
                            <Button className="mt-6 rounded-full" variant="outline">Write a Review</Button>
                        </Card>
                    </TabsContent>

                    <TabsContent value="about" className="space-y-6 animate-in fade-in-50">
                        <Card className="p-8 border-none bg-white dark:bg-zinc-900 rounded-3xl space-y-6">
                            <h2 className="text-2xl font-bold">About Us</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {business.description || `${business.name} is a premier provider in the ${business.industry || 'service'} industry.`}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <div>
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Business Hours</h3>
                                    <ul className="space-y-2 text-sm text-gray-500">
                                        <li className="flex justify-between"><span>Monday - Friday</span> <span>9:00 AM - 6:00 PM</span></li>
                                        <li className="flex justify-between"><span>Saturday</span> <span>10:00 AM - 4:00 PM</span></li>
                                        <li className="flex justify-between"><span>Sunday</span> <span>Closed</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</h3>
                                    <p className="text-sm text-gray-500">123 Business Avenue<br />City Center, ST 12345</p>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ClientPortalShell>
    )
}
