"use client"

import { MessageCircle, Link as LinkIcon, Smartphone, CreditCard, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

export function LandingFeatures() {
    return (
        <section className="py-24 px-4 sm:px-8 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">What&apos;s included?</h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        Everything you need to sell online, manage customers, and grow your brand.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Bento Item 1: WhatsApp CRM - Large span */}
                    <div className="md:col-span-2 relative h-[400px] overflow-hidden rounded-[32px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between group">
                        <div className="z-10 relative">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">WhatsApp CRM</h3>
                            <p className="text-gray-500 max-w-md">Manage orders and chat with customers where they already are. Send payment links directly in chat.</p>
                        </div>

                        {/* Visual: Chat Bubbles */}
                        <div className="absolute right-0 bottom-0 w-3/4 h-3/4 bg-gradient-to-tl from-green-50 to-transparent p-6 flex flex-col items-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm border border-gray-100 max-w-[200px]"
                            >
                                Can I pay via MPESA?
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-green-600 text-white p-3 rounded-2xl rounded-tl-none shadow-md text-sm max-w-[220px]"
                            >
                                Sure! Here&apos;s a secure payment link for your order #8821.
                            </motion.div>
                        </div>
                    </div>

                    {/* Bento Item 2: Bio Link */}
                    <div className="relative h-[400px] overflow-hidden rounded-[32px] bg-blue-600 text-white shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between group">
                        <div className="z-10 relative">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
                                <LinkIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Bio-Link Builder</h3>
                            <p className="text-blue-100">Your beautiful digital storefront, launched in seconds.</p>
                        </div>
                        {/* Visual: Phone Mockup */}
                        <div className="absolute -bottom-24 -right-12 w-64 h-80 bg-white rounded-[40px] border-8 border-white/20 shadow-2xl rotate-[-12deg] group-hover:rotate-0 transition-all duration-500" />
                    </div>

                    {/* Bento Item 3: Instant Payments */}
                    <div className="relative h-[300px] overflow-hidden rounded-[32px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all p-8 group">
                        <div className="z-10 relative">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Instant Payments</h3>
                            <p className="text-sm text-gray-500">Accept MPESA, Card, and Bank Transfer instantly.</p>
                        </div>
                        <div className="absolute bottom-6 right-6 w-32 h-20 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="font-mono text-lg font-bold text-gray-900">$120.00</span>
                        </div>
                    </div>

                    {/* Bento Item 4: Marketplace Discovery */}
                    <div className="md:col-span-2 relative h-[300px] overflow-hidden rounded-[32px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all p-8 group">
                        <div className="flex flex-col md:flex-row gap-8 h-full items-start md:items-center">
                            <div className="flex-1 z-10">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marketplace Discovery</h3>
                                <p className="text-gray-500">Get discovered by thousands of local customers searching on Bized. Free SEO included.</p>
                            </div>
                            {/* Visual: Mini Cards */}
                            <div className="flex-1 relative h-full w-full">
                                <div className="absolute inset-0 flex flex-col gap-4 pt-4 mask-fade-bottom">
                                    <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm flex gap-3 items-center transform translate-x-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                        <div className="space-y-1">
                                            <div className="w-24 h-2 bg-gray-100 rounded" />
                                            <div className="w-16 h-2 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm flex gap-3 items-center transform -translate-x-2">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                        <div className="space-y-1">
                                            <div className="w-24 h-2 bg-gray-100 rounded" />
                                            <div className="w-16 h-2 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
