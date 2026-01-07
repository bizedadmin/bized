"use client";

import React from "react";
import { motion } from "framer-motion";
import { Hammer, BarChart3, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const Process = () => {
    const { t } = useLanguage();

    const steps = [
        {
            id: "01",
            title: "Build your presence",
            description: "Create a professional website in minutes with our drag-and-drop builder. No coding required.",
            icon: Hammer,
            color: "bg-blue-500",
        },
        {
            id: "02",
            title: "Manage operations",
            description: "Track orders, schedule appointments, and manage inventory from a single, intuitive dashboard.",
            icon: BarChart3,
            color: "bg-indigo-500",
        },
        {
            id: "03",
            title: "Get paid instantly",
            description: "Accept payments globally with automated invoicing and zero-hassle financial reconciliation.",
            icon: Wallet,
            color: "bg-emerald-500",
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-black overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-4">How it Works</h2>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6">
                        From idea to empire in 3 steps.
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200 dark:from-blue-900 dark:via-indigo-900 dark:to-emerald-900" />

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.2 }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            <div className={`w-24 h-24 rounded-3xl ${step.color} shadow-2xl shadow-${step.color}/30 flex items-center justify-center mb-8 relative z-10 text-white transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                <step.icon size={40} />
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-500">
                                    {step.id}
                                </div>
                            </div>
                            <h4 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                                {step.title}
                            </h4>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Process;
