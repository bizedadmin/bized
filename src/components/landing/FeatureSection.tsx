"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface FeatureSectionProps {
    label?: string;
    title: string;
    description: string;
    features?: string[];
    image: React.ReactNode;
    reverse?: boolean;
    bg?: "white" | "slate";
}

export function FeatureSection({
    label,
    title,
    description,
    features,
    image,
    reverse = false,
    bg = "white"
}: FeatureSectionProps) {
    return (
        <section className={cn(
            "py-24 px-4 overflow-hidden",
            bg === "white" ? "bg-white" : "bg-slate-50/50"
        )}>
            <div className="container max-w-7xl mx-auto">
                <div className={cn(
                    "flex flex-col lg:flex-row items-center gap-16 lg:gap-24",
                    reverse ? "lg:flex-row-reverse" : ""
                )}>
                    {/* Text Content */}
                    <div className="flex-1 space-y-8">
                        {label && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full"
                            >
                                {label}
                            </motion.span>
                        )}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight"
                        >
                            {title}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed"
                        >
                            {description}
                        </motion.p>

                        {features && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="space-y-4 pt-4"
                            >
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-lg font-bold text-slate-700">{feature}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Visual Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex-1 w-full"
                    >
                        {image}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
