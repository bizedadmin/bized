"use client";

import React from "react";
import { FilePieChart, Download, Calendar as CalendarIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HelpIcon } from "@/components/admin/HelpCenter";

export default function TaxReportsPage() {
    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <FilePieChart size={24} />
                        </div>
                        Tax Reports <HelpIcon topic="taxLiability" />
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Simplified tax preparation and liability tracking.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" className="h-12 px-5 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                        <Download size={18} /> Export for Accountant
                    </Button>
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Info size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="font-black text-sm text-blue-900 uppercase tracking-widest">Tax Configuration</h4>
                    <p className="text-sm text-blue-800/70 font-medium">
                        Your tax liability is currently calculated based on your default store location. You can adjust tax rules in Settings.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 space-y-8">
                    <h3 className="text-xl font-black text-[var(--color-on-surface)] flex items-center justify-between">
                        Sales Tax Liability
                        <Button variant="outline" className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2">
                            <CalendarIcon size={12} /> Q4 2025
                        </Button>
                    </h3>

                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Gross Taxable Sales</span>
                            <div className="text-4xl font-black text-[var(--color-on-surface)]">$12,450.00</div>
                        </div>

                        <div className="h-px bg-[var(--color-outline-variant)]/10" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tax Collected</span>
                                <div className="text-xl font-black text-emerald-600">$933.75</div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tax Paid on Purchases</span>
                                <div className="text-xl font-black text-rose-600">$120.40</div>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 flex flex-col gap-1 items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">Net Tax Owed</span>
                            <div className="text-3xl font-black text-[var(--color-on-surface)]">$813.35</div>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center opacity-40 min-h-[400px]">
                    <FilePieChart size={64} className="mb-6 opacity-20" />
                    <h3 className="text-xl font-black">VAT / GST Summary</h3>
                    <p className="text-sm font-medium mt-2 max-w-xs">
                        Additional tax jurisdictions and region-specific reports will appear here as they are configured.
                    </p>
                    <Button variant="outline" className="mt-8 h-10 px-6 rounded-xl font-bold">Add Jurisdiction</Button>
                </div>
            </div>
        </div>
    );
}
