"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Check, User, Bot, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AISalesAssistant() {
    return (
        <section className="py-24 px-4 bg-white overflow-hidden">
            <div className="container max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Visual Side: Chat Simulation */}
                    <div className="flex-1 w-full order-2 lg:order-1 relative">
                        <div className="relative z-10 space-y-4 max-w-[480px] mx-auto lg:ml-0">

                            {/* Message 1: Customer */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="flex items-start gap-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none text-sm text-gray-800 font-medium shadow-sm">
                                    Hi! I'm interested in the Smart Watch. Do you have it in black?
                                </div>
                            </motion.div>

                            {/* Message 2: AI Assistant */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="flex items-start justify-end gap-4"
                            >
                                <div className="max-w-[80%]">
                                    <div className="bg-[var(--color-primary)] p-4 rounded-2xl rounded-tr-none text-sm text-white font-medium shadow-lg shadow-[var(--color-primary)]/20">
                                        Yes, we do! We have 5 units left in Cosmic Black. It features a 1.4" AMOLED display and 10-day battery life. Would you like to see a photo?
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 justify-end">
                                        <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <Bot className="w-3 h-3 text-indigo-600" />
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">AI sales assistant</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </motion.div>

                            {/* Message 3: Customer */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 1.6 }}
                                className="flex items-start gap-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none text-sm text-gray-800 font-medium shadow-sm">
                                    That sounds perfect. Can I buy it through WhatsApp?
                                </div>
                            </motion.div>

                            {/* Message 4: AI Assistant Action */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 2.4 }}
                                className="ml-auto w-full max-w-[320px] bg-white border border-gray-100 rounded-3xl p-5 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3">
                                    <div className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Checkout Link</div>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                                        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" alt="Product" className="w-12 h-12 object-contain opacity-80" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Smart Watch Elite</h4>
                                        <p className="text-gray-500 font-bold">$299.00</p>
                                    </div>
                                </div>
                                <button className="w-full h-12 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all">
                                    <ShoppingCart className="w-4 h-4" />
                                    Buy via WhatsApp
                                </button>
                            </motion.div>

                        </div>

                        {/* Decorative Background for visual */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[var(--color-primary)]/5 rounded-full blur-[100px] -z-10" />
                    </div>

                    {/* Text Content Area */}
                    <div className="flex-1 order-1 lg:order-2 space-y-10">
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-[var(--color-primary)] font-black text-sm uppercase tracking-[0.2em]"
                            >
                                AI Sales Assistant
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]"
                            >
                                An Expert Salesperson <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600"> That Never Sleeps.</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-lg lg:text-xl text-gray-500 leading-relaxed max-w-xl"
                            >
                                Our AI Assistant understands your products, answers customer questions instantly, and closes sales on WhatsApp and Google 24/7.
                            </motion.p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {[
                                { title: "Smart Catalog Knowledge", desc: "Knows every detail, variant, and stock level of your inventory." },
                                { title: "Natural Conversations", desc: "Talks like a human, understands context and customer intent." },
                                { title: "Direct Checkout", desc: "Guides customers to checkout links directly within the chat." },
                                { title: "Multi-Channel Support", desc: "Consistent sales experience across WhatsApp, Google, and Web." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                                    className="space-y-2"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <h4 className="font-black text-gray-900 text-sm italic">{item.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed pl-8">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
