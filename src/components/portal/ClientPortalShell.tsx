"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    LogOut,
    User,
    Calendar,
    ShoppingBag,
    Bell,
    Layout,
    Ticket,
    Search,
    Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Business {
    _id: string
    name: string
    slug: string
    logo?: string
    themeColor?: string
}

interface ClientPortalShellProps {
    children: React.ReactNode
    activeTab?: string
    onTabChange?: (tab: string) => void
    business?: Business | null
}

const navItems = [
    { id: "pages", label: "Public Pages", icon: Layout, href: "/bized?tab=pages" },
    { id: "bookings", label: "My Bookings", icon: Calendar, href: "/bized?tab=bookings" },
    { id: "orders", label: "My Orders", icon: ShoppingBag, href: "/bized?tab=orders" },
    { id: "tickets", label: "Support Tickets", icon: Ticket, href: "/bized?tab=tickets" },
]

export default function ClientPortalShell({
    children,
    activeTab: propActiveTab,
    onTabChange,
    business: propBusiness
}: ClientPortalShellProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const [business, setBusiness] = useState<Business | null>(propBusiness || null)
    const [isLoading, setIsLoading] = useState(!propBusiness)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (!propBusiness) {
            fetch("/api/business/bized")
                .then(res => res.json())
                .then(data => {
                    setBusiness(data)
                    setIsLoading(false)
                })
        }
    }, [propBusiness])

    const themeColor = business?.themeColor || "#10b981"

    if (status === "loading" || (isLoading && !business)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!session) return null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 fixed h-full z-20">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                    <Link href="/bized" className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: themeColor, boxShadow: `${themeColor}33 0px 8px 16px` }}
                        >
                            {business?.logo ? (
                                <Image src={business.logo} alt={business.name} width={24} height={24} className="rounded-lg object-contain brightness-0 invert" />
                            ) : (
                                <Image src="/logo-light-mode.png" alt="B" width={24} height={24} className="brightness-0 invert" />
                            )}
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
                            {business?.name || "Client Portal"}
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = propActiveTab === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (onTabChange) {
                                        onTabChange(item.id)
                                    } else {
                                        router.push(item.href)
                                    }
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                                    isActive
                                        ? "font-semibold bg-gray-50 dark:bg-zinc-800"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                )}
                                style={{ color: isActive ? themeColor : undefined }}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200"
                                )} style={{ color: isActive ? themeColor : undefined }} />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-gray-200 dark:border-zinc-800">
                    <div className="flex flex-col items-center text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Powered by</p>
                        <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <Image src="/logo-dark-mode.png" alt="Bized" width={20} height={20} className="dark:brightness-0 dark:invert" />
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Bized app</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 lg:hidden">
                        <Image src="/logo-dark-mode.png" alt="B" width={32} height={32} />
                        <span className="font-bold">Portal</span>
                    </div>

                    <div className="relative hidden md:flex items-center flex-1 max-w-md">
                        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search in portal..."
                            className="pl-10 h-10 bg-gray-100/50 dark:bg-zinc-800/50 border-none rounded-full focus-visible:ring-blue-500/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative rounded-full">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <Avatar className="h-8 w-8 ring-2 ring-gray-100 dark:ring-zinc-800">
                                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                        <AvatarFallback className="bg-gray-100 text-gray-700">
                                            {session.user?.email?.substring(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="ml-2 mr-1 text-sm font-medium hidden sm:block">{session.user?.name?.split(' ')[0]}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mt-2" align="end">
                                <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                                    <p className="text-sm font-semibold">{session.user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                </div>
                                <DropdownMenuItem asChild>
                                    <Link href="/account" className="cursor-pointer py-2 px-3">
                                        <User className="mr-3 h-4 w-4 text-gray-400" />
                                        Profile Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="text-red-600 focus:text-red-600 cursor-pointer py-2 px-3"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Log Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1">
                    {children}
                </main>
            </div>

            {/* Mobile Nav Overlay */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-md">
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-gray-200/50 dark:border-zinc-800/50 rounded-3xl shadow-2xl p-2.5 flex justify-between items-center px-6">
                    {navItems.map((item) => {
                        const isActive = propActiveTab === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (onTabChange) {
                                        onTabChange(item.id)
                                    } else {
                                        router.push(item.href)
                                    }
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300",
                                    isActive
                                        ? "text-white shadow-xl -translate-y-3 scale-110"
                                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                )}
                                style={{
                                    backgroundColor: isActive ? themeColor : undefined,
                                    boxShadow: isActive ? `${themeColor}66 0px 10px 20px` : undefined
                                }}
                            >
                                <item.icon className="w-6 h-6" />
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
