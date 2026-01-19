"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const GlassCard = ({ children, className, delay = 0 }: GlassCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0, 0.71, 0.2, 1.01]
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={cn(
                "relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl overflow-hidden group",
                className
            )}
        >
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Card Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
