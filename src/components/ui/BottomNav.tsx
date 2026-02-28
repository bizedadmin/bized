"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
}

interface BottomNavProps {
    items: NavItem[];
    activeId: string;
    onChange: (id: string) => void;
    className?: string;
}

export function BottomNav({ items, activeId, onChange, className }: BottomNavProps) {
    return (
        <nav className={cn(
            "fixed bottom-0 left-0 right-0 h-20 bg-[var(--color-surface-container)] border-t border-[var(--color-outline-variant)]/10 px-4 pb-safe flex items-center justify-around z-50",
            className
        )}>
            {items.map((item) => {
                const isActive = item.id === activeId;
                return (
                    <button
                        key={item.id}
                        onClick={() => onChange(item.id)}
                        className="flex flex-col items-center gap-1 min-w-[64px] relative group"
                    >
                        {/* Active Pill Indicator */}
                        <div className="relative h-8 w-16 flex items-center justify-center">
                            {isActive && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-[var(--color-secondary-container)] rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className={cn(
                                "relative z-10 transition-colors duration-200",
                                isActive ? "text-[var(--color-on-secondary-container)]" : "text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)]"
                            )}>
                                {isActive && item.activeIcon ? item.activeIcon : item.icon}
                            </div>
                        </div>

                        <span className={cn(
                            "text-[11px] font-medium tracking-tight transition-colors duration-200",
                            isActive ? "font-bold text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)]"
                        )}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
