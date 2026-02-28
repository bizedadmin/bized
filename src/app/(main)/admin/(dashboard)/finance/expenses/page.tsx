"use client";

import React from "react";
import { TrendingDown, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HelpIcon } from "@/components/admin/HelpCenter";

export default function ExpensesPage() {
    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                            <TrendingDown size={24} />
                        </div>
                        Expenses <HelpIcon topic="expenseAccount" />
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Track business spending and operational costs (Schema.org PayAction).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" className="h-12 px-5 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                        <Plus size={18} /> Log Expense
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Food & Travel", value: "$420.00" },
                    { label: "Rent & Utils", value: "$2,500.00" },
                    { label: "Inventory", value: "$8,400.00" },
                    { label: "Subscripts", value: "$120.00" }
                ].map((cat, i) => (
                    <div key={i} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-4 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{cat.label}</span>
                        <div className="text-xl font-bold">{cat.value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-50" size={18} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none"
                        />
                    </div>
                    <Button variant="ghost" className="h-10 px-4 rounded-xl gap-2 text-xs font-bold">
                        <Filter size={14} /> More Filters
                    </Button>
                </div>
                <div className="p-20 text-center opacity-40">
                    <TrendingDown size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No recent expenses found.</p>
                </div>
            </div>
        </div>
    );
}
