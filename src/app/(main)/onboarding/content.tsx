"use client";

import React from "react";
import Link from "next/link";
import {
    MessageCircle,
    MapPin,
    ChevronRight,
    ShieldCheck,
    Zap,
    Mail,
    Sparkles
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.053-1.147 8.213-3.08 2.187-1.933 2.853-4.8 2.853-7.227 0-.693-.067-1.347-.187-2.773h-10.88z" fill="currentColor" />
    </svg>
);

const MetaIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

export default function OnboardingContentClient() {
    const { handleGoogleSignIn, isLoading, isRedirecting, error } = useAuth();

    const onboardingPaths = [
        {
            id: "whatsapp",
            title: "WhatsApp Business",
            subtitle: "Onboard with Meta Commerce",
            description: "Automatically sync catalogs and enable AI-powered chat sales instantly.",
            icon: <MessageCircle className="w-8 h-8 text-green-500" />,
            actionIcon: <MetaIcon />,
            color: "green",
            href: "/whatsapp-onboarding",
            popular: true
        },
        {
            id: "google",
            title: "Google Profile",
            subtitle: "Onboard with Existing GBP",
            description: "Instant presence on Google Search. Sync your store from Maps profile.",
            icon: <MapPin className="w-8 h-8 text-blue-500" />,
            actionIcon: <GoogleIcon />,
            color: "blue",
            onClick: handleGoogleSignIn
        },
        {
            id: "manual",
            title: "Manual Entry",
            subtitle: "Build your Hub from scratch",
            description: "Setup your business profile step-by-step for a custom unique presence.",
            icon: <Mail className="w-8 h-8 text-slate-500" />,
            actionIcon: <ChevronRight className="w-5 h-5" />,
            color: "slate",
            href: "/signup"
        }
    ];

    return (
        <AuthLayout
            title="Accelerated Onboarding"
            subtitle="Choose a source to pre-fill your business hub"
            isRedirecting={isRedirecting}
            showBackLink={true}
        >
            <div className="flex justify-center mb-8">
                <div className="p-4 rounded-[2rem] bg-[var(--color-surface-container)] shadow-inner">
                    <Logo className="w-12 h-12" />
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {onboardingPaths.map((path, index) => {
                    const CardComponent = (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "group relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 p-6 cursor-pointer",
                                path.popular
                                    ? "bg-[var(--color-primary-container)] border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]/5"
                                    : "bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-container)]"
                            )}
                            onClick={path.onClick}
                        >
                            {path.popular && (
                                <div className="absolute top-4 right-8 flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm">
                                    <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">Fastest path</span>
                                </div>
                            )}

                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:-rotate-3 group-hover:scale-105",
                                    path.color === 'green' ? "bg-white text-green-500" : path.color === 'blue' ? "bg-white text-blue-500" : "bg-white text-slate-500"
                                )}>
                                    {path.icon}
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <h3 className="text-xl font-black italic tracking-tighter text-[var(--color-on-surface)] leading-none mb-1 uppercase">
                                        {path.title}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] opacity-40 mb-3">
                                        {path.subtitle}
                                    </p>
                                    <p className="text-[11px] text-[var(--color-on-surface)]/60 leading-relaxed font-medium">
                                        {path.description}
                                    </p>
                                </div>
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:bg-[var(--color-primary)] group-hover:text-white shadow-sm border border-black/5",
                                    path.popular
                                        ? "bg-white text-[var(--color-primary)]"
                                        : "bg-white text-[var(--color-on-surface-variant)]"
                                )}>
                                    {path.actionIcon}
                                </div>
                            </div>
                        </motion.div>
                    );

                    if (path.href) {
                        return (
                            <Link key={path.id} href={path.href} className="block group/link">
                                {CardComponent}
                            </Link>
                        );
                    }

                    return (
                        <button key={path.id} onClick={path.onClick} className="w-full block outline-none" disabled={isLoading}>
                            {CardComponent}
                        </button>
                    );
                })}
            </div>

            <div className="mt-10 px-4 text-center">
                <div className="h-px bg-[var(--color-outline-variant)]/20 w-full mb-6" />
                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-40 uppercase font-black tracking-[0.2em] leading-relaxed">
                    By proceeding, you agree to our <br />
                    <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Service Terms</Link> & <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Data Protocol</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
