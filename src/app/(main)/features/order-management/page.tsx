"use client";

import { Button } from "@/components/ui/Button";
import { ArrowLeft, LayoutDashboard, CreditCard, ClipboardCheck, Package, Truck, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function OrderManagementPage() {
    const features = [
        {
            title: "Centralized Command Center",
            description: "The engine of your business. View orders from your website, WhatsApp, and manual entry in one unified dashboard.",
            icon: <LayoutDashboard className="w-6 h-6" />,
            color: "blue",
        },
        {
            title: "Universal Inventory Sync",
            description: "Never oversell. Stock levels automatically update across your Online Store and WhatsApp Catalog in real-time.",
            icon: <Package className="w-6 h-6" />,
            color: "teal",
        },
        {
            title: "Integrated Local Payments",
            description: "Accept Mobile Money and Cards. Payments are automatically linked to orders, reconciling your accounts instantly.",
            icon: <CreditCard className="w-6 h-6" />,
            color: "emerald",
        },
        {
            title: "Smart Fulfillment Workflows",
            description: "Pick, pack, and ship with precision. Custom status tags and packing slips ensure every order is accurate.",
            icon: <ClipboardCheck className="w-6 h-6" />,
            color: "indigo",
        },
        {
            title: "Delivery Logistics",
            description: "One-click dispatch. Connect immediately with local courier partners to send riders to your pickup point.",
            icon: <Truck className="w-6 h-6" />,
            color: "orange",
        },
        {
            title: "Customer CRM",
            description: "Know your customers. Track order history, lifetime value, and notes to provide personalized VIP service.",
            icon: <Users className="w-6 h-6" />,
            color: "violet",
        },
        {
            title: "Business Intelligence",
            description: "Make data-driven decisions. Visual reports on sales, top products, and customer growth help you scale faster.",
            icon: <TrendingUp className="w-6 h-6" />,
            color: "rose",
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string, text: string, gradient: string }> = {
            blue: { bg: "bg-blue-100", text: "text-blue-600", gradient: "from-blue-50 to-blue-100" },
            teal: { bg: "bg-teal-100", text: "text-teal-600", gradient: "from-teal-50 to-teal-100" },
            emerald: { bg: "bg-emerald-100", text: "text-emerald-600", gradient: "from-emerald-50 to-emerald-100" },
            indigo: { bg: "bg-indigo-100", text: "text-indigo-600", gradient: "from-indigo-50 to-indigo-100" },
            orange: { bg: "bg-orange-100", text: "text-orange-600", gradient: "from-orange-50 to-orange-100" },
            violet: { bg: "bg-violet-100", text: "text-violet-600", gradient: "from-violet-50 to-violet-100" },
            rose: { bg: "bg-rose-100", text: "text-rose-600", gradient: "from-rose-50 to-rose-100" },
            // Fallbacks
            purple: { bg: "bg-purple-100", text: "text-purple-600", gradient: "from-purple-50 to-purple-100" },
            green: { bg: "bg-green-100", text: "text-green-600", gradient: "from-green-50 to-green-100" },
            amber: { bg: "bg-amber-100", text: "text-amber-600", gradient: "from-amber-50 to-amber-100" },
        };
        return colors[color] || colors.blue;
    };

    return (
        <main className="min-h-screen bg-[var(--color-surface-container-low)]">
            {/* Header / Hero for Page */}
            <div className="pt-8 px-4 pb-16 lg:pt-12 lg:pb-24">
                <div className="container max-w-6xl mx-auto">
                    <Link href="/">
                        <Button variant="text" className="pl-0 hover:pl-2 transition-all mb-8 text-[var(--color-on-surface)]/60">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>

                    <div className="max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-[var(--color-on-surface)] mb-6 tracking-tight"
                        >
                            The Engine of Your Business
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-[var(--color-on-surface)]/70 leading-relaxed"
                        >
                            More than just payments. A complete operating system to manage orders, inventory, logistics, and customers in one place.
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Feature List */}
            <div className="container max-w-6xl mx-auto px-4 pb-24 space-y-24 lg:space-y-32">
                {features.map((feature, index) => {
                    const isEven = index % 2 === 0;
                    const colors = getColorClasses(feature.color);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
                            className={cn(
                                "flex flex-col lg:flex-row items-center gap-12 lg:gap-24",
                                !isEven && "lg:flex-row-reverse"
                            )}
                        >
                            {/* Text Content */}
                            <div className="flex-1 space-y-6 text-center lg:text-left">
                                <div className={cn("inline-flex items-center justify-center p-3 rounded-2xl w-fit mx-auto lg:mx-0", colors.bg, colors.text)}>
                                    {feature.icon}
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-on-surface)]">
                                    {feature.title}
                                </h2>
                                <p className="text-lg text-[var(--color-on-surface)]/70 leading-relaxed">
                                    {feature.description}
                                </p>
                                <Button variant="text" className={cn("px-0 text-base hover:bg-transparent", colors.text)}>
                                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            {/* Visual Placeholder */}
                            <div className="flex-1 w-full">
                                <div className={cn(
                                    "aspect-[4/3] rounded-[32px] w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br border border-[var(--color-outline-variant)]/10 shadow-lg",
                                    colors.gradient
                                )}>
                                    {/* Abstract Pattern */}
                                    <div className={cn("absolute inset-0 opacity-10", colors.text)}>
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <circle cx="0" cy="100" r="50" fill="currentColor" />
                                            <circle cx="100" cy="0" r="30" fill="currentColor" />
                                        </svg>
                                    </div>

                                    {/* Mock UI Card representing the feature */}
                                    <div className="relative z-10 bg-[var(--color-surface)]/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-[var(--color-outline-variant)]/10 max-w-[280px] w-full transform transition-transform duration-500 hover:scale-105">
                                        <div className="w-full h-2 rounded-full bg-[var(--color-on-surface)]/10 mb-4" />
                                        <div className="w-3/4 h-2 rounded-full bg-[var(--color-on-surface)]/10 mb-8" />
                                        <div className="flex gap-4">
                                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", colors.bg, colors.text)}>
                                                {feature.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="w-full h-2 rounded-full bg-[var(--color-on-surface)]/10 mb-2" />
                                                <div className="w-1/2 h-2 rounded-full bg-[var(--color-on-surface)]/10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </main>
    );
}
