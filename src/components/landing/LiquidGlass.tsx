"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidGlassProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    intensity?: "low" | "medium" | "high";
}

export const LiquidGlass = ({ children, className, delay = 0, intensity = "medium" }: LiquidGlassProps) => {
    // Intensity configurations
    const blurMap = {
        low: "backdrop-blur-md",
        medium: "backdrop-blur-xl",
        high: "backdrop-blur-3xl"
    };

    const bgMap = {
        low: "bg-white/5",
        medium: "bg-white/10",
        high: "bg-white/15"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.16, 1, 0.3, 1] // Apple-like ease
            }}
            whileHover={{
                y: -4,
                scale: 1.01,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            className={cn(
                "relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10",
                blurMap[intensity],
                bgMap[intensity],
                className
            )}
        >
            {/* Liquid Gradient Border (Pseudo-border) */}
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[liquid-flow_3s_ease-in-out_infinite] blur-sm" />
            </div>

            {/* Specular Highlight / Sheen */}
            <div
                className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shine_1.5s_ease-in-out]"
                style={{ left: '-100%' }}
            />

            {/* Noise Texture (Optional for realism) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Inner Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>

            {/* Color Blob Glow on Hover */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </motion.div>
    );
};
