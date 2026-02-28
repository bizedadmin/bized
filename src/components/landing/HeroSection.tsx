"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, MessageSquare, ShoppingBag, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
    return (
        <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 pt-20 pb-8 overflow-hidden">
            <div className="container max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">

                {/* Text Content */}
                <div className="flex-1 text-center lg:text-left space-y-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] as const }}
                        className="text-balance text-4xl lg:text-6xl font-bold tracking-tight text-[var(--color-on-surface)]"
                    >
                        Start online store on Google and Whatsapp.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0, 0, 1] as const }}
                        className="text-lg lg:text-xl text-[var(--color-on-surface)]/80 max-w-2xl mx-auto lg:mx-0"
                    >
                        Accept bookings, orders, engage with your customers and grow your business directly through Google and WhatsApp
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: [0.2, 0, 0, 1] as const }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                        <Button>
                            Start for Free
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </motion.div>
                </div>

                {/* Interactive Mockup */}
                {/* Interactive Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.2, 0, 0, 1] as const }}
                    className="flex-1 w-full max-w-[600px] relative"
                >
                    {/* Horizontal Layout for Sync Card + Main Mockup */}
                    <div className="flex items-center justify-center lg:justify-end gap-0">

                        {/* Sync Leads Card (Absolute or negative margin to overlap/connect) */}
                        <div className="hidden sm:block absolute left-[-100px] top-1/2 -translate-y-1/2 z-10">
                            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 w-[240px]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                    </div>
                                    <p className="font-semibold text-sm text-gray-900">Sync leads from:</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {/* Icons */}
                                    {[
                                        { label: "Phone", bg: "bg-gray-100", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> },
                                        { label: "WhatsApp", bg: "bg-green-100 text-green-600", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg> }, // Simplified Generic MessageCircle for now as WA
                                        { label: "Instagram", bg: "bg-pink-100 text-pink-600", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg> },
                                        { label: "Facebook", bg: "bg-blue-100 text-blue-600", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> },
                                        { label: "APIs", bg: "bg-indigo-100 text-indigo-600", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg> },
                                        { label: "Forms", bg: "bg-orange-100 text-orange-600", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M8 15l4 4 4-4" /></svg> } // Using generic for forms
                                    ].map((item, i) => (
                                        <div key={i} className={`flex flex-col items-center justify-center p-2 rounded-lg ${item.bg}`}>
                                            {item.icon}
                                            <span className="text-[9px] mt-1 font-medium">{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Connection Arrow */}
                                <svg className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-6 text-green-500 z-0 pointer-events-none" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 12H44" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                                    <path d="M40 8L44 12L40 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative bg-[var(--color-surface-container)] rounded-[28px] overflow-hidden shadow-xl border border-[var(--color-outline-variant)]/20 p-4 min-h-[400px] w-full max-w-[320px] ml-auto mr-auto lg:mr-0 z-0">
                            {/* Header Mockup */}
                            <div className="flex items-center justify-between mb-6 px-2">
                                <div className="font-bold text-lg">Order Management</div>
                                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container-high)]" />
                            </div>

                            {/* Chat List Mockup */}
                            <div className="space-y-3">
                                {[
                                    { name: "John Doe", msg: "New Order #1234", icon: <ShoppingBag className="w-4 h-4" />, time: "2m", active: true },
                                    { name: "Sarah Smith", msg: "Payment Received", icon: <ShoppingBag className="w-4 h-4" />, time: "15m", active: false },
                                    { name: "Mike Ross", msg: "Order Shipped", icon: <MessageSquare className="w-4 h-4" />, time: "1h", active: false },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "p-4 rounded-[16px] flex items-center gap-4 transition-colors",
                                            item.active ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            item.active ? "bg-white/20" : "bg-[var(--color-surface-container)]"
                                        )}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="font-medium text-sm truncate">{item.name}</div>
                                                <div className={cn("text-xs opacity-70")}>{item.time}</div>
                                            </div>
                                            <div className={cn("text-xs truncate opacity-80")}>{item.msg}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating Action Button Mockup */}
                            <div className="absolute bottom-6 right-6 w-14 h-14 bg-[var(--color-primary)] rounded-[16px] shadow-lg flex items-center justify-center text-white">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
