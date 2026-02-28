"use client";

import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const pricingTiers = [
    {
        name: "Starter",
        price: "$0",
        period: "/ month",
        description: "Everything you need to launch your business presence.",
        features: [
            "1 Business Hub",
            "Standard Mini-Store",
            "Basic WhatsApp Connect",
        ],
        cta: "Get Started",
        popular: false,
    },
    {
        name: "Pro Business",
        price: "$19",
        period: "/ month",
        description: "Advanced tools to automate and scale your operations.",
        features: [
            "Unlimited Hubs",
            "AI WhatsApp Automation",
            "Advanced Google Sync",
            "Multi-team Access",
        ],
        cta: "Upgrade to Pro",
        popular: true,
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 px-4 bg-slate-50/50">
            <div className="container max-w-5xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                        Simple, Growth-Driven Pricing
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Choose the plan that's right for your business. Grow with us as you scale.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={cn(
                                "relative p-10 rounded-[2.5rem] border flex flex-col h-full bg-white transition-all duration-300",
                                tier.popular ? "border-blue-600 shadow-2xl scale-105 z-10" : "border-slate-100 shadow-xl"
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-blue-600/30 z-20">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-10 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{tier.name}</h3>
                                <div className="flex items-baseline justify-center md:justify-start gap-1">
                                    <span className="text-5xl font-bold text-slate-900 tracking-tight">{tier.price}</span>
                                    <span className="text-slate-500 font-medium">{tier.period}</span>
                                </div>
                                <p className="mt-6 text-slate-600 font-medium leading-relaxed">{tier.description}</p>
                            </div>

                            <div className="flex-1 mb-10">
                                <ul className="space-y-4">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Check className="w-4 h-4 text-blue-600" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                className={cn(
                                    "w-full h-14 text-lg rounded-2xl font-bold",
                                    tier.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"
                                )}
                            >
                                {tier.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
