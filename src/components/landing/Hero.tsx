"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "./GlassCard";
import { LiquidGlass } from "./LiquidGlass";

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-32 md:pt-42 lg:pt-48 pb-20 px-6 md:px-12">
            {/* Background Auroras (Apple Liquid Glass Theme) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none opacity-50">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-[blob-bounce_10s_infinite_alternate]" />
                <div className="absolute bottom-1/2 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] animate-[blob-bounce_12s_infinite_alternate-reverse]" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                {/* Left Side: Content */}
                <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    className="md:col-span-1 lg:col-span-7 text-center lg:text-left relative z-20"
                >
                    {/* Label */}
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8"
                    >
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        Bized OS
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-8 text-foreground"
                    >
                        The All-in-One <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Client Portal</span> <br />
                        for Your Business.
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl md:text-2xl text-muted-foreground font-normal mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                    >
                        Get discovered on Google and Facebook, close deals via WhatsApp, and collect payments instantly. Launch your pro website and bio links in seconds—all from one powerful portal.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-16"
                    >
                        <Link href="/register" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                                Get Started for Free
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link href="#demo" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-secondary text-secondary-foreground border border-black/5 dark:border-white/10 font-bold text-lg hover:bg-secondary/80 transition-all active:scale-[0.98]">
                                Book a Demo
                            </button>
                        </Link>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-70 grayscale transition-all hover:grayscale-0">
                        <div className="flex items-center gap-2 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                            <Shield className="w-4 h-4 text-blue-600" /> Secure Payments
                        </div>
                        <div className="flex items-center gap-2 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                            <Zap className="w-4 h-4 text-orange-500" /> Instant Setup
                        </div>
                        <div className="flex items-center gap-2 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                            <Globe className="w-4 h-4 text-indigo-500" /> Global Reach
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Side: Visuals (Apple Style Glass) */}
                <div className="lg:col-span-5 relative h-[500px] lg:h-[700px] flex items-center justify-center">
                    {/* Central 3D Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full aspect-square"
                    >
                        <Image
                            src="/hero-apple.png"
                            alt="Bized Client Portal Interface"
                            fill
                            className="object-contain drop-shadow-[0_30px_60px_rgba(0,122,255,0.25)]"
                            priority
                        />

                        {/* Floating UI Elements (Liquid Glass) */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-5 -left-5 md:-top-10 md:-left-10 z-20 scale-75 md:scale-100"
                        >
                            <LiquidGlass className="p-4 border-blue-500/20" intensity="high">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                        <Globe className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-blue-600">Discoverable</p>
                                        <p className="text-sm font-semibold">Google Integrated</p>
                                    </div>
                                </div>
                            </LiquidGlass>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-5 -right-2 md:-bottom-10 md:-right-5 z-20 scale-75 md:scale-100"
                        >
                            <LiquidGlass className="p-4 border-blue-500/20" intensity="high">
                                <div className="flex items-center gap-3 text-right">
                                    <div className="order-2 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-blue-600">Sales</p>
                                        <p className="text-sm font-bold">Deal Closed!</p>
                                    </div>
                                </div>
                            </LiquidGlass>
                        </motion.div>
                    </motion.div>

                    {/* Background Grid Accent */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] -z-10" />
                </div>

            </div>
        </section>
    );
};

export default Hero;
