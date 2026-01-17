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
    PlusCircle,
    Calendar,
    Wallet,
    User,
    Sparkles,
    RefreshCw,
    QrCode,
    Copy,
    Link as LinkIcon
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSession } from "next-auth/react"
import { toast } from "sonner"
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
    _id: string
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
        type: 'profile' | 'bookings' | 'shop' | 'quote' | 'storefront'
        settings: any
    }>
    fontFamily?: string
    glassmorphism?: boolean
    borderRadius?: 'none' | 'md' | 'xl' | 'full'
}

interface BusinessProfileProps {
    business: Business
    products: Product[]
    services?: any[]
    pageType?: 'profile' | 'bookings' | 'shop' | 'quote' | 'storefront'
    isPreview?: boolean
}

export function BusinessProfile({ business, products, services = [], pageType = 'profile', isPreview = false }: BusinessProfileProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [cart, setCart] = useState<any[]>([])

    const getFontFamily = () => {
        switch (business.fontFamily) {
            case 'inter': return 'Inter, sans-serif'
            case 'serif': return 'Georgia, serif'
            case 'mono': return 'Courier New, monospace'
            case 'system': return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            default: return 'inherit'
        }
    }
    const [isCartOpen, setIsCartOpen] = useState(false)

    const [selectedServices, setSelectedServices] = useState<string[]>([])
    const [bookingStep, setBookingStep] = useState<'selection' | 'datetime' | 'details' | 'confirmation'>('selection')
    const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h')
    const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "", notes: "" })

    // Auto-fill form if user is logged in
    useEffect(() => {
        const fetchSession = async () => {
            const session = await getSession()
            if (session?.user) {
                setCustomerInfo(prev => ({
                    ...prev,
                    name: session.user?.name || '',
                    email: session.user?.email || '',
                    phone: '' // Phone is usually not in default session, but we can leave it empty to be filled
                }))
            }
        }
        fetchSession()
    }, [])

    const radiusClasses: Record<string, string> = {
        none: "rounded-none",
        md: "rounded-md",
        xl: "rounded-2xl",
        full: "rounded-[40px]"
    }
    const br = radiusClasses[business.borderRadius || 'xl']
    const isGlass = business.glassmorphism


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

    // Calendar logic
    const daysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const days = new Date(year, month + 1, 0).getDate()
        return { firstDay, days }
    }

    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 9; hour < 18; hour++) {
            for (let min of ['00', '30']) {
                slots.push(`${hour.toString().padStart(2, '0')}:${min}`)
            }
        }
        return slots
    }

    const { firstDay, days } = daysInMonth(selectedDate)
    const calendarDays = Array.from({ length: 42 }, (_, i) => {
        const day = i - firstDay + 1
        return day > 0 && day <= days ? day : null
    })

    const formatTime = (time: string) => {
        if (timeFormat === '24h') return time
        const [h, m] = time.split(':')
        const hour = parseInt(h)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const h12 = hour % 12 || 12
        return `${h12}:${m} ${ampm}`
    }

    const addMinutes = (time: string, minutesToAdd: number) => {
        const [h, m] = time.split(':').map(Number)
        let newMin = m + minutesToAdd
        let newHour = h + Math.floor(newMin / 60)
        newMin = newMin % 60
        newHour = newHour % 24 // Optional: wrap around 24h
        return `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`
    }

    // Current page specific settings
    const pageData = business.pages?.find((p: any) => p.type === pageType)
        || (pageType === 'profile' ? business.pages?.find((p: any) => p.type === 'storefront') : undefined)
    const settings = pageData?.settings || {}
    let blocks = settings.blocks || []

    // If no blocks defined and we have a specific page type, use defaults if in preview or if the page should have content
    if (blocks.length === 0) {
        if (pageType === 'shop') {
            blocks = [{ id: 'default-products', type: 'products', title: 'Our Shop', description: 'Explore our items' }]
        } else if (pageType === 'bookings') {
            blocks = [{ id: 'default-services', type: 'services', title: 'Book an Appointment', description: 'Choose a service to get started' }]
        } else if (pageType === 'quote') {
            blocks = [{ id: 'default-quote', type: 'text', title: 'Request a Quote', content: 'Tell us what you need and we will get back to you with a personalized estimate.' }]
        } else if ((pageType === 'profile' || pageType === 'storefront') && isPreview) {
            // For profile in preview, if empty, show a welcome
            blocks = [{ id: 'default-welcome', type: 'text', title: `Welcome to ${business.name}`, content: business.description || 'Welcome to our business profile. Feel free to browse our services and products.' }]
        }
    }

    if (bookingStep === 'datetime') {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

        return (
            <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 px-4 py-8 pointer-events-auto overflow-y-auto" style={{ fontFamily: getFontFamily() }}>
                {/* 1. Header with Go Back */}
                <div className="max-w-6xl mx-auto mb-6">
                    <button
                        onClick={() => setBookingStep('selection')}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:border-zinc-300">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-zinc-600 dark:text-zinc-400">Go back</span>
                    </button>
                </div>

                {/* 2. Responsive 2-Card Layout */}
                <div className="max-w-6xl mx-auto mb-24">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

                        {/* CARD 1: Calendar */}
                        <div className="w-full md:w-[420px] shrink-0 bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 md:p-8">
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-zinc-800 dark:text-white">
                                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                                    </h2>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {
                                            const d = new Date(selectedDate); d.setMonth(d.getMonth() - 1); setSelectedDate(d)
                                        }}>
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {
                                            const d = new Date(selectedDate); d.setMonth(d.getMonth() + 1); setSelectedDate(d)
                                        }}>
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {dayNames.map(day => (
                                        <div key={day} className="text-center text-[10px] font-black uppercase text-zinc-300 py-2">
                                            {day}
                                        </div>
                                    ))}
                                    {calendarDays.map((day, i) => (
                                        <div key={i} className="aspect-square flex items-center justify-center">
                                            {day && (
                                                <button
                                                    onClick={() => {
                                                        const d = new Date(selectedDate); d.setDate(day); setSelectedDate(d)
                                                    }}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full text-sm font-bold transition-all flex items-center justify-center",
                                                        selectedDate.getDate() === day
                                                            ? "text-white shadow-lg shadow-zinc-200 dark:shadow-none"
                                                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                                                    )}
                                                    style={selectedDate.getDate() === day ? { backgroundColor: business.buttonColor || business.themeColor || "#1f2937" } : {}}
                                                >
                                                    {day}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1 mb-2 block">Time Zone</Label>
                                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm font-bold">
                                        <Globe className="w-4 h-4 text-zinc-400" />
                                        <span>(GMT+03:00) Nairobi</span>
                                        <ChevronDown className="w-4 h-4 ml-auto text-zinc-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: Pick Time */}
                        <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 md:p-8">
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-zinc-800 dark:text-white">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                    </h2>
                                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
                                        <button
                                            onClick={() => setTimeFormat('24h')}
                                            className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", timeFormat === '24h' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-400")}
                                        >24h</button>
                                        <button
                                            onClick={() => setTimeFormat('12h')}
                                            className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", timeFormat === '12h' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-400")}
                                        >12h</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                                    {generateTimeSlots().map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedTime(slot)}
                                            className={cn(
                                                "py-3 px-4 rounded-xl border font-bold text-sm transition-all",
                                                selectedTime === slot
                                                    ? "text-white shadow-lg scale-95"
                                                    : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300"
                                            )}
                                            style={selectedTime === slot ? {
                                                backgroundColor: business.buttonColor || business.themeColor || "#1f2937",
                                                borderColor: business.buttonColor || business.themeColor || "#1f2937"
                                            } : {}}
                                        >
                                            {formatTime(slot)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Selection Summary & Branding */}
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex flex-col text-center sm:text-left">
                            <span className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] mb-1">Slot Details</span>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <span className="text-xl font-black text-zinc-900 dark:text-white">
                                    {selectedDate.getDate()} {monthNames[selectedDate.getMonth()].slice(0, 3)} —
                                </span>
                                <span className="text-xl font-bold text-zinc-400">
                                    {selectedTime ? formatTime(selectedTime) : 'Pick time'}
                                </span>
                            </div>
                        </div>
                        <Button
                            disabled={!selectedTime}
                            onClick={() => setBookingStep('details')}
                            className={cn("h-14 px-12 text-white font-black text-lg shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-2xl active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto", br)}
                            style={{ backgroundColor: business.buttonColor || business.themeColor || "#1f2937" }}
                        >
                            Next
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                        </Button>
                    </div>

                    <div className="text-center pb-8 border-t border-zinc-100 dark:border-zinc-800 pt-8">
                        <span className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.4em] block mb-2">Powered by</span>
                        <div className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white select-none">bized</div>
                    </div>
                </div>
            </div>
        )
    }

    if (bookingStep === 'details') {
        const selectedServiceItems = services.filter(s => selectedServices.includes(s._id))
        const subtotal = selectedServiceItems.reduce((acc, s) => acc + (s.offers?.price || 0), 0)

        // Helper to get initials
        const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

        return (
            <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 px-4 py-8 pointer-events-auto overflow-y-auto font-sans" style={{ fontFamily: getFontFamily() }}>
                {/* 1. Header Navigation */}
                <div className="max-w-4xl mx-auto mb-6">
                    <button
                        onClick={() => setBookingStep('datetime')}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:border-zinc-300">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-zinc-600 dark:text-zinc-400">Back to date & time</span>
                    </button>
                </div>

                {/* 2. Main Booking Card */}
                <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-12">
                    <div className="flex flex-col md:flex-row">
                        {/* LEFT SIDE: Summary */}
                        <div className="w-full md:w-[320px] lg:w-[350px] p-8 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-8">
                                {/* Business Avatar & Name */}
                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-xl font-black text-orange-600 dark:text-orange-400">
                                        {getInitials(business.name || 'Bized')}
                                    </div>
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">{business.name}</h2>
                                </div>

                                {/* Booking Details List */}
                                <div className="space-y-6">
                                    <div className="font-bold text-zinc-500 dark:text-zinc-400">
                                        {selectedServiceItems.map(s => s.name).join(', ')}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                            <Calendar className="w-5 h-5 text-zinc-400" />
                                            <span className="font-medium text-sm">
                                                {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                            <Clock className="w-5 h-5 text-zinc-400" />
                                            <span className="font-medium text-sm">
                                                {selectedTime && formatTime(selectedTime)} - {selectedTime && formatTime(addMinutes(selectedTime, selectedServiceItems.reduce((acc, s) => acc + (s.duration || 30), 0)))}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                            <Globe className="w-5 h-5 text-zinc-400" />
                                            <span className="font-medium text-sm">(GMT+03:00) Nairobi</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                            <Wallet className="w-5 h-5 text-zinc-400" />
                                            <span className="font-medium text-sm">
                                                KES {subtotal.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE: Form */}
                        <div className="flex-1 p-8 bg-white dark:bg-zinc-900">
                            <div className="space-y-6 max-w-md">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Your name</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <Input
                                            value={customerInfo.name}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                            placeholder="Enter your name"
                                            className="h-12 pl-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-zinc-900 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Your e-mail address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <Input
                                            type="email"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                            placeholder="Enter your e-mail"
                                            className="h-12 pl-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-zinc-900 transition-all"
                                        />
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Add Guest
                                </button>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Notes</Label>
                                    <textarea
                                        value={customerInfo.notes}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                        className="w-full min-h-[120px] p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none text-sm transition-all"
                                        placeholder="Add any special requests..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        disabled={!customerInfo.name || !customerInfo.email}
                                        onClick={async () => {
                                            try {
                                                const selectedServiceItems = services.filter(s => selectedServices.includes(s._id))
                                                const subtotal = selectedServiceItems.reduce((acc, s) => acc + (s.offers?.price || 0), 0)

                                                const res = await fetch('/api/business/bookings', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        businessId: business._id,
                                                        serviceId: selectedServices[0], // Simplified for single service
                                                        customerName: customerInfo.name,
                                                        customerEmail: customerInfo.email,
                                                        customerPhone: customerInfo.phone || 'N/A',
                                                        date: selectedDate,
                                                        startTime: selectedTime,
                                                        endTime: selectedTime ? addMinutes(selectedTime, selectedServiceItems[0]?.duration || 30) : null,
                                                        totalPrice: subtotal,
                                                        currency: 'KES', // Defaulting for now
                                                        notes: customerInfo.notes
                                                    })
                                                })

                                                const data = await res.json()

                                                if (res.ok) {
                                                    toast.success("Booking Confirmed!")
                                                    setConfirmedBookingId(data.booking._id)
                                                    setBookingStep('confirmation')
                                                } else {
                                                    toast.error("Failed to book. Please try again.")
                                                }
                                            } catch (error) {
                                                toast.error("Something went wrong.")
                                            }
                                        }}
                                        className={cn("h-12 px-8 text-white font-bold text-md shadow-lg active:scale-95 transition-all w-full md:w-auto rounded-xl", br)}
                                        style={{ backgroundColor: business.buttonColor || business.themeColor || "#ea580c" }} // Default to orange-600 if no color
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pb-8 pt-4">
                    <span className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.4em] block mb-2">Powered by</span>
                    <div className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white select-none">bized</div>
                </div>
            </div>
        )
    }

    if (bookingStep === 'confirmation') {
        const selectedServiceItems = services.filter(s => selectedServices.includes(s._id))

        const addToCalendar = {
            google: () => {
                const startTime = selectedDate;
                if (!selectedTime) return;
                const [h, m] = selectedTime.split(':').map(Number);
                startTime.setHours(h, m, 0);

                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + (selectedServiceItems[0]?.duration || 30));

                const formatGoogleDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

                const url = new URL("https://calendar.google.com/calendar/render");
                url.searchParams.append("action", "TEMPLATE");
                url.searchParams.append("text", `Booking: ${selectedServiceItems[0]?.name}`);
                url.searchParams.append("dates", `${formatGoogleDate(startTime)}/${formatGoogleDate(endTime)}`);
                url.searchParams.append("details", `Booking with ${business.name}. Notes: ${customerInfo.notes}`);
                url.searchParams.append("location", business.address ? typeof business.address === 'string' ? business.address : Object.values(business.address).join(', ') : "");

                window.open(url.toString(), '_blank');
            },
            outlook: () => {
                const startTime = selectedDate;
                if (!selectedTime) return;
                const [h, m] = selectedTime.split(':').map(Number);
                startTime.setHours(h, m, 0);

                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + (selectedServiceItems[0]?.duration || 30));

                const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
                url.searchParams.append("path", "/calendar/action/compose");
                url.searchParams.append("rru", "addevent");
                url.searchParams.append("startdt", startTime.toISOString());
                url.searchParams.append("enddt", endTime.toISOString());
                url.searchParams.append("subject", `Booking: ${selectedServiceItems[0]?.name}`);
                url.searchParams.append("body", `Booking with ${business.name}. Notes: ${customerInfo.notes}`);
                url.searchParams.append("location", business.address ? typeof business.address === 'string' ? business.address : Object.values(business.address).join(', ') : "");

                window.open(url.toString(), '_blank');
            },
            downloadIcs: () => {
                if (!selectedTime) return;
                const startTime = selectedDate;
                const [h, m] = selectedTime.split(':').map(Number);
                startTime.setHours(h, m, 0);

                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + (selectedServiceItems[0]?.duration || 30));

                const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

                const icsContent = [
                    "BEGIN:VCALENDAR",
                    "VERSION:2.0",
                    "PRODID:-//Bized//Booking//EN",
                    "BEGIN:VEVENT",
                    `UID:${Date.now()}@bized.app`,
                    `DTSTAMP:${formatICSDate(new Date())}`,
                    `DTSTART:${formatICSDate(startTime)}`,
                    `DTEND:${formatICSDate(endTime)}`,
                    `SUMMARY:Booking: ${selectedServiceItems[0]?.name} at ${business.name}`,
                    `DESCRIPTION:Booking ID: ${Date.now()}\\nService: ${selectedServiceItems[0]?.name}\\nBusiness: ${business.name}\\nNotes: ${customerInfo.notes}`,
                    `LOCATION:${business.address ? typeof business.address === 'string' ? business.address : Object.values(business.address).join(', ') : ""}`,
                    "END:VEVENT",
                    "END:VCALENDAR"
                ].join("\r\n");

                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', 'booking.ics');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        return (
            <div className="min-h-full bg-slate-50 dark:bg-zinc-950 px-4 py-12 pointer-events-auto overflow-y-auto font-sans flex items-center justify-center" style={{ fontFamily: getFontFamily() }}>
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[32px] p-8 text-center shadow-sm border border-zinc-100 dark:border-zinc-800">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-[check-zoom_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                        <svg className="w-10 h-10 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" className="animate-[check-draw_0.8s_ease-out_forwards]" style={{ strokeDasharray: 100, strokeDashoffset: 100 }} />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">You Scheduled!</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                        Congratulations! Your event has been successfully created. You can now proceed with the planning.
                    </p>

                    {/* Summary Card */}
                    <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-6 text-left space-y-4 mb-8">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-zinc-300"></div>
                                Status
                            </span>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                                Approved
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Date
                            </span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time
                            </span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                {selectedTime && formatTime(selectedTime)} - {selectedTime && formatTime(addMinutes(selectedTime, selectedServiceItems[0]?.duration || 30))}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Timezone
                            </span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                (GMT+03:00) Nairobi
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Services
                            </span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white text-right max-w-[150px] truncate">
                                {selectedServiceItems.map(s => s.name).join(', ')}
                            </span>
                        </div>
                        {customerInfo.notes && (
                            <div className="flex justify-between items-start pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 shrink-0 mt-0.5">
                                    <MessageSquare className="w-4 h-4" />
                                    Notes
                                </span>
                                <span className="text-sm font-medium text-zinc-900 dark:text-white text-right max-w-[200px] whitespace-pre-wrap leading-relaxed">
                                    {customerInfo.notes}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Share Link & QR */}
                    <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-6 mb-8 text-left">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
                                <LinkIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                            </div>
                            <span className="font-bold text-sm text-zinc-900 dark:text-white">Booking Link</span>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <div className="flex-1 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center px-3 overflow-hidden">
                                <span className="text-xs text-zinc-500 truncate select-all">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/${business.slug}/bookings?id=${confirmedBookingId}` : ''}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        navigator.clipboard.writeText(`${window.location.origin}/${business.slug}/bookings?id=${confirmedBookingId}`)
                                        toast.success("Link copied!")
                                    }
                                }}
                                className="h-10 w-10 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <Copy className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${typeof window !== 'undefined' ? encodeURIComponent(`${window.location.origin}/${business.slug}/bookings?id=${confirmedBookingId}`) : ''}`}
                                    alt="Booking QR"
                                    className="w-20 h-20 mix-blend-multiply"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">Scan for details</h4>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                                    Use this QR code to quickly access your booking details on your mobile device.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add to Calendar */}
                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 mb-8">
                        <div className="text-[10px] uppercase font-bold text-zinc-400 mb-4 tracking-wider">Add to Calendar</div>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={addToCalendar.google}
                                className="flex items-center justify-center gap-2 h-10 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                            >
                                <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                </svg>
                                <span className="font-bold text-xs text-zinc-600 dark:text-zinc-300">Google</span>
                            </button>
                            <button
                                onClick={addToCalendar.downloadIcs} // Apple Calendar uses .ics
                                className="flex items-center justify-center gap-2 h-10 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                            >
                                <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors" viewBox="0 0 384 512" fill="currentColor">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                                </svg>
                                <span className="font-bold text-xs text-zinc-600 dark:text-zinc-300">Apple</span>
                            </button>
                            <button
                                onClick={addToCalendar.outlook}
                                className="flex items-center justify-center gap-2 h-10 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                            >
                                <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M1 18.2l7.2 1.6 4.3-8.2L8.2 3 1 4.2z" fill="#0078d4" />
                                    <path d="M23 11v8l-6.5 1.5V11z" fill="#0078d4" />
                                    <path d="M12.5 20.8L23 19V11H12.5z" fill="#1e90ff" />
                                    <path d="M23 5l-10.5-2v9H23z" fill="#0072c6" />
                                    <path d="M8.2 11.6L1 18.2V4.2l7.2 3.8z" fill="#0072c6" />
                                </svg>
                                <span className="font-bold text-xs text-zinc-600 dark:text-zinc-300">Outlook</span>
                            </button>
                        </div>
                        <button
                            onClick={addToCalendar.downloadIcs}
                            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium mt-4 transition-colors hover:underline"
                        >
                            Download .ics file
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            className={cn("flex-1 h-12 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all outline-none", br)}
                            style={{ backgroundColor: business.buttonColor || business.themeColor || "#ea580c" }}
                            onClick={() => {
                                setBookingStep('datetime')
                                setSelectedTime(null)
                            }}
                        >
                            Reschedule
                            <Calendar className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 hover:bg-zinc-50 font-bold rounded-xl"
                            style={{
                                color: business.buttonColor || business.themeColor || "#ea580c",
                                borderColor: `${business.buttonColor || business.themeColor || "#ea580c"}40` // 25% opacity
                            }}
                            onClick={() => {
                                setBookingStep('selection')
                                setSelectedServices([])
                                setSelectedTime(null)
                            }}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Book Another
                        </Button>
                    </div>

                </div>
            </div>
        )
    }

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
                        onClick={() => {
                            if (isPreview) return;
                            window.location.href = `/${business.slug}/${block.pageType}`
                        }}
                        className={cn(
                            "w-full h-12 px-6 flex items-center justify-between group transition-all active:scale-[0.98] shadow-sm hover:shadow-md border border-white/10",
                            br
                        )}
                        style={{
                            backgroundColor: isGlass ? `${business.buttonColor || business.themeColor || "#000000"}CC` : (business.buttonColor || business.themeColor || "#000000"),
                            backdropFilter: isGlass ? 'blur(8px)' : 'none'
                        }}
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
                        onClick={() => {
                            if (isPreview) return;
                            window.open(block.url, '_blank')
                        }}
                        className={cn(
                            "w-full h-12 px-6 flex items-center justify-between group transition-all bg-white dark:bg-zinc-900 border border-[#CDD0DB]/60 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm active:scale-[0.98]",
                            isGlass && "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md",
                            br
                        )}
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
                        <AccordionItem value="hours" className={cn(
                            "border border-[#CDD0DB]/60 px-3 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border-b-[#CDD0DB]/60",
                            isGlass && "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md",
                            br
                        )}>
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
                        <AccordionItem value="contacts" className={cn(
                            "border border-[#CDD0DB]/60 px-3 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border-b-[#CDD0DB]/60",
                            isGlass && "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md",
                            br
                        )}>
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
                        <AccordionItem value="location" className={cn(
                            "border border-[#CDD0DB]/60 px-3 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border-b-[#CDD0DB]/60",
                            isGlass && "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md",
                            br
                        )}>
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
                                        <Button
                                            className={cn("w-full h-10 text-[12px] font-normal", br)}
                                            style={{ backgroundColor: business.buttonColor || business.themeColor || "#000000" }}
                                            onClick={() => {
                                                const addr = business.address ? [business.address.streetAddress, business.address.addressLocality, business.address.addressRegion, business.address.postalCode].filter(Boolean).join(', ') : locationAddress
                                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank')
                                            }}>
                                            Open in Maps
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        className="w-full h-10 rounded-lg text-[12px] font-normal"
                                        style={{ backgroundColor: business.buttonColor || business.themeColor || "#000000" }}
                                        onClick={() => window.open(block.url, '_blank')}>
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
                        <AccordionItem value="facilities" className={cn(
                            "border border-[#CDD0DB]/60 px-3 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border-b-[#CDD0DB]/60",
                            isGlass && "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md",
                            br
                        )}>
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
                                        "p-4 border transition-all duration-300 flex flex-col gap-4",
                                        br,
                                        selectedServices.includes(service._id)
                                            ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500"
                                            : cn("border-[#CDD0DB] bg-white hover:border-zinc-300 shadow-sm", isGlass && "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md")
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
                                        <div
                                            className="text-[15px] font-black"
                                            style={{ color: business.buttonColor || business.themeColor || "#ea580c" }}
                                        >
                                            {service.offers?.priceCurrency || 'USD'} {service.offers?.price?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                    <Button
                                        variant={selectedServices.includes(service._id) ? "default" : "outline"}
                                        className={cn(
                                            "w-full h-10 text-[13px] font-bold transition-all",
                                            br,
                                            selectedServices.includes(service._id)
                                                ? "text-white border-none shadow-md"
                                                : "border-zinc-200 hover:bg-zinc-50"
                                        )}
                                        style={selectedServices.includes(service._id) ? { backgroundColor: business.buttonColor || business.themeColor || "#1f2937" } : {}}
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
                                    className={cn(
                                        "group bg-white dark:bg-zinc-900 border border-[#CDD0DB]/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col",
                                        isGlass && "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md",
                                        br
                                    )}
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
                                            className={cn("w-full h-8 border-zinc-200 text-[11px] font-bold hover:bg-zinc-900 hover:text-white transition-all group-hover:border-zinc-900", br)}
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
                    <div key={block.id} className={cn(
                        "p-6 border border-[#CDD0DB] bg-white dark:bg-zinc-900 space-y-3 shadow-sm",
                        isGlass && "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md",
                        br
                    )}>
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
            case 'facilities':
                return (
                    <div key={block.id} className="space-y-4">
                        {block.title && <h2 className="text-[18px] font-medium leading-[26px] text-[#0A0909] dark:text-white font-rubik">{block.title}</h2>}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {block.selectedFacilities?.map((fac: string, idx: number) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center gap-2 border border-zinc-100 dark:border-zinc-700">
                                    <span className="text-xs font-medium text-zinc-900 dark:text-white capitalize">{fac.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
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
            className="min-h-screen bg-white dark:bg-zinc-950 antialiased tracking-normal selection:bg-black selection:text-white"
            style={{ fontFamily: getFontFamily() }}
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

                {(pageType === 'storefront' || pageType === 'profile') && (
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
                    <div className={cn(
                        "w-full max-w-sm flex items-center justify-between p-2.5 bg-white/90 backdrop-blur-xl border border-zinc-200/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] pointer-events-auto animate-in fade-in zoom-in-95 duration-300",
                        br
                    )}>
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
                            className={cn("h-11 px-10 text-white font-black text-[14px] flex items-center gap-2 group shadow-lg transition-all active:scale-95", br)}
                            style={{ backgroundColor: business.buttonColor || business.themeColor || "#1f2937" }}
                            onClick={() => {
                                if (pageType === 'bookings') {
                                    setBookingStep('datetime')
                                }
                            }}
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
