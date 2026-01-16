/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
    Search,
    ShoppingBag,
    Menu,
    MapPin,
    Phone,
    Clock,
    Share2,
    ArrowLeft,
    MessageSquare,
    ExternalLink,
    Globe,
    Mail,
    Building2,
    CheckCircle2,
    Info,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Github,
    Zap,
    Wifi,
    Car,
    Coffee,
    Utensils,
    Accessibility,
    Baby,
    Dog,
    ChevronDown,
    Layers,
    Plus,
    Check,
    PlusCircle
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface Product {
    _id: string
    name: string
    description?: string
    image?: string
    category?: string
    type?: string
    status?: string
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
    buttonColor?: string
    image?: string
    logo?: string
    whatsappNumber?: string
    whatsappConnected?: boolean
    showBookNow?: boolean
    showShopNow?: boolean
    showQuoteRequest?: boolean
    phone?: {
        code: string
        number: string
    }
    email?: string
    url?: string
    address?: {
        streetAddress?: string
        addressLocality?: string
        addressRegion?: string
        postalCode?: string
        addressCountry?: string
    }
    sameAs?: string[]
    selectedFacilities?: string[]
    businessHours?: Array<{
        day: string;
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }>
    pages?: Array<{
        title: string
        slug: string
        enabled: boolean
        type: 'storefront' | 'bookings' | 'shop' | 'quote'
        settings: any
    }>
}

interface BusinessStorefrontProps {
    business: Business
    products: Product[]
    services?: any[]
    pageType?: 'storefront' | 'bookings' | 'shop' | 'quote'
}

