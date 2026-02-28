"use client";

import React, { useEffect, useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Landmark, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

export default function FinanceOverviewPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        if (currentBusiness?._id) {
            fetch(`/api/finance/accounts?storeId=${currentBusiness._id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.accounts) setAccounts(data.accounts);
                });
        }
    }, [currentBusiness?._id]);

    if (isLoading) return <div className="p-8"><div className="w-full h-64 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    const totalCash = accounts.filter(a => a.type === "Asset").reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalLiabilities = accounts.filter(a => a.type === "Liability").reduce((sum, a) => sum + (a.balance || 0), 0);
    const netWorth = totalCash - totalLiabilities;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">Finance Overview</h1>
                <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60">High-level financial health and recent activity.</p>
            </div>

            {/* Top Analysis Cards using Material 3 style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4 group">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Landmark size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">
                            ${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Total Cash & Assets</div>
                    </div>
                </div>

                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">
                            ${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Total Liabilities</div>
                    </div>
                </div>

                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Wallet size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">
                            ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Net Worth</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] p-6 sm:p-8 flex flex-col min-h-[300px] justify-center text-center">
                    <TrendingUp size={48} className="mx-auto text-[var(--color-on-surface-variant)] opacity-20 mb-4" />
                    <h3 className="text-lg font-black text-[var(--color-on-surface)]">Cash Flow Schema</h3>
                    <p className="mt-2 text-sm text-[var(--color-on-surface-variant)] opacity-60">
                        Based on Schema.org FinancialProduct standards. Charts coming soon.
                    </p>
                </div>

                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] p-6 sm:p-8 flex flex-col min-h-[300px] justify-center text-center">
                    <DollarSign size={48} className="mx-auto text-[var(--color-on-surface-variant)] opacity-20 mb-4" />
                    <h3 className="text-lg font-black text-[var(--color-on-surface)]">Recent Transactions</h3>
                    <p className="mt-2 text-sm text-[var(--color-on-surface-variant)] opacity-60">
                        Recent journal entries automatically synchronized with your orders.
                    </p>
                </div>
            </div>
        </div>
    );
}
