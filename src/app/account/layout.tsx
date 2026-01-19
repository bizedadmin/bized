
"use client"

import Link from "next/link"
import Image from "next/image" // Added Image
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, Calendar, LogOut, ShoppingBag, FileText, CreditCard, LayoutDashboard, Bell, UserCircle } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes" // Added useTheme
import { useState, useEffect, useRef } from "react" // Added React hooks

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)

    // Desktop state
    const [isDesktopProfileOpen, setIsDesktopProfileOpen] = useState(false)
    const desktopProfileMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
        const handleClickOutside = (event: MouseEvent) => {
            // Mobile check
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
            // Desktop check
            if (desktopProfileMenuRef.current && !desktopProfileMenuRef.current.contains(event.target as Node)) {
                setIsDesktopProfileOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const sidebarItems = [
        {
            title: "Overview",
            href: "/account",
            icon: LayoutDashboard,
        },
        {
            title: "My Bookings",
            href: "/account/bookings",
            icon: Calendar,
        },
        {
            title: "My Orders",
            href: "/account/orders",
            icon: ShoppingBag,
        },
        {
            title: "My Invoices",
            href: "/account/invoices",
            icon: FileText,
        },
        {
            title: "My Payments",
            href: "/account/payments",
            icon: CreditCard,
        },
    ]

    // Determine active page title
    const activeItem = sidebarItems.find(item => item.href === pathname)
    const pageTitle = activeItem ? activeItem.title : "My Account"

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50/50 dark:bg-black font-sans">
            {/* Mobile Top Header */}
            <div
                className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between shadow-sm transition-all duration-300"
                style={{
                    paddingTop: 'max(env(safe-area-inset-top), 16px)',
                    height: 'calc(56px + env(safe-area-inset-top))',
                    paddingBottom: '12px'
                }}
            >
                <div className="flex items-center gap-3 pt-1">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                        <Image
                            src={mounted && (theme === "dark" || resolvedTheme === "dark") ? "/logo-dark-mode.png" : "/logo-light-mode.png"}
                            alt="Bized Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-lg tracking-tight">{pageTitle}</span>
                </div>

                <div className="flex items-center gap-1 pt-1">
                    {/* Notifications */}
                    <button className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <Bell className="w-5 h-5 stroke-[2px]" />
                    </button>

                    {/* Profile Menu */}
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="p-2 -mr-2 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <UserCircle className="w-6 h-6 stroke-[2px]" />
                        </button>

                        {/* Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                <Link
                                    href="/account/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar (Rail) */}
            <aside className="hidden md:flex w-28 border-r bg-background flex-col min-h-screen sticky top-0 h-screen py-4 items-center">
                <div className="flex flex-col gap-4 w-full px-2">
                    <div className="flex justify-center mb-4">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                            <Image
                                src={mounted && (theme === "dark" || resolvedTheme === "dark") ? "/logo-dark-mode.png" : "/logo-light-mode.png"}
                                alt="Bized"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-1 transition-all hover:bg-muted active:scale-95",
                                pathname === item.href
                                    ? "bg-muted text-primary"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <item.icon className={cn("h-7 w-7 transition-all", pathname === item.href ? "stroke-[2.5px]" : "stroke-[2px]")} />
                            <span className="text-[10px] font-medium text-center leading-tight w-full truncate px-1">{item.title}</span>
                        </Link>
                    ))}

                    <div className="mt-auto pt-4 w-full flex justify-center">
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all w-full"
                        >
                            <LogOut className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe">
                <div className="grid grid-cols-5 h-16">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors active:scale-95",
                                pathname === item.href
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-zinc-500 dark:text-zinc-400"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", pathname === item.href ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                            {item.title}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Main Content with top padding for mobile header and bottom padding for mobile nav */}
            <main className="flex-1 w-full pb-24 md:pb-10 pt-[calc(60px+env(safe-area-inset-top))] md:pt-0">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-end gap-3 px-6 py-4">
                    {/* Notifications */}
                    <button className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <Bell className="w-5 h-5 stroke-[2px]" />
                    </button>

                    {/* Profile Menu */}
                    <div className="relative" ref={desktopProfileMenuRef}>
                        <button
                            onClick={() => setIsDesktopProfileOpen(!isDesktopProfileOpen)}
                            className="p-2 -mr-2 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <UserCircle className="w-6 h-6 stroke-[2px]" />
                        </button>

                        {/* Dropdown */}
                        {isDesktopProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200 z-50">
                                <Link
                                    href="/account/profile"
                                    onClick={() => setIsDesktopProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {children}
            </main>
        </div>
    )
}
