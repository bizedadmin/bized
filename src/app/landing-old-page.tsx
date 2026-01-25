"use client";
import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Hero } from "@/components/landing/Hero";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-primary/30 flex flex-col relative">

      {/* GLOBAL GRID BACKGROUND + LIQUID LAYERS */}
      <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-20" />

      {/* Moving Organic Blobs (Optimized for Mobile) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] md:w-[50vw] h-[70vw] md:h-[50vw] bg-primary/5 rounded-full blur-[60px] md:blur-[100px] animate-pulse md:animate-[blob-bounce_20s_infinite_alternate]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-blue-500/5 rounded-full blur-[60px] md:blur-[100px] animate-pulse md:animate-[blob-bounce_25s_infinite_alternate-reverse]" />
        <div className="absolute top-[40%] left-[30%] w-[40vw] md:w-[30vw] h-[40vw] md:h-[30vw] bg-indigo-500/5 rounded-full blur-[60px] md:blur-[100px] md:animate-[blob-bounce_18s_infinite_linear]" />
      </div>

      <Navbar />

      <Hero />

      <FinalCTA />

      <Footer />

      {/* MOBILE BOTTOM NAV - App-like experience */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div
          className="bg-zinc-900/95 dark:bg-zinc-100/95 backdrop-blur-2xl border border-white/10 dark:border-black/10 rounded-3xl p-2.5 flex items-center justify-between shadow-2xl"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Link href="/login" className="flex-1 text-center py-3 text-sm font-black text-zinc-400 dark:text-zinc-500 hover:text-primary dark:hover:text-primary transition-colors">
            {t("navbar.signin")}
          </Link>
          <div className="w-px h-8 bg-white/10 dark:bg-black/10 mx-2" />
          <Link href="/register" className="flex-[2.5]">
            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary/20 active:scale-[0.96]">
              {t("navbar.getstarted")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
