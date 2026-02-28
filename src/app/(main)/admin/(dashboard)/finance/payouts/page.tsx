"use client";

import React from "react";
import { Wallet, Plus, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PayoutsPage() {
    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Wallet size={24} />
                        </div>
                        Payouts
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Manage bank withdrawals and transfers.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" className="h-12 px-5 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                        <Plus size={18} /> Request Payout
                    </Button>
                </div>
            </div>

            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] p-8 flex items-center gap-8 shadow-[var(--shadow-m3-1)]">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Available to Payout</span>
                    <div className="text-4xl font-black text-[var(--color-on-surface)]">$14,250.00</div>
                </div>
                <div className="h-12 w-px bg-[var(--color-outline-variant)]/20" />
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Pending Clearance</span>
                    <div className="text-xl font-bold opacity-60">$2,110.40</div>
                </div>
            </div>

            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                <div className="p-6 border-b border-[var(--color-outline-variant)]/10">
                    <h3 className="text-lg font-black text-[var(--color-on-surface)]">Payout History</h3>
                </div>
                <div className="p-20 text-center opacity-40">
                    <ArrowUpRight size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No payouts initiated yet.</p>
                </div>
            </div>
        </div>
    );
}
