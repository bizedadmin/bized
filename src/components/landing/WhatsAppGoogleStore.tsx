"use client";

import { motion } from "framer-motion";
import { MessageCircle, Globe, Zap, ArrowUpRight, Share2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function WhatsAppGoogleStore() {
    return (
        <section className="py-24 px-4 bg-[var(--color-surface-container-low)] relative overflow-hidden">

            {/* Background patterns */}
            <div className="absolute right-0 top-0 w-1/2 h-full bg-[var(--color-primary)]/[0.02] -skew-x-12 translate-x-1/4" />

            <div className="container max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-[var(--color-primary)] font-black text-sm uppercase tracking-[0.2em]"
                    >
                        Zero Friction Selling
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight"
                    >
                        Your Store, Everywhere <br /> Your Customers Are.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg lg:text-xl text-gray-500 leading-relaxed font-medium"
                    >
                        Ditch the complex setup. Bized syncs your products instantly to the platforms that drive the most sales today.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch">

                    {/* WhatsApp Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl overflow-hidden"
                    >
                        <div className="relative z-10 h-full flex flex-col pt-20">
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-600 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                    <MessageCircle className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-3xl font-black text-gray-900">WhatsApp Commerce</h3>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                    Turn every chat into a checkout. Share your catalog, take orders, and provide AI-powered support natively inside WhatsApp.
                                </p>
                            </div>

                            <div className="mt-auto space-y-4">
                                {[
                                    "Native WhatsApp Catalog Sync",
                                    "Verified Business Branding",
                                    "Automated Order Updates",
                                    "One-Click Shopping Experience"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                            <Zap className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-10 border-t border-gray-50">
                                <Button variant="text" className="p-0 font-black text-green-600 flex items-center gap-2 text-lg hover:translate-x-2 transition-transform">
                                    Learn about WhatsApp Shop
                                    <ArrowUpRight className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Visual Decoration */}
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-500/5 rounded-full blur-[80px]" />
                    </motion.div>

                    {/* Google Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl overflow-hidden"
                    >
                        <div className="relative z-10 h-full flex flex-col pt-20">
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                    <Globe className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-3xl font-black text-gray-900">Google Shopping</h3>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                    Appear where your customers are searching. Your products are automatically listed and updated on Google Merchant Center for free.
                                </p>
                            </div>

                            <div className="mt-auto space-y-4">
                                {[
                                    "Automatic Merchant Center Link",
                                    "Real-time Inventory Updates",
                                    "Local Inventory Visibility",
                                    "SEO Optimized Storefront"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Zap className="w-3 h-3 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-10 border-t border-gray-50">
                                <Button variant="text" className="p-0 font-black text-blue-600 flex items-center gap-2 text-lg hover:translate-x-2 transition-transform">
                                    Explore Google Integration
                                    <ArrowUpRight className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Visual Decoration */}
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px]" />
                    </motion.div>

                </div>

                {/* Action Call for the whole section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 flex flex-col items-center gap-8"
                >
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-sm">
                                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                            </div>
                        ))}
                        <div className="w-14 h-14 rounded-full border-4 border-white bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-black shadow-sm">
                            +500
                        </div>
                    </div>
                    <p className="text-gray-500 font-bold text-center">
                        Join 2,500+ businesses selling more with <span className="text-gray-900">Bized Omnichannel</span>.
                    </p>
                    <Button size="lg" className="h-16 px-12 text-xl rounded-3xl shadow-2xl">
                        Launch Your Omnichannel Store
                        <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
