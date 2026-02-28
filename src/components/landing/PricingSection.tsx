"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const pricingTiers = [
    {
        name: "Starter",
        price: "Free",
        description: "Perfect for testing the waters.",
        features: [
            "Online Store",
            "Unlimited Products",
            "Order Management & Payments",
            "WhatsApp Ordering",
            "Basic Analytics",
        ],
        cta: "Start for Free",
        popular: false,
    },
    {
        name: "Growth",
        price: "$29",
        period: "/month",
        description: "Everything you need to grow your business.",
        features: [
            "Everything in Starter",
            "Custom Domain",
            "Priority Support",
            "Advanced Analytics",
            "Removal of Bized Branding",
        ],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Scale",
        price: "$79",
        period: "/month",
        description: "Advanced features for scaling businesses.",
        features: [
            "Everything in Growth",
            "WhatsApp Business API",
            "Multi-Agent Support",
            "Dedicated Account Manager",
            "API Access",
        ],
        cta: "Contact Sales",
        popular: false,
    },
];

export function PricingSection() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section id="pricing" className="py-20 px-4 bg-[var(--color-surface-container)]">
            <div className="container max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-[var(--color-on-surface)]">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-[var(--color-on-surface)]/70 max-w-2xl mx-auto">
                        Choose the plan that's right for your business. No hidden fees.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={cn("text-sm font-medium transition-colors", !isYearly ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface)]/50")}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative w-12 h-6 rounded-full bg-[var(--color-surface-container-highest)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        >
                            <motion.div
                                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[var(--color-primary)]"
                                animate={{ x: isYearly ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={cn("text-sm font-medium transition-colors", isYearly ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface)]/50")}>
                            Yearly <span className="text-[var(--color-primary)] text-xs ml-1">(Save 20%)</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={cn(
                                "relative p-8 rounded-3xl border flex flex-col h-full bg-[var(--color-surface-container-low)]",
                                tier.popular ? "border-[var(--color-primary)] shadow-xl scale-105 z-10" : "border-[var(--color-outline-variant)]/20 shadow-sm"
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-[var(--color-on-surface)]/70 mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-[var(--color-on-surface)]">{tier.price}</span>
                                    {tier.period && <span className="text-[var(--color-on-surface)]/50">{tier.period}</span>}
                                </div>
                                <p className="mt-4 text-sm text-[var(--color-on-surface)]/70">{tier.description}</p>
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-3">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-on-surface)]/80">
                                            <Check className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                variant={tier.popular ? "primary" : "secondary"}
                                className="w-full justify-center"
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
