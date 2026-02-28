"use client";

import { motion } from "framer-motion";
import { Calendar, Grid, MessageCircle, Layers, CreditCard, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Online Booking",
        description: "Automated scheduling for your services. Let customers book appointments 24/7 without the back-and-forth.",
        icon: Calendar,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        title: "Sell Everywhere",
        description: "One unified profile to showcase products and services across Google and WhatsApp instantly. Update once, publish everywhere.",
        icon: Grid,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
    },
    {
        title: "Chat Orders",
        description: "Take orders and payments directly via WhatsApp and Google. Frictionless for customers.",
        icon: MessageCircle,
        color: "text-green-600",
        bg: "bg-green-50",
    },
    {
        title: "Sync Inventory",
        description: "Manage inventory in one place and have it automatically updated across all channels. Prevent overselling instantly.",
        icon: Layers,
        color: "text-orange-600",
        bg: "bg-orange-50",
    },
    {
        title: "Insta-Pay",
        description: "Accept payments instantly via secure links or QR codes. Seamless checkout experience.",
        icon: CreditCard,
        color: "text-purple-600",
        bg: "bg-purple-50",
    },
];

export function ModernFeatureGrid() {
    return (
        <section className="py-24 px-4 bg-white">
            <div className="container max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight"
                    >
                        Everything you need to grow
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500 font-medium max-w-2xl mx-auto"
                    >
                        Powerful tools to manage your digital presence, simplified for modern business.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={cn(
                                "group p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300",
                                i < 2 ? "lg:col-span-3" : "lg:col-span-2"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                                feature.bg,
                                feature.color
                            )}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {feature.description}
                            </p>
                            {i === 2 && (
                                <div className="mt-6 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-green-600" />
                                    <Globe className="w-4 h-4 text-blue-600" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