export function BusinessStorefront({ business, products, services = [], pageType = 'storefront' }: BusinessStorefrontProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [cart, setCart] = useState<any[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [selectedServices, setSelectedServices] = useState<string[]>([])


    // Filter logic based on page type
    const displayedProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const isLive = product.status === 'online' || product.status === 'active'
        if (!isLive) return false
        if (pageType === 'shop') return matchesSearch
        if (pageType === 'bookings') return matchesSearch && product.type?.toLowerCase() === 'service'
        return matchesSearch
    })

    const addToCart = (product: any) => {
        setCart(prev => [...prev, product])
        if (pageType === 'shop') setIsCartOpen(true)
    }

    const cartTotal = cart.reduce((sum, item) => sum + item.offers.price, 0)

    // Current page specific settings
    const pageData = business.pages?.find((p: any) => p.type === pageType)
    const settings = pageData?.settings || {}
    const blocks = settings.blocks || []

    const renderBlock = (block: any) => {
        switch (block.type) {
            case 'text':
                return (
                    <div key={block.id} className="space-y-1">
                        {block.title && <h2 className="text-[18px] font-medium leading-[26px] text-[#0A0909] dark:text-white font-rubik">{block.title}</h2>}
                        {block.content && <p className="text-[10px] font-normal leading-[15.2px] text-[#0A0909] dark:text-gray-300 font-noto-sans whitespace-pre-wrap">{block.content}</p>}
                    </div>
                )
            case 'page_link':
                const getPageIcon = () => {
                    switch (block.pageType) {
                        case 'shop': return <ShoppingBag className="w-4 h-4" />
                        case 'bookings': return <Clock className="w-4 h-4" />
                        case 'quote': return <MessageSquare className="w-4 h-4" />
                        default: return <ArrowLeft className="w-4 h-4 rotate-180" />
                    }
                }
                return (
                    <button
                        key={block.id}
                        onClick={() => window.location.href = `/${business.slug}/${block.pageType}`}
                        className="w-full h-12 px-6 rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98] shadow-sm hover:shadow-md border border-white/10"
                        style={{ backgroundColor: business.themeColor || "#000000" }}
                    >
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                                {getPageIcon()}
                            </div>
                            <div>
                                <div className="font-bold text-[13px] leading-none text-white font-rubik">{block.label || `Go to ${block.pageType}`}</div>
                                {block.subtitle && <div className="text-[10px] text-white/70 mt-1">{block.subtitle}</div>}
                            </div>
                        </div>
                        <div className="text-white/80 group-hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>
                    </button>
                )
            case 'url':
                return (
                    <button
                        key={block.id}
                        onClick={() => window.open(block.url, '_blank')}
                        className="w-full h-12 px-6 rounded-2xl flex items-center justify-between group transition-all bg-white dark:bg-zinc-900 border border-[#CDD0DB]/60 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <ExternalLink className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="font-bold text-[13px] leading-none text-[#0A0909] dark:text-white font-rubik">{block.label}</div>
                                {block.subtitle && <div className="text-[10px] text-[#3F3E3E] dark:text-gray-400 mt-1">{block.subtitle}</div>}
                            </div>
                        </div>
                        <ArrowLeft className="w-4 h-4 rotate-180 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                    </button>
                )
            case 'opening_hours':
                return (
                    <Accordion key={block.id} type="single" collapsible className="w-full">
                        <AccordionItem value="hours" className="border border-[#CDD0DB]/60 rounded-xl px-3 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border-b-[#CDD0DB]/60">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <Clock className="w-5 h-5 text-[#0A0909] dark:text-white" />
                                    </div>
                                    <div className="text-left text-[14px] font-medium text-[#0A0909] dark:text-white font-noto-sans">Opening Hours</div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                                {block.isOpen247 ? (
                                    <div className="text-center py-2 text-[10px] font-normal text-[#0A0909] dark:text-white font-noto-sans">Open 24 / 7</div>
                                ) : (
                                    <div className="space-y-2 pt-1 font-noto-sans">
                                        {((business.businessHours?.length ?? 0) > 0 ? business.businessHours : block.days)?.map((day: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-[10px]">
                                                <span className={cn("font-normal", day.isOpen ? "text-[#0A0909] dark:text-white" : "text-[#CDD0DB]")}>{day.day}</span>
                                                <span className="font-normal text-[#3F3E3E]">
                                                    {day.isOpen ? `${day.openTime} - ${day.closeTime}` : <span className="text-red-400">Closed</span>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )
            case 'contact_info':
                return (
                    <Accordion key={block.id} type="single" collapsible className="w-full">
                        <AccordionItem value="contacts" className="border border-[#CDD0DB]/60 rounded-xl px-3 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border-b-[#CDD0DB]/60">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <Phone className="w-5 h-5 text-[#0A0909] dark:text-white" />
                                    </div>
                                    <div className="text-left text-[14px] font-medium text-[#0A0909] dark:text-white font-noto-sans">Contact Us</div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-3 font-noto-sans">
                                {(business.name || block.fullName) && <div className="text-[12px] font-medium text-[#0A0909] dark:text-white mb-2">{business.name || block.fullName}</div>}
                                <div className="grid gap-2">
                                    {(business.phone || block.phone) && (
                                        <a href={`tel:${business.phone ? `${business.phone.code}${business.phone.number}` : block.phone}`} className="flex items-center gap-2 text-[10px] text-[#3F3E3E] hover:text-[#0A0909]">
                                            <Phone className="w-3 h-3" />
                                            <span>{business.phone ? `${business.phone.code} ${business.phone.number}` : block.phone}</span>
                                        </a>
                                    )}
                                    {(business.email || block.email) && (
                                        <a href={`mailto:${business.email || block.email}`} className="flex items-center gap-2 text-[10px] text-[#3F3E3E] hover:text-[#0A0909]">
                                            <Mail className="w-3 h-3" />
                                            <span>{business.email || block.email}</span>
                                        </a>
                                    )}
                                    {(business.url || block.website) && (
                                        <a href={business.url || block.website} target="_blank" className="flex items-center gap-2 text-[10px] text-[#3F3E3E] hover:text-[#0A0909]">
                                            <Globe className="w-3 h-3" />
                                            <span>Visit Website</span>
                                        </a>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )
            case 'location':
                const locationAddress = [block.street, block.city, block.state, block.postalCode].filter(Boolean).join(', ')
                return (
                    <Accordion key={block.id} type="single" collapsible className="w-full">
                        <AccordionItem value="location" className="border border-[#CDD0DB]/60 rounded-xl px-3 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border-b-[#CDD0DB]/60">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <MapPin className="w-5 h-5 text-[#0A0909] dark:text-white" />
                                    </div>
                                    <div className="text-left text-[14px] font-medium text-[#0A0909] dark:text-white font-noto-sans">Location</div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-3 font-noto-sans">
                                {block.locationType === 'manual' || business.address ? (
                                    <>
                                        <p className="text-[10px] text-[#3F3E3E] dark:text-gray-400">
                                            {business.address ? [business.address.streetAddress, business.address.addressLocality, business.address.addressRegion, business.address.postalCode].filter(Boolean).join(', ') : locationAddress}
                                        </p>
                                        <Button className="w-full h-10 rounded-lg bg-black hover:bg-zinc-800 text-[12px] font-normal" onClick={() => {
                                            const addr = business.address ? [business.address.streetAddress, business.address.addressLocality, business.address.addressRegion, business.address.postalCode].filter(Boolean).join(', ') : locationAddress
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank')
                                        }}>
                                            Open in Maps
                                        </Button>
                                    </>
                                ) : (
                                    <Button className="w-full h-10 rounded-lg bg-black hover:bg-zinc-800 text-[12px] font-normal" onClick={() => window.open(block.url, '_blank')}>
                                        View on Google Maps
                                    </Button>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )
            case 'facilities':
                const facilitiesList = [
                    { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="w-4 h-4" /> },
                    { id: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" /> },
                    { id: 'cafe', label: 'Cafe', icon: <Coffee className="w-4 h-4" /> },
                    { id: 'restaurant', label: 'Restaurant', icon: <Utensils className="w-4 h-4" /> },
                    { id: 'accessible', label: 'Accessible', icon: <Accessibility className="w-4 h-4" /> },
                    { id: 'child', label: 'Child Friendly', icon: <Baby className="w-4 h-4" /> },
                    { id: 'pet', label: 'Pet Friendly', icon: <Dog className="w-4 h-4" /> },
                    { id: 'seating', label: 'Seating', icon: <Layers className="w-4 h-4" /> },
                ]
                return (
                    <Accordion key={block.id} type="single" collapsible className="w-full">
                        <AccordionItem value="facilities" className="border border-[#CDD0DB]/60 rounded-xl px-3 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border-b-[#CDD0DB]/60">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-[#0A0909] dark:text-white" />
                                    </div>
                                    <div className="text-left text-[14px] font-medium text-[#0A0909] dark:text-white font-noto-sans">Facilities</div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                                <div key={block.id} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {facilitiesList.filter(f => (business.selectedFacilities || block.selectedFacilities)?.includes(f.id)).map((facility) => (
                                        <div key={facility.id} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                                            <div className="text-zinc-600 dark:text-zinc-400">{facility.icon}</div>
                                            <span className="text-[10px] font-medium text-zinc-900 dark:text-white font-noto-sans text-center">{facility.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )
            case 'services':
                const onlineServices = services.filter(s => s.status === 'online' || s.status === 'active')
                const productServices = products.filter(p => p.type?.toLowerCase() === 'service')
                const servs = [...onlineServices, ...productServices]
                return (
                    <div key={block.id} className="space-y-6">
                        <div className="space-y-1">
                            {block.title && <h2 className="text-[18px] font-medium leading-[26px] text-[#0A0909] dark:text-white font-rubik">{block.title}</h2>}
                            {block.description && <p className="text-[10px] font-normal leading-[15.2px] text-[#3F3E3E] dark:text-gray-400 font-noto-sans whitespace-pre-wrap">{block.description}</p>}
                        </div>
                        <div className="space-y-4">
                            {servs.map((service: any) => (
                                <div
                                    key={service._id}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-4",
                                        selectedServices.includes(service._id)
                                            ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500"
                                            : "border-[#CDD0DB] bg-white hover:border-zinc-300 shadow-sm"
                                    )}
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-100">
                                            {service.image?.[0] ? (
                                                <img src={service.image[0]} alt={service.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                    <Zap size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="font-bold text-[15px] sm:text-[16px] text-[#0A0909] font-rubik leading-tight line-clamp-1">
                                                {service.name}
                                            </div>
                                            {service.description && (
                                                <p className="text-[11px] text-[#3F3E3E] line-clamp-2 font-noto-sans leading-relaxed opacity-80">
                                                    {service.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-dashed border-zinc-100 pt-3">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#3F3E3E] bg-zinc-50 px-2 py-1 rounded-lg">
                                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>{service.duration || 30}m duration</span>
                                        </div>
                                        <div className="text-[15px] font-black text-orange-600">
                                            {service.offers?.priceCurrency || 'USD'} {service.offers?.price?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                    <Button
                                        variant={selectedServices.includes(service._id) ? "default" : "outline"}
                                        className={cn(
                                            "w-full h-10 rounded-xl text-[13px] font-bold transition-all",
                                            selectedServices.includes(service._id)
                                                ? "bg-orange-500 text-white hover:bg-orange-600 border-none shadow-md shadow-orange-200"
                                                : "text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                                        )}
                                        onClick={() => {
                                            if (selectedServices.includes(service._id)) {
                                                setSelectedServices(prev => prev.filter(id => id !== service._id))
                                            } else {
                                                setSelectedServices(prev => [...prev, service._id])
                                            }
                                        }}
                                    >
                                        {selectedServices.includes(service._id) ? (
                                            <span className="flex items-center gap-1.5">
                                                Selected <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5">
                                                Select <Plus className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 'products':
                const prodList = (products || []).filter(p => p.status === 'online' || p.status === 'active')
                return (
                    <div key={block.id} className="space-y-6">
                        <div className="space-y-1">
                            {block.title && <h2 className="text-[18px] font-medium leading-[26px] text-[#0A0909] dark:text-white font-rubik">{block.title}</h2>}
                            {block.description && <p className="text-[10px] font-normal leading-[15.2px] text-[#3F3E3E] dark:text-gray-400 font-noto-sans whitespace-pre-wrap">{block.description}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {prodList.map((product: any) => (
                                <div
                                    key={product._id}
                                    className="group bg-white dark:bg-zinc-900 border border-[#CDD0DB]/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                                >
                                    <div className="aspect-square w-full relative overflow-hidden bg-zinc-100">
                                        {product.image?.[0] ? (
                                            <img
                                                src={product.image[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                <ShoppingBag size={24} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <div className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold text-orange-600 shadow-sm">
                                                {product.offers?.priceCurrency || 'USD'} {product.offers?.price?.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 flex flex-col flex-1 gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-[13px] text-[#0A0909] dark:text-white font-rubik line-clamp-1">
                                                {product.name}
                                            </div>
                                            {product.description && (
                                                <p className="text-[10px] text-[#3F3E3E] dark:text-gray-400 line-clamp-1 font-noto-sans mt-0.5 opacity-70">
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => addToCart(product)}
                                            variant="outline"
                                            className="w-full h-8 rounded-xl border-zinc-200 text-[11px] font-bold hover:bg-zinc-900 hover:text-white transition-all group-hover:border-zinc-900"
                                        >
                                            Add <Plus className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 'about':
                return (
                    <div key={block.id} className="p-6 border border-[#CDD0DB] rounded-lg bg-white dark:bg-zinc-900 space-y-3 shadow-sm">
                        <label className="text-[16px] font-semibold text-[#0A0909] dark:text-white font-noto-sans mb-2 block">Summary</label>
                        <p className="text-[10px] font-normal leading-[15.2px] text-[#0A0909] dark:text-gray-300 font-noto-sans whitespace-pre-wrap">
                            {business.description || block.summary}
                        </p>
                    </div>
                )
            case 'social_networks':
                const getSocialIcon = (name: string) => {
                    switch (name) {
                        case 'facebook': return <Facebook className="w-5 h-5" />
                        case 'instagram': return <Instagram className="w-5 h-5" />
                        case 'twitter': return <Twitter className="w-5 h-5" />
                        case 'linkedin': return <Linkedin className="w-5 h-5" />
                        case 'youtube': return <Youtube className="w-5 h-5" />
                        case 'github': return <Github className="w-5 h-5" />
                        case 'whatsapp': return <Zap className="w-5 h-5" />
                        case 'website': return <Globe className="w-5 h-5" />
                        default: return <Share2 className="w-5 h-5" />
                    }
                }
                const platformsToRender = (business.sameAs?.length ?? 0) > 0
                    ? business.sameAs!.map((url: string) => {
                        const name = url.includes('facebook') ? 'facebook' :
                            url.includes('instagram') ? 'instagram' :
                                url.includes('twitter') ? 'twitter' :
                                    url.includes('linkedin') ? 'linkedin' :
                                        url.includes('youtube') ? 'youtube' :
                                            url.includes('github') ? 'github' :
                                                url.includes('whatsapp') ? 'whatsapp' : 'website'
                        return { name, url }
                    })
                    : block.platforms

                return (
                    <div key={block.id} className="flex flex-wrap justify-center gap-4 py-2 mt-4">
                        {platformsToRender?.map((p: any) => (
                            <button
                                key={p.name}
                                onClick={() => window.open(p.url, '_blank')}
                                className="w-10 h-10 bg-white border border-[#CDD0DB] dark:bg-zinc-800 rounded-lg flex items-center justify-center shadow-sm hover:scale-110 transition-transform text-[#0A0909]"
                            >
                                {getSocialIcon(p.name)}
                            </button>
                        ))}
                    </div>
                )
            default:
                return null
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
                // console.log('Error sharing:', error)
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert("Link copied to clipboard!")
        }
    }

    return (
        <div
            className="min-h-screen bg-white dark:bg-zinc-950 antialiased tracking-normal font-noto-sans selection:bg-black selection:text-white"
        >
            {/* Header / Navigation */}
            <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="w-5 h-5" />
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
                        <Share2 className="w-5 h-5" />
                    </Button>
                    {(pageType === 'shop' || cart.length > 0) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full relative"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            <main className={cn("max-w-2xl mx-auto pb-20 pt-4", selectedServices.length > 0 && "pb-40")}>

                {/* Hero / Brand Section */}
                <div className="relative">
                    {/* Banner with secondary color */}
                    <div
                        className="h-32 w-full sm:rounded-b-[40px] relative overflow-hidden bg-cover bg-center"
                        style={{
                            backgroundColor: business.secondaryColor || "#f3f4f6",
                            backgroundImage: business.image ? `url(${business.image})` : undefined
                        }}
                    >
                        {/* Abstract background decorative elements - only show if no image */}
                        {!business.image && (
                            <>
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/5 rounded-full blur-2xl" />
                            </>
                        )}
                        {/* Overlay darker if image exists to ensure text contrast if needed, though text is below */}
                        {business.image && <div className="absolute inset-0 bg-black/10" />}
                    </div>

                    <div className="px-6 relative z-10">
                        {/* Logo Avatar - positioned to overlap banner */}
                        <div className="-mt-12 mb-4 flex justify-between items-end">
                            <div
                                className="w-20 h-20 rounded-[28px] flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-4 ring-white dark:ring-zinc-950 transform hover:scale-105 transition-transform overflow-hidden bg-cover bg-center"
                                style={{
                                    backgroundColor: business.themeColor || "#1f2937",
                                    backgroundImage: business.logo ? `url(${business.logo})` : undefined
                                }}
                            >
                                {!business.logo && business.name.substring(0, 1).toUpperCase()}
                            </div>
                        </div>

                        <div className="space-y-1 text-center mt-4">
                            <h1 className="text-[18px] font-medium leading-[26px] text-[#0A0909] dark:text-white font-rubik">
                                {business.name}
                            </h1>
                            <p className="text-[10px] font-normal leading-[18px] text-[#3F3E3E] font-noto-sans">@{business.slug}</p>
                        </div>

                        {business.description && (
                            <p className="mt-2 text-[10px] font-normal leading-[15.2px] text-[#0A0909] dark:text-gray-300 font-noto-sans text-center px-4">
                                {business.description}
                            </p>
                        )}

                        {/* Quick Contact Info */}
                        <div className="flex justify-center gap-4 mt-4 text-[10px] text-[#3F3E3E] font-normal font-noto-sans">
                            {business.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {business.phone.code} {business.phone.number}
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                View Location
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections based on pageType */}

                {pageType === 'storefront' && (
                    <div className="px-6 pt-6 space-y-2">
                        {/* Dynamic Blocks */}
                        {blocks.length > 0 && (
                            <div className="space-y-2">
                                {blocks.map(renderBlock)}
                            </div>
                        )}
                    </div>
                )}

                {pageType === 'shop' && (
                    <div className="px-6 pt-10">
                        {blocks.length > 0 && (
                            <div className="space-y-6">
                                {blocks.map(renderBlock)}
                            </div>
                        )}
                    </div>
                )}

                {pageType === 'bookings' && (
                    <div className="px-6 pt-10 space-y-8">
                        {blocks.length > 0 && (
                            <div className="space-y-6">
                                {blocks.map(renderBlock)}
                            </div>
                        )}
                    </div>
                )}

                {pageType === 'quote' && (
                    <div className="px-6 pt-10 space-y-8">
                        {blocks.length > 0 && (
                            <div className="space-y-6">
                                {blocks.map(renderBlock)}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Cart Overlay */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-950 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-black">Your Cart</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                                <Menu className="w-6 h-6 rotate-45" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">Your cart is empty</div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ShoppingBag className="m-auto text-gray-300" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-sm font-bold text-gray-500">${item.offers.price}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="p-6 border-t space-y-4">
                                <div className="flex items-center justify-between font-black text-xl">
                                    <span>Total</span>
                                    <span>${cartTotal.toLocaleString()}</span>
                                </div>
                                <button className="w-full h-16 rounded-3xl bg-zinc-900 text-white font-black text-lg">
                                    Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sticky Continue Button for Services */}
            {selectedServices.length > 0 && (
                <div className="sticky bottom-4 left-4 right-4 z-50 flex justify-center mt-auto pb-4 pointer-events-none">
                    <div className="w-full max-w-sm flex items-center justify-between p-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-zinc-200/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
                        <div className="px-3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Total Duration</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-[14px] font-bold text-zinc-900">
                                    {selectedServices.reduce((acc, id) => {
                                        const s = services.find(serv => serv._id === id) || products.find(p => p._id === id);
                                        return acc + (s?.duration || 30);
                                    }, 0)}m
                                </span>
                            </div>
                        </div>
                        <Button
                            className="h-11 rounded-xl px-10 bg-orange-500 hover:bg-orange-600 text-white font-black text-[14px] flex items-center gap-2 group shadow-lg shadow-orange-500/25 transition-all active:scale-95"
                        >
                            Continue
                            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
