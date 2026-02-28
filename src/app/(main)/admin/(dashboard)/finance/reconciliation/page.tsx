"use client";

import React from "react";
import { Scale, Upload, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HelpIcon } from "@/components/admin/HelpCenter";

export default function ReconciliationPage() {
    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Scale size={24} />
                        </div>
                        Reconciliation <HelpIcon topic="bankReconciliation" />
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Match your ledger transactions with bank statements.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" className="h-12 px-5 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                        <Upload size={18} /> Import Statement
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)]">
                    <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/10 pb-4 mb-6">
                        <h3 className="text-lg font-black text-[var(--color-on-surface)]">Unreconciled Items</h3>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="h-8 px-3 rounded-lg text-xs font-bold">Auto-Match</Button>
                        </div>
                    </div>

                    <div className="p-20 text-center opacity-40">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h4 className="font-black text-emerald-900">All caught up!</h4>
                        <p className="text-sm font-medium">All ledger items match your uploaded statements.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-6 rounded-[2rem]">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)] mb-4">Reconciliation Status</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold opacity-60">Ledger Balance</span>
                                <span className="font-black">$14,250.00</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold opacity-60">Statement Balance</span>
                                <span className="font-black">$14,250.00</span>
                            </div>
                            <div className="h-px bg-[var(--color-outline-variant)]/10" />
                            <div className="flex items-center justify-between text-sm text-emerald-600">
                                <span className="font-bold">Difference</span>
                                <span className="font-black">$0.00</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-6 rounded-[2rem] flex flex-col items-center text-center gap-3">
                        <Scale size={32} className="opacity-20" />
                        <p className="text-xs font-bold opacity-60">Reconciliation ensures your books are accurate by comparing them to real bank data.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
