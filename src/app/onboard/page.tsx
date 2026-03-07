"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, MessageSquare, Zap, ArrowRight, RefreshCw, Facebook } from "lucide-react";

function OnboardBridgeContent() {
    const sp = useSearchParams();
    const sessionId = sp.get("session");
    const [businessName, setBusinessName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError("No session ID found in URL. Please start from WhatsApp.");
            setLoading(false);
            return;
        }

        // Fetch Business Name from Phase 1 data
        fetch(`/api/onboarding/session?id=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.businessName) setBusinessName(data.businessName);
                else setError("Could not find business data for this session.");
            })
            .catch(() => setError("Connection error. Please try again."))
            .finally(() => setLoading(false));

        // Load FB SDK
        (window as any).fbAsyncInit = function () {
            (window as any).FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v21.0'
            });
        };

        const script = document.createElement('script');
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

    }, [sessionId]);

    const handleFBLogin = () => {
        (window as any).FB.login((response: any) => {
            if (response.authResponse) {
                console.log('FB Auth Success:', response.authResponse);
                // Call Phase 3: Background Provisioning API here
                window.location.href = `/onboard/success?auth=${response.authResponse.accessToken}`;
            } else {
                alert('Meta provisioning cancelled.');
            }
        }, {
            scope: 'whatsapp_business_management,whatsapp_business_messaging',
            extras: {
                setup_config_id: process.env.NEXT_PUBLIC_META_COMMERCE_CONFIG_ID
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white p-6">
            <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="font-bold italic uppercase tracking-widest text-sm translate-y-1">Resuming Session...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <ShieldCheck className="w-10 h-10 text-red-500" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Onboarding Halted</h1>
                <p className="text-zinc-500 text-sm mt-2">{error}</p>
            </div>
            <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition"
            >
                RETRY CONNECTION
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Header Phase Indicator */}
                <div className="flex items-center justify-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black italic shadow-lg shadow-indigo-500/20">01</div>
                    <div className="w-12 h-1 rounded-full bg-indigo-500/20" />
                    <div className="w-8 h-8 rounded-full bg-white text-indigo-950 flex items-center justify-center text-[10px] font-black italic shadow-lg">02</div>
                    <div className="w-12 h-1 rounded-full bg-zinc-800" />
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black italic text-zinc-500">03</div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                        Secure <span className="text-indigo-500">Provisioning</span>
                    </h1>
                    <p className="text-zinc-400 text-sm">Setting up: <strong className="text-white italic">{businessName}</strong></p>
                </div>

                {/* Main Action Card */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-xl shadow-2xl">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white uppercase text-xs tracking-widest italic">Official Partner</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed mt-1">Bized.app is a verified Meta Tech Provider. Your data is secured with end-to-end encryption.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <RefreshCw className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white uppercase text-xs tracking-widest italic">Zero-Input Sync</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed mt-1">We'll automatically pull your business category, address, and email from Facebook.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button
                            onClick={handleFBLogin}
                            className="w-full h-16 bg-white text-indigo-950 font-black italic uppercase rounded-3xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition shadow-[0_8px_30px_rgb(255,255,255,0.2)]"
                        >
                            <Facebook className="w-6 h-6 fill-indigo-950" />
                            Setup with Meta
                        </button>
                        <p className="text-[10px] text-center text-zinc-500 uppercase font-bold tracking-widest opacity-50">
                            By continuing, you agree to the Hybrid Commerce Terms.
                        </p>
                    </div>
                </div>

                {/* Progress Visual */}
                <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase text-indigo-400 italic">
                    <Zap className="w-3 h-3 animate-pulse" /> Finalizing Lead Capture (90%)
                </div>
            </div>
        </div>
    );
}

export default function OnboardBridgePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white p-6">
                <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="font-bold italic uppercase tracking-widest text-sm translate-y-1">Preparing Session...</p>
            </div>
        }>
            <OnboardBridgeContent />
        </Suspense>
    );
}
