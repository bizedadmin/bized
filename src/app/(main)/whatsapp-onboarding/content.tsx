"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MessageCircle,
    CheckCircle2,
    Zap,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMetaBusinessAuth } from "@/hooks/useMetaBusinessAuth";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function WhatsAppOnboardingContentClient() {
    const { handleMetaSignIn, isLoading: isAuthLoading, error: authError } = useAuth();
    const { startMetaBusinessAuth } = useMetaBusinessAuth();
    const router = useRouter();

    const [step, setStep] = React.useState<'landing' | 'claiming'>('landing');
    const [pendingMeta, setPendingMeta] = React.useState<any>(null);
    const [businessName, setBusinessName] = React.useState("");
    const [businessSlug, setBusinessSlug] = React.useState("");
    const [isCreatingStore, setIsCreatingStore] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setBusinessName(val);
        setBusinessSlug(generateSlug(val));
    };

    // Listen for Meta Auth popup messages
    React.useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            const data = event.data;
            if (data?.type === 'META_AUTH_COMPLETE') {
                if (data.status === 'success' && data.intent === 'signup') {
                    if (data.whatsappBusiness) {
                        setPendingMeta(data);
                        setBusinessName(data.whatsappBusiness.businessName || "");
                        setBusinessSlug(generateSlug(data.whatsappBusiness.businessName || ""));
                        setStep('claiming');
                    } else if (data.firebaseToken) {
                        await handleMetaSignIn(data.firebaseToken);
                    }
                } else if (data.status === 'error') {
                    setError(data.message || "Meta Authentication failed");
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMetaSignIn]);

    const handleStartEmbeddedSignup = () => {
        startMetaBusinessAuth({
            intent: 'signup',
            configId: process.env.NEXT_PUBLIC_META_COMMERCE_CONFIG_ID
        });
    };

    const handleFinalizeOnboarding = async () => {
        if (!businessName || !businessSlug) {
            setError("Please provide a name and link for your hub.");
            return;
        }

        setIsCreatingStore(true);
        setError(null);

        try {
            if (pendingMeta?.firebaseToken) {
                await handleMetaSignIn(pendingMeta.firebaseToken);
            }

            const res = await fetch("/api/stores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: businessName,
                    slug: businessSlug,
                    industry: "General",
                    businessType: "Product",
                    whatsappBusiness: pendingMeta?.whatsappBusiness
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to create store");

            router.push(`/admin/${result.id}`);
        } catch (err: any) {
            console.error("Onboarding Finalization Error:", err);
            setError(err.message || "An unexpected error occurred.");
            setIsCreatingStore(false);
        }
    };

    const onboardingSteps = [
        { title: "Link Meta Account", desc: "Securely connect your Facebook login." },
        { title: "Configure Assets", desc: "Select your WhatsApp Business Account and catalog." },
        { title: "Claim your Link", desc: "Choose your unique bized.app handle and launch." }
    ];

    const isLoading = isAuthLoading || isCreatingStore;
    const activeError = authError || error;

    return (
        <AuthLayout
            title={step === 'claiming' ? "Brand your Hub" : "WhatsApp Business"}
            subtitle={step === 'claiming' ? "Set your unique business link" : "Accelerate your growth with WhatsApp API"}
            isRedirecting={isLoading}
            showBackLink={true}
            onBack={step === 'claiming' ? () => setStep('landing') : undefined}
        >
            <div className="flex justify-center mb-6">
                <div className="p-3 rounded-2xl bg-[var(--color-surface-container)] shadow-inner">
                    <Logo className="w-10 h-10" />
                </div>
            </div>

            {activeError && (
                <div className="mb-6 p-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <span>{activeError}</span>
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 'landing' ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* Illustration */}
                        <div className="relative aspect-square w-full max-w-[280px] mx-auto overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-500/5 to-emerald-500/10 border border-green-500/10">
                            <Image
                                src="/whatsapp_onboarding_illustration.png"
                                alt="WhatsApp Onboarding"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Steps Description */}
                        <div className="space-y-4">
                            {onboardingSteps.map((s, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0 font-bold text-xs ring-4 ring-green-500/5 group-hover:scale-110 transition-transform">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black uppercase tracking-wider text-[var(--color-on-surface)] leading-none mb-1">
                                            {s.title}
                                        </h4>
                                        <p className="text-[11px] text-[var(--color-on-surface)]/60 font-medium">
                                            {s.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Button
                                className="w-full h-14 rounded-full text-sm font-black uppercase tracking-widest shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white border-none group"
                                onClick={handleStartEmbeddedSignup}
                                disabled={isLoading}
                            >
                                <MessageCircle className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                                Onboard Now
                                <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="claiming"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] opacity-60 ml-4">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={handleNameChange}
                                    className="w-full h-14 px-6 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 outline-none transition-all text-sm font-medium"
                                    placeholder="e.g. Bized Lagos"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] opacity-60 ml-4">
                                    Store Handle (Link)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm text-[var(--color-on-surface-variant)] opacity-30 font-medium">
                                        bized.app/
                                    </span>
                                    <input
                                        type="text"
                                        value={businessSlug}
                                        onChange={(e) => setBusinessSlug(generateSlug(e.target.value))}
                                        className="w-full h-14 pl-[5.5rem] pr-6 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 outline-none transition-all text-sm font-bold tracking-tight"
                                        placeholder="your-hub-link"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                className="w-full h-14 rounded-full text-sm font-black uppercase tracking-widest shadow-xl shadow-[var(--color-primary)]/20"
                                onClick={handleFinalizeOnboarding}
                                disabled={isLoading}
                            >
                                {isLoading ? "Provisioning..." : "Launch my Hub"}
                            </Button>
                        </div>

                        <div className="p-4 rounded-3xl bg-[var(--color-primary-container)]/30 border border-[var(--color-primary)]/10">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
                                    <Zap className="w-5 h-5 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-primary)] mb-1">WhatsApp Verified</h4>
                                    <p className="text-[11px] text-[var(--color-on-surface)]/60 font-medium leading-relaxed">
                                        Your catalog and business profile will be synced automatically to this new address.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 px-4 text-center">
                <div className="h-px bg-[var(--color-outline-variant)]/20 w-full mb-6" />
                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-40 uppercase font-black tracking-[0.2em] leading-relaxed">
                    By proceeding, you agree to our <br />
                    <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Service Terms</Link> & <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Data Protocol</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
