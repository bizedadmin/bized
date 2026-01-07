
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32 bg-white dark:bg-black">

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-6 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                                {t("hero.tagline")}
                            </span>
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 mb-6 dark:text-white leading-[1.1]">
                                {t("hero.title_1")}{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                                    {t("hero.title_span")}
                                </span>{" "}
                                {t("hero.title_2")}
                            </h1>
                            <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto lg:mx-0 dark:text-zinc-400 leading-relaxed">
                                {t("hero.description")}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2 group">
                                    {t("hero.btn_trial")}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 rounded-2xl font-bold text-lg border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                                        <Play size={16} fill="currentColor" />
                                    </span>
                                    {t("hero.btn_demo")}
                                </button>
                            </div>

                            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6">
                                {[
                                    t("hero.check_1"),
                                    t("hero.check_2"),
                                    t("hero.check_3"),
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="flex-1 relative"
                    >
                        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-900">
                            <Image
                                src="/hero-dashboard.png"
                                alt="Business Operating System Dashboard"
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
