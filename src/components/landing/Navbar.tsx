"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 transition-all duration-300 pt-[env(safe-area-inset-top)]">
            <div className="max-w-7xl mx-auto px-6 lg:px-20 h-16 flex items-center justify-between">
                {/* Logo (Top-Left) */}
                <Link href="/" className="flex items-center gap-3">
                    <img src="/brand-icon.png" alt="Bized" className="w-12 h-12 object-contain" />
                    <span className="font-black text-3xl md:text-4xl tracking-tighter text-gray-900 dark:text-white">
                        Bized<span className="text-blue-600">.</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600 dark:text-gray-400">
                    <Link href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</Link>
                    <Link href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link>
                </nav>

                {/* CTA (Top-Right) */}
                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block font-bold text-sm text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                        Log In
                    </Link>
                    <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors hidden sm:flex">
                        Start Free
                    </Button>

                    {/* Mobile Hamburger Menu */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-sm">
                                <SheetHeader className="mb-6">
                                    <div className="flex items-center gap-3">
                                        <img src="/brand-icon.png" alt="Bized" className="w-10 h-10 object-contain" />
                                        <span className="font-black text-3xl tracking-tighter text-gray-900 dark:text-white">
                                            Bized<span className="text-blue-600">.</span>
                                        </span>
                                    </div>
                                </SheetHeader>

                                <div className="flex flex-col gap-6">
                                    {/* Primary Mobile CTA */}
                                    <div className="space-y-4 pb-6 border-b border-gray-100 dark:border-zinc-800">
                                        <Button className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 text-base">
                                            Start Free
                                        </Button>
                                        <p className="text-center text-sm text-gray-500 font-medium">
                                            Existing customer? <Link href="/login" className="text-black dark:text-white font-bold hover:underline">Log in</Link>
                                        </p>
                                    </div>

                                    {/* Nav Links */}
                                    <div className="flex flex-col gap-1">
                                        <Link href="#features" className="text-base font-medium py-3 px-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                                            Features
                                        </Link>
                                        <Link href="#pricing" className="text-base font-medium py-3 px-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                                            Pricing
                                        </Link>
                                        <Link href="#" className="text-base font-medium py-3 px-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                                            Resources
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                </div>
            </div>
        </header>
    )
}
