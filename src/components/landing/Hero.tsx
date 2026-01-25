"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Receipt, Wallet, Map, ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PlatformToggle } from "@/components/landing/PlatformToggle"
import { UnifiedInboxMockup } from "@/components/landing/UnifiedInboxMockup"
import { BookingMockup } from "@/components/landing/BookingMockup"
import { InvoiceMockup } from "@/components/landing/InvoiceMockup"
import { WalletMockup } from "@/components/landing/WalletMockup"
import { RiskBadge } from "@/components/landing/RiskBadge"
import { SmartWalletButton } from "@/components/landing/SmartWalletButton"

export function Hero() {
    const [view, setView] = useState<"mobile" | "desktop">("mobile")

    return (
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start min-h-[90dvh]">

            {/* Left Column: Headlines & Stem */}
            <div className="space-y-12 pt-8 sm:pt-0 w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">

                {/* Headlines */}
                <div className="space-y-6 w-full flex flex-col items-center lg:items-start">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                        Grow Your Bookings<br />
                        <span className="text-gray-400 dark:text-zinc-600">& Sell on WhatsApp.</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                        Turn every conversation into a confirmed booking, paid order, and lasting customer relationship.
                    </p>

                    {/* Mobile/High Priority CTA */}
                    <div className="pt-4 pb-2 w-full flex justify-center lg:justify-start">
                        <Button className="font-bold bg-whatsapp hover:bg-whatsapp-hover text-white rounded-full h-12 px-8 text-lg transition-colors shadow-lg shadow-green-500/20">
                            Get Started
                        </Button>
                    </div>

                    <div className="pt-2">
                        <PlatformToggle view={view} setView={setView} />
                    </div>
                </div>

                {/* The Vertical Stem (Scannable Feature List) */}
                <div className="space-y-8 pl-4 border-l-2 border-gray-100 dark:border-zinc-800">

                    {/* Feature 1: Unified Inbox */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg">Unified Inbox</h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm pl-[3.25rem]">
                            Centralize customer chats from WhatsApp, Instagram, and Google.
                        </p>
                    </motion.div>

                    {/* Feature 2: Cashflow Guard */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                Cashflow Guard
                                <RiskBadge level="Low" />
                            </h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm pl-[3.25rem]">
                            Automated cashbook with real-time Invoice Fraud Detection.
                        </p>
                    </motion.div>

                    {/* Feature 3: Digital Wallet */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                Unified Digital Loyalty Card
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 z-10">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white dark:text-black">
                                            <path d="M18.71 19.5c-.31.96-1.45 2.93-2.54 2.93-1.01 0-1.35-.6-2.54-.6-1.2 0-1.6.61-2.54.61-1.2 0-2.39-2.13-2.7-3.26-.06-.21-1.63-5.22 1.58-6.19 2.05-.62 1.48.57 3.2.57 1.7 0 1.25-1.22 3.2-1.22 1.14 0 2.22.61 2.87 1.53-2.57 1.34-2.12 5.06.49 6.26-.14.48-.32.96-.53 1.37zM13 3.5c.52-.01 1.01.21 1.4.58.3.3.47.7.47 1.13 0 .19-.01.38-.03.56-.63.03-1.29-.21-1.74-.66-.41-.39-.62-.96-.62-1.54 0-.02.52-.07.52-.07z" />
                                        </svg>
                                    </div>
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
                                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    </div>
                                </div>
                            </h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm pl-[3.25rem] mb-3">
                            Issue branded Apple and Google loyalty card passes without an app.
                        </p>

                        {/* OS-Smart Button for Mobile */}
                        <div className="pl-[3.25rem] md:hidden">
                            <SmartWalletButton />
                        </div>
                    </motion.div>

                    {/* Feature 4: Service Mapping */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                                <Map className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg">Service Mapping</h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm pl-[3.25rem]">
                            Visualize your market footprint with PWA-captured GPS and Polygons.
                        </p>
                    </motion.div>

                </div>

                {/* Professional CTA Block */}
                <div className="pt-8 pl-4 flex flex-col items-start gap-4">
                    <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 px-8 text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        Start Free <ArrowRight className="w-5 h-5" />
                    </Button>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card required
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> 14-day free trial
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                            Join 2,000+ businesses growing with Bized.
                        </p>
                    </div>
                </div>

            </div>

            {/* Right Column: Visual Anchor */}
            <div className="relative mb-12 lg:mb-0 w-[80%] mx-auto lg:w-1/2 flex justify-center lg:justify-end">
                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/50 via-purple-100/30 to-white dark:from-blue-900/20 dark:via-purple-900/10 dark:to-zinc-950 rounded-full blur-3xl -z-10" />

                <div className="w-full max-w-xl flex flex-col items-center lg:items-end">

                    {/* Booking Label */}
                    <div className="w-full max-w-sm md:max-w-none md:w-80 mb-2 flex justify-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-600">
                            Online Booking
                        </span>
                    </div>
                    <BookingMockup />

                    {/* Inbox Label */}
                    <div className="w-full max-w-sm mx-auto md:max-w-none md:ml-auto md:mr-0 mb-2 flex justify-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-600">
                            Unified Inbox
                        </span>
                    </div>
                    <UnifiedInboxMockup />

                    {/* Invoice Label */}
                    <div className="w-full max-w-sm mx-auto md:max-w-2xl md:ml-auto md:mr-0 mb-2 flex justify-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-600">
                            Invoice & Payments
                        </span>
                    </div>
                    <InvoiceMockup />

                    {/* Wallet Label */}
                    <div className="w-full max-w-sm mx-auto mt-0 mb-2 flex justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-600">
                            Virtual Loyalty Cards
                        </span>
                    </div>
                    <WalletMockup />
                </div>
            </div>

        </div >
    )
}
