"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    showBackLink?: boolean;
    isRedirecting?: boolean;
}

export function AuthLayout({
    children,
    title,
    subtitle,
    showBackLink = true,
    isRedirecting = false
}: AuthLayoutProps) {

    if (isRedirecting) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-surface)]/80 backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
                    <p className="text-lg font-medium text-[var(--color-on-surface)]">Connecting securely...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen relative flex items-center justify-center bg-[var(--color-surface-container-low)] px-4 py-8 overflow-hidden">
            {/* Animated Background Decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-secondary)]/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                {showBackLink && (
                    <div className="mb-8">
                        <Link href="/">
                            <Button variant="text" className="pl-0 hover:pl-2 transition-all text-[var(--color-on-surface)]/60 hover:text-[var(--color-on-surface)]">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="bg-[var(--color-surface)] rounded-3xl p-8 shadow-xl border border-[var(--color-outline-variant)]/20 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--color-on-surface)] mb-2">{title}</h1>
                        <p className="text-[var(--color-on-surface)]/60">{subtitle}</p>
                    </div>

                    {children}
                </div>
            </motion.div>
        </main>
    );
}
