"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const FinalCTA = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Enforce a small timeout to ensure it runs after mount paint if strictly needed, 
        // or just accept it runs on mount. 
        // The lint error warns about synchronous set state, which is valid for mount effects but can trigger re-renders.
        // We can wrap in requestAnimationFrame or similar to decouple.
        const timer = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(timer);
    }, []);

    // Prevent hydration mismatch and reference errors on mobile by only rendering animations after mount
    if (!mounted) {
        return (
            <section className="relative py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 -z-10" />
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                            Ready to scale your business?
                        </h2>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto opacity-70">
                            Join 2,000+ entrepreneurs using Bized to simplify their operations and increase revenue.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-blue-600 text-white font-black text-xl text-center">
                            Start Free Trial
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-32 px-6 overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -z-10" />
            <div className="max-w-4xl mx-auto text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                        Ready to scale your business?
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto opacity-70">
                        Join 2,000+ entrepreneurs using Bized to simplify their operations and increase revenue.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/register" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-primary text-primary-foreground font-black text-xl transition-all shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]">
                            Start Free Trial
                        </button>
                    </Link>
                    <Link href="#demo" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-background border border-border text-foreground font-bold text-xl hover:bg-muted/50 transition-all active:scale-[0.98]">
                            Book a Demo
                        </button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="pt-12 text-sm font-bold text-primary/60 flex items-center justify-center gap-8 uppercase tracking-[0.2em]"
                >
                    <span>No Credit Card Required</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                    <span>14-Day Free Trial</span>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;
