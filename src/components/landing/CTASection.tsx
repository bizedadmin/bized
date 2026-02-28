"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-32 px-4 bg-white overflow-hidden relative border-t border-slate-50">
            <div className="container max-w-4xl mx-auto text-center relative z-10 space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-24 h-24 bg-yellow-400 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl rotate-12"
                >
                    <Zap className="w-12 h-12 fill-current" />
                </motion.div>

                <div className="space-y-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight"
                    >
                        Ready to modernize <br />
                        your business?
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        Join thousands of businesses growing with Bized today.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center"
                >
                    <Button
                        size="lg"
                        className="h-16 px-12 text-xl font-bold rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-600/20 transition-all"
                    >
                        Build your store
                        <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
