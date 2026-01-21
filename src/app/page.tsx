"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle2, ChevronRight, PlayCircle, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { Marquee } from "@/components/landing/Marquee"

const BUSINESS_NAMES = [
    "Mama Nalis", "Kijiji Coffee", "Urban Sneakers", "Beauty by Jane", "TechHub",
    "Nairobi Pizza", "Swift Logistics", "Fresh Farm", "Elite Barbers", "Zen Yoga",
    "Burger Joint", "Flower Pot", "City Taxis", "Digital Solutions", "Event Masters"
]

export default function LandingPage() {
    const router = useRouter()
    const [businessName, setBusinessName] = useState("")

    const handlePreview = (e: React.FormEvent) => {
        e.preventDefault()
        if (businessName.trim()) {
            // In a real app, this might go to a signup flow or a specific preview page
            // For now, let's just go to create-business or similar
            router.push(`/create-business?name=${encodeURIComponent(businessName)}`)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white selection:bg-blue-100 selection:text-blue-900">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
                        <img src="/logo-dark-mode.png" alt="B" className="w-8 h-8 hidden dark:block" />
                        <img src="/logo-light-mode.png" alt="B" className="w-8 h-8 dark:hidden" />
                        <span>Bized.</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600 dark:text-gray-400">
                        <Link href="/marketplace" className="hover:text-gray-900 dark:hover:text-white transition-colors">Marketplace</Link>
                        <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link>
                        <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Resources</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-gray-900 dark:text-gray-300 hover:text-blue-600 transition-colors">
                            Log In
                        </Link>
                        <Button className="rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white">
                            Get Started
                        </Button>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-16">

                {/* Hero Section */}
                <section className="px-4 sm:px-8 max-w-7xl mx-auto text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-8">
                        <Zap className="w-4 h-4 fill-current" />
                        <span>New Feature: WhatsApp Payments</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
                        Your Business OS.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            From Bio-link to Sale.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12">
                        The all-in-one platform for creators and retailers. Build a website, manage customers, and accept payments in seconds.
                    </p>

                    {/* Live Preview Input */}
                    <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-xl shadow-blue-900/5 ring-1 ring-gray-200 dark:ring-zinc-800 transform hover:scale-105 transition-transform duration-300">
                        <form onSubmit={handlePreview} className="relative flex items-center">
                            <span className="pl-4 text-gray-400 font-medium select-none">bized.app/</span>
                            <input
                                className="flex-1 h-12 bg-transparent border-none outline-none font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                                placeholder="yourname"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                autoFocus
                            />
                            <Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity">
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                    <p className="mt-4 text-sm text-gray-400 font-medium">
                        Free forever. No credit card required.
                    </p>
                </section>

                {/* Social Proof Marquee */}
                <section className="mb-24 space-y-8 overflow-hidden pointer-events-none opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <Marquee pauseOnHover className="[--duration:40s]">
                        {BUSINESS_NAMES.map((name, i) => (
                            <div key={i} className="mx-8 font-black text-2xl text-gray-300 dark:text-zinc-700 uppercase tracking-tighter">
                                {name}
                            </div>
                        ))}
                    </Marquee>
                </section>

                {/* Feature Bento Grid */}
                <LandingFeatures />

                {/* CTA Section */}
                <section className="mt-32 px-4 sm:px-8">
                    <div className="max-w-5xl mx-auto bg-gray-900 dark:bg-white rounded-[48px] p-12 md:p-24 text-center text-white dark:text-gray-900 relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                                Ready to start your business?
                            </h2>
                            <p className="text-xl text-gray-400 dark:text-gray-500 max-w-xl mx-auto">
                                Join 2,000+ founders building on Bized today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg w-full sm:w-auto">
                                    Start For Free
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-gray-700 dark:border-gray-200 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold text-lg w-full sm:w-auto">
                                    Download App
                                </Button>
                            </div>
                        </div>

                        {/* Abstract Background */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-blue-600 rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-purple-600 rounded-full blur-[120px]" />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-32 py-12 border-t border-gray-100 dark:border-zinc-900 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-8 mb-8 font-medium">
                        <Link href="/privacy">Privacy</Link>
                        <Link href="/terms">Terms</Link>
                        <Link href="/twitter">Twitter</Link>
                        <Link href="/instagram">Instagram</Link>
                    </div>
                    <p>© 2026 Bized Inc. All rights reserved.</p>
                </footer>

            </main>
        </div>
    )
}
