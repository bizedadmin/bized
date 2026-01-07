"use client";

import React from "react";
import { motion } from "framer-motion";

const companies = [
    { name: "Acme Corp", opacity: "opacity-50" },
    { name: "GlobalBank", opacity: "opacity-40" },
    { name: "SaaS Flow", opacity: "opacity-60" },
    { name: "NextGen", opacity: "opacity-50" },
    { name: "Elevate", opacity: "opacity-45" },
];

const TrustedBy = () => {
    return (
        <section className="py-10 border-y border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-8">
                    Trusted by 5,000+ ambitious businesses
                </p>
                <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 grayscale opacity-70">
                    {/* Using text specific styles to simulate logos for now, avoiding external image dependencies */}
                    <h3 className="text-2xl font-bold font-serif italic text-zinc-400">Vortex</h3>
                    <h3 className="text-xl font-extrabold tracking-tighter text-zinc-400">QUANTA.</h3>
                    <div className="flex items-center gap-1 text-zinc-400 font-bold text-xl">
                        <div className="w-6 h-6 bg-zinc-400 rounded-full"></div>
                        CircleOps
                    </div>
                    <h3 className="text-2xl font-light tracking-[0.2em] text-zinc-400 uppercase">Aether</h3>
                    <h3 className="text-2xl font-black text-zinc-400 font-mono">LUMEN</h3>
                </div>
            </div>
        </section>
    );
};

export default TrustedBy;
