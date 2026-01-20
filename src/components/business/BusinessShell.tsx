"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    Globe,
    MessageCircle,
    Instagram,
    Chrome,
    Store,
    Loader2,
    ChevronDown,
    Bell,
    Search,
    Menu,
    ExternalLink,
    RefreshCw,
    LogOut,
    User,
    Box,
    Truck,
    CheckCircle2,
    Calendar,
    Sparkles,
    Briefcase,
    HandPlatter,
    FileText,
    Receipt,
    Tags,
    FileStack,
    MapPin,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ImageGeneratorModal } from "@/components/ui/image-generator-modal"

const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/business/dashboard", badge: null },
    { icon: Users, label: "Customers", href: "/business/customers", badge: null },
    { icon: MessageSquare, label: "Chats", href: "/business/chats", badge: null },
]

const ordersMenu = {
    icon: ShoppingCart,
    label: "Orders",
    href: "#",
    children: [
        { label: "Orders", href: "/business/orders" },
        { label: "Labels", href: "/business/orders/labels" },
        { label: "Manifests", href: "/business/orders/manifests" },
    ]
}

const servicesMenu = {
    icon: HandPlatter,
    label: "Services",
    href: "#",
    children: [
        { label: "All Services", href: "/business/services" },
        { label: "Categories", href: "/business/services/categories" },
        { label: "Packages & Bundles", href: "/business/services/bundles" },
        { label: "Add-ons & Extras", href: "/business/services/addons" },
        { label: "Service Areas", href: "/business/services/areas" },
        { label: "Pricing & Rules", href: "/business/services/rules" },
    ]
}

const businessMenu = {
    icon: Briefcase,
    label: "Business",
    href: "#",
    children: [
        { label: "Profile", href: "/business/profile" },
        { label: "Stores/Locations", href: "/business/locations" },
        { label: "Analytics", href: "/business/analytics" },
        { label: "Settings", href: "/business/settings" },
    ]
}

const productsAndStore = {
    icon: Box,
    label: "Products & store",
    href: "#",
    children: [
        { label: "All Products", href: "/business/products" },
        { label: "Shop Page", href: "/business/shop-page" },
        { label: "Shipping and returns", href: "/business/shipping-returns" },
        { label: "Store quality", href: "/business/store-quality" },
    ]
}

const bookings = {
    icon: Calendar,
    label: "Bookings",
    href: "#",
    children: [
        { label: "Overview", href: "/business/bookings/overview" },
        { label: "Booking Page", href: "/business/booking-page" },
        { label: "Tickets", href: "/business/tickets" },
    ]
}

const quotesMenu = {
    icon: MessageSquare,
    label: "Quotes",
    href: "#",
    children: [
        { label: "Quote Page", href: "/business/quote-page" },
        { label: "Quote Requests", href: "/business/quote-requests" },
    ]
}


const salesChannels = [
    {
        icon: Globe,
        label: "Website",
        href: "#",
        badge: null,
        children: [
            { label: "Design", href: "/business/design" },
            { label: "Style", href: "/business/style" },
            { label: "Seo/Meta", href: "/business/seo" },
            { label: "Analytics", href: "/business/analytics" },
        ]
    },
    { icon: MessageCircle, label: "WhatsApp", href: "/business/whatsapp" },
    { icon: Instagram, label: "Instagram", href: "/business/instagram", badge: "NEW" },
    { icon: Chrome, label: "Google", href: "/business/google", badge: "NEW" },
    { icon: Store, label: "Point of Sale", href: "/business/pos", badge: "BETA" },
]

interface Business {
    _id: string
    name: string
    slug: string
    industry?: string
    plan?: string
    themeColor?: string
}

