"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const icons = [
    { src: "https://cdn.simpleicons.org/facebook/1877F2", alt: "Facebook" },
    { src: "https://cdn.simpleicons.org/instagram/E4405F", alt: "Instagram" },
    { src: "https://cdn.simpleicons.org/google/4285F4", alt: "Google" },
    { src: "https://cdn.simpleicons.org/googleads/4285F4", alt: "Google Ads" },
    { src: "https://cdn.simpleicons.org/messenger/0084FF", alt: "Messenger" },
    { src: "https://cdn.simpleicons.org/googlemessages/4285F4", alt: "Google Messages" },
    { src: "https://cdn.simpleicons.org/tiktok/000000", alt: "TikTok" },
    { src: "https://cdn.simpleicons.org/whatsapp/25D366", alt: "WhatsApp" },
    { src: "https://cdn.simpleicons.org/x/000000", alt: "X" },
];

export default function OmnichannelAnimation() {
    return (
        <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
            {/* Concentric Breathing Primary Rings - Increased Intensity */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-64 h-64 rounded-full bg-primary/20 blur-3xl shadow-[0_0_100px_rgba(0,122,255,0.3)]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
                    className="absolute w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]"
                />
            </div>

            {/* Orbit Rings */}
            <div className="absolute w-[320px] h-[320px] rounded-full border border-primary/10" />
            <div className="absolute w-[480px] h-[480px] rounded-full border border-primary/5" />

            {/* Central Logo - Reverted to White Rounded-3xl */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 w-24 h-24 p-4 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-border flex items-center justify-center"
            >
                <Image
                    src="/logo-light-mode.png"
                    alt="Bized Logo"
                    width={60}
                    height={60}
                    className="w-auto h-auto object-contain"
                />
            </motion.div>

            {/* Orbiting Icons */}
            <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
                {icons.map((icon, index) => {
                    const angle = (index * 360) / icons.length;
                    const radius = 150 + (index % 2) * 75; // Alternating radius for visual depth
                    const duration = 10 + index;

                    return (
                        <motion.div
                            key={index}
                            className="absolute"
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                duration,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            style={{
                                width: radius * 2,
                                height: radius * 2,
                            }}
                        >
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-border flex items-center justify-center"
                                style={{ rotate: -angle }} // Keep icon upright as it orbits (counter-rotation)
                                initial={{ rotate: 0 }}
                                animate={{ rotate: -360 }}
                                transition={{
                                    duration,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            >
                                <img
                                    src={icon.src}
                                    alt={icon.alt}
                                    className="w-full h-full object-contain"
                                />
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Soft Glow */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
        </div>
    );
}
