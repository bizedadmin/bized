"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

/**
 * Responsive Sheet component:
 * - Desktop (md+): Side sheet sliding from the right
 * - Mobile: Bottom sheet sliding from the bottom
 */
export function Sheet({ open, onClose, title, icon, children, footer }: SheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // Escape key closes
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Scrim / Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 bg-black/15 z-[60] cursor-pointer"
                        onClick={onClose}
                    />

                    {/* ─── Mobile: Bottom Sheet ─── */}
                    <motion.div
                        ref={sheetRef}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="md:hidden fixed bottom-0 left-0 right-0 z-[70] max-h-[90vh] flex flex-col bg-[var(--color-surface-container)] rounded-t-[28px] shadow-2xl"
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-[var(--color-outline-variant)]/40" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-outline-variant)]/15">
                            <div className="flex items-center gap-3">
                                {icon && (
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        {icon}
                                    </div>
                                )}
                                <h2 className="text-xl font-bold text-[var(--color-on-surface)]">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl hover:bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-on-surface-variant)] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-6 py-4 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container)]">
                                {footer}
                            </div>
                        )}
                    </motion.div>

                    {/* ─── Desktop: Side Sheet ─── */}
                    <motion.div
                        ref={sheetRef}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="hidden md:flex fixed top-0 right-0 bottom-0 z-[70] w-[460px] max-w-[90vw] flex-col bg-[var(--color-surface-container)] border-l border-[var(--color-outline-variant)]/20 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-7 py-6 border-b border-[var(--color-outline-variant)]/15">
                            <div className="flex items-center gap-3">
                                {icon && (
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        {icon}
                                    </div>
                                )}
                                <h2 className="text-xl font-bold text-[var(--color-on-surface)]">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl hover:bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-on-surface-variant)] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-7 py-6">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-7 py-5 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container)]">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
