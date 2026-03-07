"use client";

import React, { useState } from "react";
import Head from "next/head";
import {
    CreditCard,
    Zap,
    CheckCircle2,
    Loader2,
    ArrowUpRight,
    ExternalLink
} from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function BillingPage() {
    const { currentBusiness, isLoading } = useBusiness();

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">Billing & Plans</h1>
                <p className="text-[var(--color-on-surface-variant)] opacity-60 mt-1">
                    Manage your subscription, limits, and payout settings.
                </p>
            </header>

            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)]">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-black text-[var(--color-on-surface)] flex items-center gap-3">
                            <CreditCard className="text-[var(--color-primary)]" /> Current Plan
                        </h3>
                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70">
                            Your business is currently on the <span className="font-black text-[var(--color-primary)] uppercase tracking-widest">{currentBusiness?.subscription?.planId || "Free"}</span> plan.
                        </p>
                    </div>
                    <div className="px-6 py-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Status</div>
                        <div className="font-black text-sm uppercase tracking-tighter">{currentBusiness?.subscription?.status || "Active (Free)"}</div>
                    </div>
                </div>

                {/* Limits Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                    {[
                        { label: "Products", used: currentBusiness?.products?.length || 0, limit: currentBusiness?.subscription?.planId === "starter" ? 500 : (currentBusiness?.subscription?.planId === "pro" ? 99999 : 50) },
                        { label: "Staff Accounts", used: currentBusiness?.teamMembers?.length || 0, limit: currentBusiness?.subscription?.planId === "starter" ? 5 : (currentBusiness?.subscription?.planId === "pro" ? 99 : 1) }
                    ].map(r => (
                        <div key={r.label} className="p-6 rounded-[2rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-4 hover:border-[var(--color-primary)]/20 transition-all group">
                            <div className="flex justify-between items-end">
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{r.label}</div>
                                <div className="text-sm font-black text-[var(--color-on-surface)]">{r.used} / {r.limit === 99999 ? "∞" : r.limit}</div>
                            </div>
                            <div className="h-2.5 rounded-full bg-[var(--color-surface-container-high)] overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000", (r.used / r.limit) > 0.8 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "bg-[var(--color-primary)] shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)]")}
                                    style={{ width: `${Math.min(100, (r.used / r.limit) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upgrade Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { id: "starter", name: "Starter", price: 19, features: ["500 Products", "5 Staff", "Email Support", "Advanced Analytics"], gateway: "Paystack", color: "from-blue-500 to-indigo-600" },
                    { id: "pro", name: "Pro", price: 49, features: ["Unlimited Products", "Unlimited Staff", "Custom Domain", "Priority 24/7 Support", "API Access"], gateway: "Stripe", color: "from-indigo-600 to-purple-600" }
                ].map(plan => (
                    <div key={plan.id} className="relative bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 space-y-8 flex flex-col hover:border-[var(--color-primary)]/40 transition-all shadow-[var(--shadow-m3-1)] hover:shadow-[var(--shadow-m3-2)] group overflow-hidden">
                        <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.08] transition-opacity -mr-8 -mt-8 rounded-full blur-2xl", plan.color)} />

                        <div className="flex justify-between items-start relative">
                            <div>
                                <h4 className="text-2xl font-black text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">{plan.name}</h4>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-sm font-bold opacity-40">USD</span>
                                    <span className="text-4xl font-black text-[var(--color-on-surface)] tracking-tighter">{plan.price}</span>
                                    <span className="text-xs font-bold opacity-40">/ mo</span>
                                </div>
                            </div>
                            <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg shadow-indigo-500/20", plan.color)}>
                                <Zap size={22} className="group-hover:scale-110 transition-transform" />
                            </div>
                        </div>

                        <ul className="space-y-4 flex-1 relative">
                            {plan.features.map(f => (
                                <li key={f} className="flex items-center gap-3 text-sm font-bold text-[var(--color-on-surface-variant)] opacity-70 group-hover:opacity-100 transition-opacity">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                    </div>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch("/api/billing/subscribe", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            planId: plan.id,
                                            gateway: plan.gateway,
                                            storeId: currentBusiness?._id
                                        })
                                    });
                                    const data = await res.json();
                                    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
                                    else throw new Error(data.error);
                                } catch (e: any) { alert(e.message); }
                            }}
                            className={cn("w-full h-14 rounded-2xl text-white font-black uppercase text-xs tracking-widest gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-none flex items-center justify-center bg-gradient-to-br", plan.color)}
                        >
                            Upgrade via {plan.gateway}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
