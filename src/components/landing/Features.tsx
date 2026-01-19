
"use client";

import React from "react";
import {
    Banknote,
    FileText,
    Receipt,
    ArrowUpRight,
    Globe,
    Calendar,
    ShoppingCart,
    ShoppingBag,
    Truck,
    CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const Features = () => {
    const { t } = useLanguage();

    const features = [
        {
            title: t("features.items.website.title"),
            description: t("features.items.website.desc"),
            icon: Globe,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
        },
        {
            title: t("features.items.appointments.title"),
            description: t("features.items.appointments.desc"),
            icon: Calendar,
            color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
        },
        {
            title: t("features.items.checkout.title"),
            description: t("features.items.checkout.desc"),
            icon: ShoppingCart,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
        },
        {
            title: t("features.items.orders.title"),
            description: t("features.items.orders.desc"),
            icon: ShoppingBag,
            color: "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
        },
        {
            title: t("features.items.fulfillment.title"),
            description: t("features.items.fulfillment.desc"),
            icon: Truck,
            color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
        },
        {
            title: t("features.items.invoices.title"),
            description: t("features.items.invoices.desc"),
            icon: FileText,
            color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400",
        },
        {
            title: t("features.items.expenses.title"),
            description: t("features.items.expenses.desc"),
            icon: Receipt,
            color: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
        },
        {
            title: t("features.items.payments.title"),
            description: t("features.items.payments.desc"),
            icon: CreditCard,
            color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
        }
    ];

    return (
        <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-4 text-center">{t("features.tagline")}</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6 text-center">
                            {t("features.title")}
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed text-center">
                            {t("features.description")}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon size={28} />
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                                {feature.title}
                            </h4>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm min-h-[3rem]">
                                {feature.description}
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-indigo-600 font-semibold text-sm cursor-pointer hover:gap-3 transition-all">
                                {t("features.learn_more")} <ArrowUpRight size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
