"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, ExternalLink, HelpCircle, Globe, Calendar, ShoppingBag, CreditCard, Briefcase, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />


      <main className="container mx-auto px-4 pt-32 pb-16">
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 md:mb-32">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 space-y-6 md:space-y-8 text-center md:text-left order-1 md:order-2"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-foreground"
            >
              Sell on <span className="text-[#25D366]">WhatsApp</span> — <br className="hidden md:block" />Effortlessly
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-6 mb-8 max-w-lg mx-auto md:mx-0"
            >
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                A smarter way to manage WhatsApp orders and grow revenue through better service.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Get discovered on <span className="font-semibold text-foreground">Google, Facebook, Instagram, and TikTok</span> — all from <span className="border-b-2 border-primary font-semibold text-foreground">one powerful link</span>.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link href="/register">
                <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center md:justify-start gap-2 mx-auto md:mx-0 transform hover:scale-105 duration-200">
                  <Plus size={18} />
                  Get Started
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full md:w-1/2 relative aspect-[4/3] max-h-[320px] order-2 md:order-1"
          >
            <div className="absolute inset-0 bg-card rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
              <Image
                src="/omni-social-google-hero.png"
                alt="Social Media and Google Integration"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Floating Badge Animation */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-xl border border-border hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Verified Business</p>
                  <p className="text-xs text-muted-foreground">Trusted by Meta</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* TRUSTED BY / SOCIAL PROOF SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-24 md:mb-32 pt-10 border-t border-border/40"
        >
          <p className="text-center text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">
            Trusted by & Integrated with industry leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-500">
            {/* Logo 1: Google */}
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">Google</span>
            </div>
            {/* Logo 2: Meta */}
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              <span className="text-xl md:text-2xl font-bold text-blue-600">Meta</span>
            </div>
            {/* Logo 3: WhatsApp */}
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              <span className="text-xl md:text-2xl font-bold text-[#25D366]">WhatsApp</span>
            </div>
            {/* Logo 4: TikTok */}
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              <span className="text-xl md:text-2xl font-bold text-foreground">TikTok</span>
            </div>
            {/* Logo 5: Stripe */}
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              <span className="text-xl md:text-2xl font-bold text-[#635BFF]">Stripe</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Section 1: Get Discovered (Text Left, Image Right) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-20 mb-20 md:mb-32"
        >
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-semibold mb-4 md:mb-6">
              <Globe size={14} /> Step 01
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-foreground leading-tight">
              Get discovered online
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Bized instantly creates a modern business page for you, with templates, branding, custom domains, and SEO settings—no coding needed.
            </p>
            <ul className="space-y-3 md:space-y-4">
              {[
                "Auto-generated website & public business page",
                "Get discovered in Google, Facebook, Instagram and WhatsApp",
                "Shareable links for WhatsApp, social media & ads"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
            {/* Stats Card Mockup */}
            <div className="mt-6 md:mt-8 p-4 md:p-6 rounded-2xl bg-card border border-border shadow-lg flex justify-between gap-4 max-w-sm hover:scale-105 transition-transform duration-300">
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Clicks</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600">2,430</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Links</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">12</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Emails</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">184</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 relative px-4 md:px-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative aspect-square rounded-3xl overflow-hidden shadow-xl md:shadow-2xl border border-border/50 bg-muted/50 w-full max-w-[320px] md:max-w-none mx-auto"
            >
              <Image src="/feature-discovery.png" alt="Get Discovered Online" fill className="object-cover" />
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Section 2: Scheduling (Image Left, Text Right) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-20 mb-20 md:mb-32"
        >
          <div className="w-full md:w-1/2 px-4 md:px-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl md:shadow-2xl border border-border/50 bg-muted/50 w-full max-w-[280px] md:max-w-[360px] mx-auto"
            >
              <Image src="/feature-scheduling.png" alt="Schedule Appointments" fill className="object-cover" />
            </motion.div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs md:text-sm font-semibold mb-4 md:mb-6">
              <Calendar size={14} /> Step 02
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-foreground leading-tight">
              Schedule & manage appointments
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Let clients book you online 24/7. Auto-reminders reduce no-shows, and everything syncs to your calendar.
            </p>
            <ul className="space-y-3 md:space-y-4">
              {[
                "Share your booking link or embed on your site",
                "Automatic SMS & Email reminders",
                "Staff scheduling & improved utilization"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Feature Section 3: CRM (Text Left, Image Right) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-20 mb-20 md:mb-32"
        >
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs md:text-sm font-semibold mb-4 md:mb-6">
              <Briefcase size={14} /> Step 03
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-foreground leading-tight">
              Nurture leads & repeat customers
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Every click, form fill and interaction becomes a lead in your CRM, so you can track status from new → qualified → converted.
            </p>
            <ul className="space-y-3 md:space-y-4">
              {[
                "Central lead list with statuses and values",
                "Pipeline and activities to track follow‑ups",
                "Client and staff records for better hand‑offs"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
            {/* Pipeline Stats Mockup */}
            <div className="mt-6 md:mt-8 flex gap-4 max-w-sm hover:scale-105 transition-transform duration-300">
              <div className="p-3 md:p-4 rounded-xl bg-card border border-border shadow-sm flex-1 text-center">
                <p className="text-xl md:text-2xl font-bold text-foreground">36</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">New Leads</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-card border border-border shadow-sm flex-1 text-center">
                <p className="text-xl md:text-2xl font-bold text-green-600">9</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Converted</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 relative px-4 md:px-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-xl md:shadow-2xl border border-border/50 bg-muted/50 w-full max-w-[320px] md:max-w-none mx-auto"
            >
              <Image src="/feature-crm.png" alt="CRM Pipeline" fill className="object-cover" />
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Section 4: Billing (Image Left, Text Right) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-20 mb-16 md:mb-24"
        >
          <div className="w-full md:w-1/2 px-4 md:px-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl md:shadow-2xl border border-border/50 bg-muted/50 w-full max-w-[280px] md:max-w-[360px] mx-auto"
            >
              <Image src="/feature-billing.png" alt="Invoicing and Billing" fill className="object-cover" />
            </motion.div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs md:text-sm font-semibold mb-4 md:mb-6">
              <CreditCard size={14} /> Step 04
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-foreground leading-tight">
              Bill, get paid & track every cent
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Create quotes and invoices in a few clicks, track who has paid, and keep income, expenses and purchases in one cashbook.
            </p>
            <ul className="space-y-3 md:space-y-4">
              {[
                "Professional invoice & quote templates",
                "Income, expenses, purchases & vendors in one place",
                "Import or export data to Excel/CSV"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
