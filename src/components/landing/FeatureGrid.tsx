"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Store, Calendar, MessageCircle, ClipboardList } from "lucide-react";

const features = [
    {
        title: "Online Store",
        desc: "Bring your catalog to the world. A native storefront that syncs with Google Merchant Center for maximum discovery.",
        icon: <Store className="w-6 h-6" />,
        href: "/features/online-store",
    },
    {
        title: "Schedule Everything",
        desc: "Bookings without the back-and-forth. A professional calendar that lets clients pick slots and pay instantly.",
        icon: <Calendar className="w-6 h-6" />,
        href: "/features/scheduling",
    },
    {
        title: "Order Management",
        desc: "Streamline your entire fulfillment process. Track orders, accept local payments, and manage deliveries from one dashboard.",
        icon: <ClipboardList className="w-6 h-6" />,
        href: "/features/order-management",
    },
    {
        title: "WhatsApp Integrated",
        desc: "Turn chats into carts. Let customers browse and buy natively within their favorite messaging app. Scale with verified branding and automated templates.",
        icon: <MessageCircle className="w-6 h-6" />,
        href: "/features/whatsapp",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { ease: [0.2, 0, 0, 1] as const, duration: 0.5 }
    },
};

import Link from "next/link";

export function FeatureGrid() {
    return (
        <section className="py-10 px-4 bg-[var(--color-surface-container-low)]">
            <div className="container max-w-6xl mx-auto">
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {features.map((feature, i) => (
                        <motion.div key={i} variants={item} className="h-full">
                            <Link href={feature.href} className="block h-full group">
                                <Card className="h-full flex flex-col items-start gap-4 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-[var(--color-primary)]/20">
                                    <div className="w-12 h-12 rounded-[12px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--color-on-surface)]">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-on-surface)]/70 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

