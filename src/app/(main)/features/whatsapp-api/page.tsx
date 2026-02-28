"use client";

import { Button } from "@/components/ui/Button";
import { ArrowLeft, Megaphone, Users, Bot, MousePointerClick, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function WhatsAppApiPage() {
    const features = [
        {
            title: "Broadcast Campaigns",
            description: "Reach thousands of customers instantly. Send promotional messages, newsletters, and updates with high open rates.",
            icon: <Megaphone className="w-8 h-8" />,
            className: "lg:col-span-2 lg:row-span-2 bg-blue-50 border-blue-200",
            iconBg: "bg-blue-600 text-white",
        },
        {
            title: "Multi-Agent Inbox",
            description: "One number, multiple agents. Assign chats to your team, use saved replies, and tag conversations for better organization.",
            icon: <Users className="w-6 h-6" />,
            className: "lg:col-span-2",
            iconBg: "bg-indigo-100 text-indigo-600",
        },
        {
            title: "Automated Chatbots",
            description: "24/7 support. Build flows to answer FAQs, qualify leads, and route complex queries to human agents.",
            icon: <Bot className="w-6 h-6" />,
            className: "lg:col-span-1 lg:row-span-2",
            iconBg: "bg-violet-100 text-violet-600",
        },
        {
            title: "Interactive Messages",
            description: "Go beyond text. Use list messages, reply buttons, and product catalogs to drive engagement.",
            icon: <MousePointerClick className="w-6 h-6" />,
            className: "lg:col-span-1",
            iconBg: "bg-sky-100 text-sky-600",
        },
        {
            title: "Analytics & Insights",
            description: "Track performance. Monitor message delivery, open rates, and conversion metrics to optimize your campaigns.",
            icon: <BarChart3 className="w-6 h-6" />,
            className: "lg:col-span-2",
            iconBg: "bg-cyan-100 text-cyan-600",
        },
    ];

    return (
        <main className="min-h-screen bg-[var(--color-surface-container-low)] px-4 py-8">
            <div className="container max-w-6xl mx-auto space-y-12">
                <Link href="/">
                    <Button variant="text" className="pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <div className="space-y-6 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-[var(--color-on-surface)]"
                    >
                        WhatsApp Business API
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-[var(--color-on-surface)]/80 leading-relaxed max-w-3xl"
                    >
                        Scale with official power. Verified branding, automated templates, and multi-agent support for total client control.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(feature.className, "h-full")}
                        >
                            <Card className="h-full flex flex-col justify-between p-8 hover:shadow-xl transition-all duration-300 bg-[var(--color-surface-container)] border-[var(--color-outline-variant)]/20 hover:scale-[1.02]">
                                <div className="space-y-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", feature.iconBg)}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--color-on-surface)]">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[var(--color-on-surface)]/70 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
