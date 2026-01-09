"use client"

import { Search, ShoppingBag, Menu, MapPin, Phone, Clock, Share2, ArrowLeft, MessageSquare, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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
    buttonColor?: string
    whatsappNumber?: string
    whatsappConnected?: boolean
    showBookNow?: boolean
    showShopNow?: boolean
    showQuoteRequest?: boolean
    phone?: {
        code: string
        number: string
    }
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
    pageType?: 'storefront' | 'bookings' | 'shop' | 'quote'
}

export function BusinessStorefront({ business, products, pageType = 'storefront' }: BusinessStorefrontProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [cart, setCart] = useState<any[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Filter logic based on page type
    const displayedProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        if (pageType === 'shop') return matchesSearch && product.type !== 'service'
        if (pageType === 'bookings') return matchesSearch && product.type === 'service'
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
                    <div key={block.id} className="space-y-2">
                        {block.title && <h2 className="text-xl font-bold">{block.title}</h2>}
                        {block.content && <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{block.content}</p>}
                    </div>
                )
            case 'page_link':
                const getIcon = () => {
                    switch (block.pageType) {
                        case 'shop': return <ShoppingBag className="w-6 h-6" />
                        case 'bookings': return <Clock className="w-6 h-6" />
                        case 'quote': return <MessageSquare className="w-6 h-6" />
                        default: return <ArrowLeft className="w-6 h-6 rotate-180" />
                    }
                }
                return (
                    <button
                        key={block.id}
                        onClick={() => window.location.href = `/${business.slug}/${block.pageType}`}
                        className="w-full p-6 rounded-3xl flex items-center justify-between group transition-all"
                        style={{ backgroundColor: business.buttonColor || business.themeColor || "#1f2937" }}
                    >
                        <div className="text-left">
                            <div className="font-bold text-lg text-white">{block.label || `Go to ${block.pageType}`}</div>
                            {block.subtitle && <div className="text-sm text-white/60">{block.subtitle}</div>}
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-white">
                            {getIcon()}
                        </div>
                    </button>
                )
            case 'url':
                return (
                    <button
                        key={block.id}
                        onClick={() => window.open(block.url, '_blank')}
                        className="w-full py-5 px-6 rounded-2xl flex items-center justify-between group transition-all"
                        style={{ backgroundColor: business.secondaryColor || "#f3f4f6" }}
                    >
                        <div className="text-left">
                            <span className="font-bold text-gray-900 dark:text-white">{block.label || 'Link'}</span>
                            {block.subtitle && <div className="text-xs text-gray-500">{block.subtitle}</div>}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-zinc-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ExternalLink className="w-4 h-4 text-gray-600" />
                        </div>
                    </button>
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
                console.log('Error sharing:', error)
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert("Link copied to clipboard!")
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans">
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

            <main className="max-w-2xl mx-auto pb-20 pt-4">
                {/* Hero / Brand Section */}
                <div className="relative">
                    {/* Banner with secondary color */}
                    <div
                        className="h-32 w-full sm:rounded-b-[40px] relative overflow-hidden"
                        style={{ backgroundColor: business.secondaryColor || "#f3f4f6" }}
                    >
                        {/* Abstract background decorative elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/5 rounded-full blur-2xl" />
                    </div>

                    <div className="px-6 relative z-10">
                        {/* Logo Avatar - positioned to overlap banner */}
                        <div className="-mt-12 mb-4 flex justify-between items-end">
                            <div
                                className="w-20 h-20 rounded-[28px] flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-4 ring-white dark:ring-zinc-950 transform hover:scale-105 transition-transform"
                                style={{ backgroundColor: business.themeColor || "#1f2937" }}
                            >
                                {business.name.substring(0, 1).toUpperCase()}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                {business.name}
                            </h1>
                            <p className="text-gray-500 font-medium">@{business.slug}</p>
                        </div>

                        {business.description && (
                            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                {business.description}
                            </p>
                        )}

                        {/* Quick Contact Info */}
                        <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500 font-medium">
                            {business.phone && (
                                <div className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" />
                                    {business.phone.code} {business.phone.number}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                View Location
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections based on pageType */}

                {pageType === 'storefront' && (
                    <div className="px-6 pt-10 space-y-12">
                        {/* Dynamic Blocks */}
                        {blocks.length > 0 && (
                            <div className="space-y-6">
                                {blocks.map(renderBlock)}
                            </div>
                        )}

                        {/* Featured Items */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Featured</h3>
                                <button className="text-sm font-bold text-blue-600">See All</button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {products.slice(0, 3).map(product => (
                                    <div key={product._id} className="flex gap-4 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden flex-shrink-0">
                                            {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <ShoppingBag className="m-auto text-gray-300" />}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="font-bold">{product.name}</div>
                                            <div className="text-sm text-gray-500 font-bold mt-1">
                                                ${product.offers.price.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {pageType === 'shop' && (
                    <div className="px-6 pt-10">
                        {blocks.length > 0 && (
                            <div className="mb-10 space-y-6">
                                {blocks.map(renderBlock)}
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black">{settings.headline || 'Online Shop'}</h2>
                                <p className="text-sm text-gray-500">{settings.description || `${displayedProducts.length} items available`}</p>
                            </div>
                            <div className="relative w-40">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-9 h-10 rounded-full bg-gray-100 border-none text-xs"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                            {displayedProducts.map((product) => (
                                <div key={product._id} className="group">
                                    <div className="aspect-[3/4] rounded-[40px] bg-gray-100 overflow-hidden relative mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                        {product.image ? (
                                            <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <ShoppingBag className="m-auto w-12 h-12 text-gray-300" />
                                        )}
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                                        >
                                            <ShoppingBag className="w-5 h-5 text-zinc-900" />
                                        </button>
                                    </div>
                                    <div className="px-2">
                                        <div className="text-sm font-black truncate">{product.name}</div>
                                        <div className="text-lg font-black mt-1" style={{ color: business.themeColor }}>
                                            ${product.offers.price.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {pageType === 'bookings' && (
                    <div className="px-6 pt-10 space-y-8">
                        {blocks.length > 0 && (
                            <div className="space-y-6">
                                {blocks.map(renderBlock)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-black">{settings.headline || 'Book a Service'}</h2>
                            <p className="text-sm text-gray-500">{settings.description || 'Pick a service to schedule your appointment'}</p>
                        </div>

                        <div className="space-y-4">
                            {displayedProducts.map(service => (
                                <div key={service._id} className="p-6 rounded-[32px] border-2 border-zinc-100 dark:border-zinc-800 flex items-center gap-6 hover:border-zinc-900 transition-colors group">
                                    <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex-shrink-0 overflow-hidden">
                                        {service.image ? <img src={service.image} className="w-full h-full object-cover" /> : <Clock className="m-auto text-zinc-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-lg">{service.name}</div>
                                        <div className="text-sm text-zinc-500 font-bold mt-1">${service.offers.price} • 60 min</div>
                                    </div>
                                    <button
                                        className="h-12 px-6 rounded-2xl font-bold bg-zinc-900 text-white hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Book
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {pageType === 'quote' && (
                    <div className="px-6 pt-10 space-y-8">
                        {blocks.length > 0 && (
                            <div className="space-y-6">
                                {blocks.map(renderBlock)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-black">{settings.headline || 'Request a Quote'}</h2>
                            <p className="text-sm text-gray-500">{settings.description || "Fill out the form below and we'll get back to you with a custom quote."}</p>
                        </div>

                        <form className="space-y-6 bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-[40px]" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-widest text-zinc-500">Full Name</Label>
                                <Input className="h-14 rounded-2xl bg-white border-none shadow-sm focus:ring-2 ring-zinc-100" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-widest text-zinc-500">Email Address</Label>
                                <Input className="h-14 rounded-2xl bg-white border-none shadow-sm focus:ring-2 ring-zinc-100" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-widest text-zinc-500">Project Details</Label>
                                <textarea
                                    className="w-full min-h-[150px] p-4 rounded-2xl bg-white border-none shadow-sm focus:ring-2 ring-zinc-100 resize-none text-sm"
                                    placeholder="Tell us about what you need..."
                                />
                            </div>
                            <button className="w-full h-16 rounded-2xl bg-zinc-900 text-white font-black text-xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-zinc-900/10">
                                Send Request
                            </button>
                        </form>
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

            {/* Sticky Powered By */}
            <footer className="py-10 text-center">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-[0.2em]">
                    Powered by Bized
                </p>
            </footer>
        </div >
    )
}
