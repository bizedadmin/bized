"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import OmnichannelAnimation from "@/components/landing/OmnichannelAnimation";
import {
  ArrowRight,
  Play
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden pb-20 selection:bg-emerald-500/30 flex flex-col">

      {/* GLOBAL GRID BACKGROUND */}
      <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
      <div className="fixed inset-0 h-full w-full bg-[radial-gradient(circle_800px_at_50%_-30%,#10b98115,transparent)] pointer-events-none -z-10" />

      <Navbar />

      {/* HERO SECTION - Split Layout - The main focus of the page now */}
      <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-48 px-6 flex-grow flex items-center">
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

            {/* Left side: Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="flex-1 text-center lg:text-left z-20"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 backdrop-blur-md border border-border text-secondary-foreground text-sm font-medium mb-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="opacity-80">{t("hero.tagline")}</span>
                <span className="w-px h-3 bg-border mx-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline decoration-2 underline-offset-4">See what's new</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8 leading-[0.95] max-w-3xl">
                {t("hero.title_1")} <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/60">
                  {t("hero.title_span")}
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                {t("hero.description")}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <button className="group w-full sm:w-auto px-8 py-4 rounded-full bg-foreground text-background font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-emerald-900/10 active:scale-95">
                    {t("hero.btn_trial")}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="#demo" className="w-full sm:w-auto">
                  <button className="group w-full sm:w-auto px-8 py-4 rounded-full bg-background border border-border text-foreground font-semibold text-lg hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 active:scale-95">
                    <Play className="w-4 h-4 fill-current opacity-60" />
                    {t("hero.btn_demo")}
                  </button>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div variants={fadeInUp} className="mt-16 pt-8 border-t border-border/40 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-medium">Trusted by 2,000+ entrepreneurs</p>
              </motion.div>
            </motion.div>

            {/* Right side: The Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex-1 w-full max-w-[600px] h-[500px] lg:h-[600px] relative flex items-center justify-center"
            >
              <div className="absolute inset-0 scale-75 md:scale-100 lg:scale-110">
                <OmnichannelAnimation />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
