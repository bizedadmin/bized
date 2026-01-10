"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Image from "next/image";
import Link from "next/link";
import { Plus, CheckCircle2, ArrowRight } from "lucide-react";
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



        {/* CTA SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mt-24 md:mt-32 p-8 md:p-16 rounded-[2.5rem] overflow-hidden bg-primary text-primary-foreground text-center"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[80%] rounded-full bg-white blur-[100px]" />
            <div className="absolute top-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-400 blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to take your business to the next level?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Join thousands of businesses using Bized to simplify operations, manage orders, and grow revenue.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <button className="px-8 py-4 rounded-full bg-background text-foreground font-bold text-lg hover:bg-background/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group">
                  Start for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            <p className="text-sm text-primary-foreground/70 pt-4">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
