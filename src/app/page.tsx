"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  User,
  ShoppingBag,
  Share2,
  ChevronDown,
  LayoutTemplate,
  Sparkles,
  BarChart3,
  Globe,
  ArrowRight,
  Zap,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden pb-24">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-background to-background dark:from-emerald-900/20 dark:via-background dark:to-background pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Left Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 border border-emerald-100 dark:border-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                New: AI Store Builder is live
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Your entire business, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                  in one simple link.
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Create a stunning online store, manage orders, and track analytics. No website required. The operating system for modern creators.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-foreground text-background font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    Start Building Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="#features" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-background border border-border text-foreground font-bold text-lg hover:bg-muted/50 transition-colors">
                    How it works
                  </button>
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cancel anytime</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 w-full relative perspective-1000"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 bg-white/5 backdrop-blur-sm dark:bg-white/5 dark:border-white/10 group">
                <Image
                  src="/bized-hero-green.png"
                  alt="Bized Dashboard Interface"
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-[2rem] transform transition-transform duration-700 group-hover:scale-105"
                  priority
                />

                {/* Floating Card 1 */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -left-6 bottom-12 bg-background p-4 rounded-2xl shadow-xl border border-border flex items-center gap-4 max-w-[200px]"
                >
                  <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-full">
                    <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sales Today</p>
                    <p className="text-lg font-bold text-foreground">+$1,240</p>
                  </div>
                </motion.div>

                {/* Floating Card 2 */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -right-6 top-12 bg-background p-4 rounded-2xl shadow-xl border border-border hidden md:flex items-center gap-4"
                >
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                    <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">New Visitor</p>
                    <p className="text-sm font-bold text-foreground">Just now</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF (Ticker) */}
      <section className="py-10 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Powering 2,500+ businesses worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {["STORE.IO", "FRESHGOODS", "BEAUTYBAR", "TECHPRO", "DELIVER.IT"].map((brand) => (
              <span key={brand} className="text-xl md:text-2xl font-bold text-foreground/40">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section className="py-32 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Everything you need to scale</h2>
            <p className="text-xl text-muted-foreground">
              Powerful features packaged in a simple, elegant interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Feature - Spans 2 cols */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-[2.5rem] p-8 md:p-12 border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden group"
            >
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-emerald-600/20">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-4">No Website Needed</h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Forget about hosting, domains, and coding. Bized gives you a professional storefront that lives in your bio.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white dark:bg-white/10 text-sm font-medium border border-border">Products</span>
                  <span className="px-3 py-1 rounded-full bg-white dark:bg-white/10 text-sm font-medium border border-border">Services</span>
                  <span className="px-3 py-1 rounded-full bg-white dark:bg-white/10 text-sm font-medium border border-border">Digital Goods</span>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity">
                {/* Decorative Pattern */}
                <div className="w-full h-full bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>
            </motion.div>

            {/* Secondary Feature */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Powered</h3>
              <p className="text-muted-foreground">
                Generate product descriptions and marketing copy instantly with our built-in AI tools.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Understand your customers with deep insights into clicks, views, and conversion rates.
              </p>
            </motion.div>

            {/* Feature 4 - Spans 2 cols */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 rounded-[2.5rem] p-8 md:p-12 border border-border relative overflow-hidden group"
            >
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Sell Everywhere</h3>
                  <p className="text-lg text-muted-foreground">
                    Your Bized link works seamlessly on WhatsApp, Instagram, TikTok, and LinkedIn. It's the only link you'll ever need.
                  </p>
                </div>
                <div className="bg-background rounded-2xl border border-border p-6 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                    <span className="font-bold text-sm">Order #2938</span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">Paid</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded-full w-3/4" />
                    <div className="h-2 bg-muted rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / TIMELINE */}
      <section className="py-24 px-6 bg-muted/30 dark:bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Launch in minutes</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to your new online business.</p>
          </div>

          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-200 via-emerald-500 to-transparent dark:from-emerald-900 dark:via-emerald-700 hidden md:block" />

            <div className="space-y-16">
              {[
                {
                  icon: User,
                  title: "Claim your link",
                  desc: "Sign up and choose your unique username (e.g., bized.com/yourbrand)."
                },
                {
                  icon: ShoppingBag,
                  title: "Add your products",
                  desc: "Upload photos, set prices, and write descriptions. AI can help you write them."
                },
                {
                  icon: Share2,
                  title: "Start selling",
                  desc: "Share your link on social media. Customers can browse and buy instantly."
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative flex gap-8 items-start"
                >
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center shrink-0">
                    <step.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-2xl font-bold mb-2">0{idx + 1}. {step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            {[
              "What is a Business Link?",
              "Can I use my own domain?",
              "Is it free to get started?",
              "How do I accept payments?"
            ].map((question, index) => (
              <details key={index} className="group bg-card rounded-2xl border border-border overflow-hidden">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-muted/50 transition-colors">
                  <span className="font-bold text-lg">{question}</span>
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed animate-in slide-in-from-top-2">
                  Yes, Bized empowers you to create a professional online presence without any technical skills. It's designed for growth.
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* BIG CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-foreground text-background rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-white">Ready to start selling?</h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who are building their future with Bized.
            </p>
            <Link href="/register">
              <button className="px-10 py-5 rounded-full bg-emerald-600 text-white font-bold text-xl hover:bg-emerald-500 hover:scale-105 transition-all shadow-xl shadow-emerald-600/30">
                Get Started for Free
              </button>
            </Link>
          </div>

          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-black opacity-50 z-0" />
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emerald-500/20 blur-[150px] rounded-full z-0" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
