"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
    label: React.ReactNode;
    value: string;
}

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export function Select({ value, onValueChange, options, placeholder = "Select...", className, buttonClassName, icon, disabled = false }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full h-[52px] px-5 rounded-[var(--radius-m3-xl)] bg-[var(--color-surface)] border outline-none transition-all flex items-center justify-between text-sm font-medium",
                    isOpen
                        ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
                        : "border-[var(--color-outline-variant)]/20 hover:border-[var(--color-on-surface-variant)]/40",
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    buttonClassName
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-[var(--color-on-surface-variant)] opacity-70 shrink-0">{icon}</span>}
                    <span className={cn("truncate", !selectedOption ? "text-[var(--color-on-surface-variant)] opacity-50" : "text-[var(--color-on-surface)]")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown size={18} className={cn("text-[var(--color-on-surface-variant)] transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/20 rounded-[var(--radius-m3-xl)] shadow-[var(--shadow-m3-3)] py-2 max-h-60 overflow-y-auto overscroll-contain"
                    >
                        {options.length === 0 ? (
                            <div className="px-5 py-4 text-sm text-center text-[var(--color-on-surface-variant)] opacity-70 font-medium">
                                No options available
                            </div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onValueChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-5 py-3 text-sm flex items-center justify-between transition-colors",
                                        value === option.value
                                            ? "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] font-bold"
                                            : "text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] font-medium"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {value === option.value && <Check size={16} className="shrink-0 ml-3" />}
                                </button>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