export default function BusinessShell({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [expandedSection, setExpandedSection] = useState<string | null>(null)
    const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false)

    const toggleSection = (section: string) => {
        setExpandedSection(prev => prev === section ? null : section)
    }

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
            return
        }

        if (status === "authenticated") {
            const selectedBusiness = localStorage.getItem("selectedBusiness")
            if (selectedBusiness) {
                setBusiness(JSON.parse(selectedBusiness))
                setLoading(false)
            } else {
                router.push("/businesses/select")
            }
        }
    }, [status, router])

    const handleOpenStore = () => {
        if (business) {
            window.open(`/bized`, '_blank')
        }
    }

    const handleChangeStore = () => {
        router.push("/businesses/select")
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!business) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
            <header className="h-14 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>

                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo-dark-mode.png"
                            alt="Bized Logo"
                            width={32}
                            height={32}
                            className="h-8 w-auto"
                        />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            Bized
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 w-64 h-9 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        onClick={() => setIsAiAssistantOpen(true)}
                    >
                        <Sparkles className="w-5 h-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                    <AvatarFallback>{session?.user?.email?.substring(0, 1).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuItem asChild>
                                <Link href="/account" className="flex items-center cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/business/settings" className="flex items-center cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => signOut({ callbackUrl: '/login' })}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 top-14 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full flex items-center gap-3 h-auto px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 justify-start"
                                >
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                        style={{ backgroundColor: business.themeColor || '#1f2937' }}
                                    >
                                        {business.name.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col items-start flex-1 min-w-0">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate w-full text-left">
                                            {business.name}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-left">
                                            bized.app/{business.slug}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem onClick={handleOpenStore} className="cursor-pointer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Client Portal
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleChangeStore} className="cursor-pointer">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Change store
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-1">
                            {/* Dashboard */}
                            <Link
                                href="/business/dashboard"
                                className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    pathname === "/business/dashboard"
                                        ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span>Dashboard</span>
                                </div>
                            </Link>

                            {/* Business */}
                            <button
                                onClick={() => toggleSection('business')}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <businessMenu.icon className="w-5 h-5" />
                                    <span>{businessMenu.label}</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'business' && "rotate-180")} />
                            </button>
                            {expandedSection === 'business' && (
                                <div className="ml-9 space-y-1">
                                    {businessMenu.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            className={cn(
                                                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                pathname === child.href
                                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Bookings */}
                            <button
                                onClick={() => toggleSection('bookings')}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <bookings.icon className="w-5 h-5" />
                                    <span>{bookings.label}</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'bookings' && "rotate-180")} />
                            </button>
                            {expandedSection === 'bookings' && (
                                <div className="ml-9 space-y-1">
                                    {bookings.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            className={cn(
                                                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                pathname === child.href
                                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Orders */}
                            <button
                                onClick={() => toggleSection('orders')}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <ordersMenu.icon className="w-5 h-5" />
                                    <span>{ordersMenu.label}</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'orders' && "rotate-180")} />
                            </button>
                            {expandedSection === 'orders' && (
                                <div className="ml-9 space-y-1">
                                    {ordersMenu.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            className={cn(
                                                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                pathname === child.href
                                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Invoices */}
                            <Link
                                href="/business/invoices"
                                className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    pathname === "/business/invoices"
                                        ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Receipt className="w-5 h-5" />
                                    <span>Invoices</span>
                                </div>
                            </Link>

                            {/* Services */}
                            <button
                                onClick={() => toggleSection('services')}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <servicesMenu.icon className="w-5 h-5" />
                                    <span>Services</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'services' && "rotate-180")} />
                            </button>
                            {expandedSection === 'services' && (
                                <div className="ml-9 space-y-1">
                                    {servicesMenu.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            className={cn(
                                                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                pathname === child.href
                                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Products & Store */}
                            <button
                                onClick={() => toggleSection('store')}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <productsAndStore.icon className="w-5 h-5" />
                                    <span>{productsAndStore.label}</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'store' && "rotate-180")} />
                            </button>
                            {expandedSection === 'store' && (
                                <div className="ml-9 space-y-1">
                                    {productsAndStore.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            className={cn(
                                                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                pathname === child.href
                                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Quotes (New) */}
                            <button
                                onClick={() => toggleSection('quotes')}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <quotesMenu.icon className="w-5 h-5" />
                                    <span>{quotesMenu.label}</span>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'quotes' && "rotate-180")} />
                            </button>
                            {expandedSection === 'quotes' && (
                                <div className="ml-9 space-y-1">
                                    {quotesMenu.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            className={cn(
                                                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                pathname === child.href
                                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}


                            {/* Other Items */}
                            {navigationItems.filter(i => !['Dashboard', 'Services', 'Business', 'Products & store'].includes(i.label)).map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        pathname === item.href
                                            ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Link>
                            ))}
                        </div>


                        <div className="mt-8">
                            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Sales Channels
                            </h3>
                            <div className="space-y-1">
                                {salesChannels.map((channel) => (
                                    <div key={channel.label} className="space-y-1">
                                        {channel.children ? (
                                            <>
                                                <button
                                                    onClick={() => toggleSection('website')}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <channel.icon className="w-5 h-5" />
                                                        <span>{channel.label}</span>
                                                    </div>
                                                    <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'website' && "rotate-180")} />
                                                </button>
                                                {expandedSection === 'website' && (
                                                    <div className="ml-9 space-y-1">
                                                        {channel.children.map((child) => (
                                                            <Link
                                                                key={child.label}
                                                                href={child.href}
                                                                className={cn(
                                                                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                                    pathname === child.href
                                                                        ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                                                )}
                                                            >
                                                                {child.label}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <Link
                                                href={channel.href}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    pathname === channel.href
                                                        ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <channel.icon className="w-5 h-5" />
                                                    <span>{channel.label}</span>
                                                </div>
                                                {channel.badge && (
                                                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                                        {channel.badge}
                                                    </Badge>
                                                )}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </nav>
                </aside>

                {sidebarOpen && (
                    <div
                        className="fixed inset-0 top-14 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>

            <ImageGeneratorModal
                isOpen={isAiAssistantOpen}
                onClose={() => setIsAiAssistantOpen(false)}
                onImageSelect={() => { }} // Global assistant doesn't necessarily select images here
            />
        </div >
    )
}
