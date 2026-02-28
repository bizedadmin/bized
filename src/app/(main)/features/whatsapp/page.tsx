"use client";

import { Button } from "@/components/ui/Button";
import { ArrowLeft, MessageSquare, Megaphone, RefreshCw, Users, CreditCard, Bot, ArrowRight, Star, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function WhatsAppPage() {
    const features = [
        {
            title: "WhatsApp Booking",
            description: "Let customers book appointments and services directly within WhatsApp. Automated reminders reduce no-shows.",
            icon: <Calendar className="w-6 h-6" />,
            color: "rose",
        },
        {
            title: "Automated Order Flow",
            description: "A chatbot-like experience that guides customers through selecting items, customizing orders, and checking out—all within WhatsApp.",
            icon: <MessageSquare className="w-6 h-6" />,
            color: "green",
        },
        {
            title: "Broadcast Campaigns",
            description: "Reach thousands of customers instantly. Send promotional messages, newsletters, and updates with high open rates.",
            icon: <Megaphone className="w-6 h-6" />,
            color: "blue",
        },
        {
            title: "Catalog Sync",
            description: "Automatically share your live product catalog in the chat. Updates instantly when you change prices or stock.",
            icon: <RefreshCw className="w-6 h-6" />,
            color: "teal",
        },
        {
            title: "Multi-Agent Inbox",
            description: "One number, multiple agents. Assign chats to your team, use saved replies, and tag conversations for better organization.",
            icon: <Users className="w-6 h-6" />,
            color: "indigo",
        },
        {
            title: "Instant Payments",
            description: "Send secure payment links directly in the chat. Supports mobile money, credit cards, Apple Pay, and Google Pay.",
            icon: <CreditCard className="w-6 h-6" />,
            color: "emerald",
        },
        {
            title: "Automated Chatbots",
            description: "24/7 support. Build flows to answer FAQs, qualify leads, and route complex queries to human agents.",
            icon: <Bot className="w-6 h-6" />,
            color: "violet",
        },
        {
            title: "Customer Reviews",
            description: "Collect and showcase customer reviews directly from WhatsApp. Build trust with verified feedback.",
            icon: <Star className="w-6 h-6" />,
            color: "amber",
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string, text: string, gradient: string }> = {
            green: { bg: "bg-green-100", text: "text-green-600", gradient: "from-green-50 to-green-100" },
            blue: { bg: "bg-blue-100", text: "text-blue-600", gradient: "from-blue-50 to-blue-100" },
            teal: { bg: "bg-teal-100", text: "text-teal-600", gradient: "from-teal-50 to-teal-100" },
            indigo: { bg: "bg-indigo-100", text: "text-indigo-600", gradient: "from-indigo-50 to-indigo-100" },
            emerald: { bg: "bg-emerald-100", text: "text-emerald-600", gradient: "from-emerald-50 to-emerald-100" },
            violet: { bg: "bg-violet-100", text: "text-violet-600", gradient: "from-violet-50 to-violet-100" },
            amber: { bg: "bg-amber-100", text: "text-amber-600", gradient: "from-amber-50 to-amber-100" },
            // Fallbacks
            purple: { bg: "bg-purple-100", text: "text-purple-600", gradient: "from-purple-50 to-purple-100" },
            orange: { bg: "bg-orange-100", text: "text-orange-600", gradient: "from-orange-50 to-orange-100" },
            rose: { bg: "bg-rose-100", text: "text-rose-600", gradient: "from-rose-50 to-rose-100" },
        };
        return colors[color] || colors.green;
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
                            WhatsApp Integrated
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-[var(--color-on-surface)]/70 leading-relaxed"
                        >
                            Turn chats into carts. Scale your business with powerful automation, multi-agent support, and verified branding.
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
