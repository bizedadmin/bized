"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type SnackbarType = "success" | "error" | "info" | "warning";

interface SnackbarMessage {
    id: string;
    message: string;
    type: SnackbarType;
    duration?: number;
}

interface SnackbarContextType {
    showSnackbar: (message: string, type?: SnackbarType, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function useSnackbar() {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
    const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

    const showSnackbar = useCallback((message: string, type: SnackbarType = "success", duration: number = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setSnackbars((prev) => [...prev, { id, message, type, duration }]);

        setTimeout(() => {
            setSnackbars((prev) => prev.filter((s) => s.id !== id));
        }, duration);
    }, []);

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
                <AnimatePresence>
                    {snackbars.map((snack) => (
                        <SnackbarItem key={snack.id} snack={snack} onClose={(id) => setSnackbars(prev => prev.filter(s => s.id !== id))} />
                    ))}
                </AnimatePresence>
            </div>
        </SnackbarContext.Provider>
    );
}

function SnackbarItem({ snack, onClose }: { snack: SnackbarMessage; onClose: (id: string) => void }) {
    const duration = snack.duration || 3000;

    const icons = {
        success: <CheckCircle2 className="text-emerald-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        warning: <AlertCircle className="text-amber-500" size={20} />,
    };

    const bgColors = {
        success: "bg-[var(--color-surface-container-highest)] border-emerald-500/20",
        error: "bg-[var(--color-surface-container-highest)] border-red-500/20",
        info: "bg-[var(--color-surface-container-highest)] border-blue-500/20",
        warning: "bg-[var(--color-surface-container-highest)] border-amber-500/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "pointer-events-auto relative flex items-center gap-3 p-4 rounded-2xl border shadow-lg overflow-hidden",
                bgColors[snack.type]
            )}
        >
            <div className="shrink-0">{icons[snack.type]}</div>
            <p className="text-sm font-bold text-[var(--color-on-surface)] flex-1 line-clamp-2">
                {snack.message}
            </p>
            <button
                onClick={() => onClose(snack.id)}
                className="p-1 rounded-lg hover:bg-[var(--color-on-surface)]/10 transition-colors text-[var(--color-on-surface-variant)] opacity-40 hover:opacity-100"
            >
                <X size={16} />
            </button>

            {/* Progress Bar */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={cn(
                    "absolute bottom-0 left-0 h-[3px]",
                    snack.type === "success" && "bg-emerald-500",
                    snack.type === "error" && "bg-red-500",
                    snack.type === "info" && "bg-blue-500",
                    snack.type === "warning" && "bg-amber-500"
                )}
            />
        </motion.div>
    );
}
