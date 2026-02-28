"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe, MessageCircle, Zap, MapPin, Phone, Calendar, Search, QrCode, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ModernHero() {
    return (
        <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-white">
            <div className="container max-w-7xl mx-auto relative z-10">
                {/* Centered Content */}
                <div className="text-center space-y-8 max-w-4xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest"
                    >
                        <Zap className="w-3 h-3 fill-current" />
                        The Unified Business Profile
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05]"
                    >
                        Start your online store. <br />
                        <span className="text-slate-800">Sell on Google and WhatsApp</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        Accept bookings, orders, engage with your customers and grow your
                        business directly through Google and WhatsApp
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/portfolio/claim">
                            <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20">
                                Build your store
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Button variant="secondary" size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl border-2 border-slate-100 bg-white text-slate-600 hover:bg-slate-50">
                            Explore
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                </div>

                {/* Phone Mockup with Corner Bistro */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative max-w-[700px] mx-auto mt-20"
                >
                    {/* Phone Frame */}
                    <div className="relative z-10 w-[290px] md:w-[340px] mx-auto rounded-[3.5rem] border-[12px] border-[#e8e8e8] shadow-[0_40px_80px_rgba(0,0,0,0.15)] overflow-hidden bg-white"
                        style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.12), inset 0 0 0 2px rgba(255,255,255,0.8)" }}>
                        {/* Notch */}
                        <div className="w-full flex justify-center pt-3 pb-2 bg-white">
                            <div className="w-28 h-6 bg-[#e8e8e8] rounded-full" />
                        </div>

                        {/* Screen Content */}
                        <div className="w-full bg-white px-5 pb-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center pt-2 pb-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl mb-3"
                                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                                    C
                                </div>
                                <h2 className="text-lg font-black text-slate-900 leading-tight">Corner Bistro</h2>
                                <p className="text-sm text-slate-400 font-medium mt-0.5">Artisan Coffee &amp; Bakery</p>

                                {/* Stars */}
                                <div className="flex items-center gap-1 mt-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                                    <span className="text-xs text-slate-400 font-medium ml-1">(120+ Reviews)</span>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex gap-3 mt-4 w-full">
                                    <button className="flex-1 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold">
                                        Follow
                                    </button>
                                    <button className="flex-1 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-full text-sm font-bold">
                                        Message
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 pb-3">
                                {/* Action Icons */}
                                <div className="flex justify-around">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Call</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Chat</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-red-400" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Map</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Book</span>
                                    </div>
                                </div>
                            </div>

                            {/* Popular Items */}
                            <div className="mt-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">Popular Items</p>
                                <div className="bg-amber-50 rounded-2xl p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                                        ☕
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 leading-tight">Latte Art Series</p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate">Freshly roasted beans with creamy...</p>
                                    </div>
                                    <span className="text-sm font-black text-blue-600 flex-shrink-0">$4.50</span>
                                </div>
                            </div>

                            {/* Bottom Nav */}
                            <div className="flex justify-around items-center mt-5 pt-4 border-t border-slate-100">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    {/* Layers icon */}
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600 fill-none stroke-current stroke-2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <Search className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <QrCode className="w-5 h-5 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==== Floating Notification Cards ==== */}

                    {/* Top Left: New Booking from Google */}
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="absolute -left-4 md:-left-16 top-16 w-52 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-3.5 flex items-center gap-3"
                        style={{ animation: "float1 4s ease-in-out infinite" }}
                    >
                        {/* Google G logo */}
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <svg viewBox="0 0 48 48" className="w-7 h-7">
                                <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                                <path fill="#34A853" d="M6.3 14.7l6.6 4.9C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.6 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z" />
                                <path fill="#FBBC05" d="M24 44c5.2 0 9.9-1.9 13.4-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.6 5.1C9.7 39.5 16.3 44 24 44z" />
                                <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.8l6.2 5.2C40.3 35.9 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 leading-none mb-0.5">New Booking</p>
                            <p className="text-sm font-black text-slate-900">Haircut @ 2PM</p>
                        </div>
                    </motion.div>

                    {/* Top Right: WhatsApp message */}
                    <motion.div
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                        className="absolute -right-4 md:-right-20 top-32 w-52 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-3.5 flex items-center gap-3"
                        style={{ animation: "float2 5s ease-in-out infinite" }}
                    >
                        {/* WhatsApp logo */}
                        <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white">
                                <path d="M16 2C8.268 2 2 8.268 2 16c0 2.516.656 4.877 1.806 6.926L2 30l7.294-1.77A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.45 11.45 0 01-5.832-1.596l-.42-.25-4.33 1.05 1.08-4.22-.276-.434A11.452 11.452 0 014.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.55c-.345-.172-2.046-1.01-2.364-1.125-.317-.115-.548-.172-.778.172-.23.344-.892 1.125-1.094 1.355-.2.23-.402.258-.747.086-.345-.172-1.454-.536-2.769-1.71-1.023-.912-1.714-2.038-1.916-2.383-.2-.345-.021-.531.151-.703.155-.154.345-.402.517-.603.172-.2.23-.344.345-.574.115-.23.057-.43-.028-.603-.086-.172-.779-1.876-1.066-2.568-.281-.674-.567-.582-.778-.593l-.663-.01c-.23 0-.603.086-.92.43s-1.207 1.18-1.207 2.878 1.236 3.337 1.408 3.567c.172.23 2.432 3.71 5.892 5.203.823.355 1.465.567 1.965.726.826.263 1.579.226 2.172.137.662-.099 2.046-.836 2.334-1.642.287-.806.287-1.497.2-1.642-.086-.145-.316-.23-.661-.402z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 leading-none mb-0.5">WhatsApp</p>
                            <p className="text-sm font-black text-slate-900">Hi, is this open?</p>
                        </div>
                    </motion.div>

                    {/* Bottom Right: Payment Received */}
                    <motion.div
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="absolute -right-4 md:-right-20 bottom-24 w-52 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-3.5 flex items-center gap-3"
                        style={{ animation: "float3 6s ease-in-out infinite" }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-black text-lg">S</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 leading-none mb-0.5">Payment Received</p>
                            <p className="text-sm font-black text-slate-900">$120.00</p>
                        </div>
                    </motion.div>

                    {/* Bottom Left: New Review */}
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        className="absolute -left-4 md:-left-16 bottom-16 w-44 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-3.5 flex items-center gap-3"
                        style={{ animation: "float4 4.5s ease-in-out infinite" }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 48 48" className="w-7 h-7">
                                <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                                <path fill="#34A853" d="M6.3 14.7l6.6 4.9C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.6 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z" />
                                <path fill="#FBBC05" d="M24 44c5.2 0 9.9-1.9 13.4-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.6 5.1C9.7 39.5 16.3 44 24 44z" />
                                <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.8l6.2 5.2C40.3 35.9 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 leading-none mb-1">New Review</p>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* CSS Animations */}
                    <style>{`
                        @keyframes float1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                        @keyframes float2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                        @keyframes float3 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
                        @keyframes float4 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
                    `}</style>
                </motion.div>

                {/* Trust Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-48 pt-10 border-t border-slate-50"
                >
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Works Seamlessly With</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-60">
                        <div className="flex items-center gap-2 font-bold text-slate-900"><Globe className="w-5 h-5" /> Google Search</div>
                        <div className="flex items-center gap-2 font-bold text-slate-900"><MapPin className="w-5 h-5" /> Google Maps</div>
                        <div className="flex items-center gap-2 font-bold text-slate-900"><MessageCircle className="w-5 h-5" /> WhatsApp Business</div>
                        <div className="flex items-center gap-2 font-bold text-slate-900"><Zap className="w-5 h-5" /> Instant Setup</div>
                    </div>
                </motion.div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-50/50 rounded-full blur-[100px]" />
            </div>
        </section>
    );
}
