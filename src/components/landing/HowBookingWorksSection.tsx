"use client";

import { motion } from "framer-motion";
import { QrCode, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
    {
        title: "Connect",
        description: "Clients click your 'Book Now' link or scan a QR code to open your WhatsApp business profile.",
        icon: <QrCode className="w-8 h-8" />,
        color: "bg-indigo-100 text-indigo-600",
    },
    {
        title: "Schedule",
        description: "They choose a service and select an available time slot from your real-time calendar.",
        icon: <Calendar className="w-8 h-8" />,
        color: "bg-orange-100 text-orange-600",
    },
    {
        title: "Confirm",
        description: "Instant confirmation is sent, with automated reminders before the appointment.",
        icon: <CheckCircle2 className="w-8 h-8" />,
        color: "bg-teal-100 text-teal-600",
    },
];

export function HowBookingWorksSection() {
    return (
        <section className="py-24 px-4 bg-[var(--color-surface-container)] overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            <div className="container max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-[var(--color-on-surface)]"
                    >
                        How WhatsApp Booking Works
                    </motion.h2>
                    <p className="text-lg text-[var(--color-on-surface)]/70 max-w-2xl mx-auto">
                        Turn conversations into appointments with a seamless 3-step flow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[20%] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[var(--color-outline-variant)]/20 via-[var(--color-outline-variant)]/50 to-[var(--color-outline-variant)]/20 -z-10" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md bg-[var(--color-surface-container-low)]",
                            )}>
                                <div className={cn("p-3 rounded-xl", step.color)}>
                                    {step.icon}
                                </div>
                            </div>

                            <div className="relative">
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-9xl font-bold text-[var(--color-on-surface)]/5 select-none -z-10">
                                    {index + 1}
                                </span>
                                <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-3">{step.title}</h3>
                                <p className="text-[var(--color-on-surface)]/70 leading-relaxed max-w-xs mx-auto">
                                    {step.description}
                                </p>
                            </div>

                            {/* Mobile Arrow */}
                            {index < steps.length - 1 && (
                                <div className="md:hidden mt-8 text-[var(--color-outline-variant)]">
                                    <ArrowRight className="w-6 h-6 animate-bounce opacity-50" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
