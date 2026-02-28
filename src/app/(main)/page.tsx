"use client";

import { motion } from "framer-motion";
import { ModernHero } from "@/components/landing/ModernHero";
import { ModernFeatureGrid } from "@/components/landing/ModernFeatureGrid";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";

import { cn } from "@/lib/utils";
import { MessageCircle, Globe, Sparkles, Layout, Smartphone, Calendar, ShoppingCart } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <ModernHero />

      <ModernFeatureGrid />

      {/* Feature Section 1: Omnichannel Presence */}
      <FeatureSection
        label="Omnichannel Presence"
        title="Be where your customers are."
        description="Launch your **Dynamic Mini-Storefront** in seconds. We automatically sync your profile with **Google Search & Maps** and **WhatsApp Business**, ensuring you never miss a lead, no matter where they find you."
        features={[
          "High-Conversion Mini Store",
          "Google Search & Maps Sync",
          "Official WhatsApp Integration"
        ]}
        image={
          <div className="relative h-[500px] w-full bg-slate-50 border border-slate-100 rounded-[3rem] flex items-center justify-center overflow-hidden shadow-inner p-8">
            <img
              src="/features/storefront_v2.png"
              alt="Omnichannel Storefront"
              className="w-full max-w-[450px] h-auto object-contain drop-shadow-2xl"
            />
          </div>
        }
      />

      {/* Feature Section 2: AI & Automation */}
      <FeatureSection
        reverse
        bg="slate"
        label="AI & Automation"
        title="Your business on autopilot."
        description="Experience the power of **AI-Powered WhatsApp Automation**. Our system handles chat inquiries, processes **Smart Bookings 24/7**, and manages your **Orders** without you lifting a finger."
        features={[
          "Intelligent AI Chatbot",
          "24/7 Smart Scheduling",
          "Automated Order Operations"
        ]}
        image={
          <div className="relative h-[500px] w-full bg-slate-100/50 border border-slate-200/50 rounded-[3rem] flex items-center justify-center overflow-hidden shadow-inner p-8">
            <img
              src="/features/automation_v2.png"
              alt="WhatsApp AI Automation"
              className="w-full max-w-[450px] h-auto object-contain drop-shadow-2xl"
            />
          </div>
        }
      />

      {/* Feature Section 3: Payments & Logistics */}
      <FeatureSection
        label="Payments & Logistics"
        title="Closing the loop, instantly."
        description="From **Instant One-Tap Payments** to global **Logistics & Shipping**, we provide the tools to scale. Use **Instant QR Connect** to bridge your physical location to your digital store."
        features={[
          "Secure QR & Link Payments",
          "Global Shipping & Logistics Hub",
          "Smart QR Code Generator"
        ]}
        image={
          <div className="relative h-[500px] w-full bg-slate-50 border border-slate-100 rounded-[3rem] flex items-center justify-center overflow-hidden shadow-inner p-8">
            {/* shipping Box Mockup */}
            <div className="relative w-full max-w-[380px] aspect-square bg-[#E2E8F0] rounded-[2rem] shadow-2xl border-b-[16px] border-r-[16px] border-slate-400/30 flex flex-col p-10 overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div className="w-20 h-20 bg-white/60 rounded-3xl flex items-center justify-center text-slate-500 shadow-sm">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="px-5 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-white mr-3 animate-pulse" />
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">Shipped</span>
                </div>
              </div>

              {/* Shipping Label */}
              <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-4 relative">
                <div className="absolute top-6 right-6 text-slate-200">
                  <Globe className="w-12 h-12 opacity-30" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tracking Number</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight leading-none">1029 3847 5612</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Weight</p>
                    <p className="text-sm font-black text-slate-900">1.2 kg</p>
                  </div>
                  <div className="h-8 w-24 bg-slate-900 rounded-[3px] overflow-hidden flex items-center gap-[1.5px] p-[2px]">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className={cn("h-full bg-white", i % 4 === 0 ? "w-[3px]" : "w-[1px]")} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            {/* Floating QR Code Element */}
            <div className="absolute top-12 right-12 w-28 h-28 bg-white rounded-[2rem] shadow-2xl border border-slate-50 flex items-center justify-center p-3 animate-bounce [animation-duration:5s]">
              <div className="w-full h-full bg-slate-900 rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden">
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={cn("rounded-sm", (i + (Math.floor(i / 4))) % 2 === 0 ? "bg-white" : "bg-transparent")} />
                  ))}
                </div>
                <div className="h-1.5 w-full bg-blue-500 rounded-full animate-pulse" />
                {/* Scanner line effect */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-400/50 shadow-[0_0_10px_rgba(96,165,250,0.5)] animate-[scan_2s_linear_infinite]" />
              </div>
            </div>
          </div>
        }
      />

      <PricingSection />
      <CTASection />

    </main>
  );
}
