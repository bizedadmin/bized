"use client";

import React, { useEffect, useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { LineChart, FileText, Download, Printer, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AccountLine {
    code: string;
    name: string;
    balance: number;
}

interface ReportData {
    period: { from: string; to: string };
    profitAndLoss: {
        revenue: AccountLine[];
        expenses: AccountLine[];
        totalRevenue: number;
        totalExpenses: number;
        grossProfit: number;
        netIncome: number;
    };
    balanceSheet: {
        assets: AccountLine[];
        liabilities: AccountLine[];
        equity: AccountLine[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
        balanced: boolean;
    };
}

export default function FinancialReportsPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("this-month");

    const getPeriodDates = (p: string) => {
        const now = new Date();
        if (p === "this-month") {
            const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
            return { from, to };
        }
        if (p === "last-month") {
            const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
            return { from, to };
        }
        if (p === "this-year") {
            const from = new Date(now.getFullYear(), 0, 1).toISOString();
            const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();
            return { from, to };
        }
        return {};
    };

    useEffect(() => {
        if (!currentBusiness?._id) return;
        setLoading(true);
        const { from, to } = getPeriodDates(period);
        fetch(`/api/finance/reports?storeId=${currentBusiness._id}&from=${from}&to=${to}`)
            .then(res => res.json())
            .then(data => {
                setReport(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [currentBusiness?._id, period]);

    const fmt = (n: number) =>
        `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const ListItem = ({ code, label, value, indent = false, bold = false, negative = false }: any) => (
        <div className={`flex items-center justify-between py-2 border-b border-[var(--color-outline-variant)]/5 ${indent ? "pl-6" : ""}`}>
            <div className="flex items-center gap-3">
                {code && <span className="font-mono text-[10px] opacity-30 w-10">{code}</span>}
                <span className={`${bold ? "font-black text-xs uppercase tracking-widest" : "text-sm font-medium"} text-[var(--color-on-surface-variant)]`}>
                    {label}
                </span>
            </div>
            <span className={`text-sm ${bold ? "font-black" : "font-bold"} ${negative && value > 0 ? "text-rose-600" : "text-[var(--color-on-surface)]"}`}>
                {negative && value > 0 ? `(${fmt(value)})` : fmt(value)}
            </span>
        </div>
    );

    if (isLoading || loading) return (
        <div className="p-8 space-y-4">
            <div className="w-full h-12 rounded-2xl bg-[var(--color-surface-container-low)] animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="w-full h-96 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" />
                <div className="w-full h-96 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" />
            </div>
        </div>
    );

    const pl = report?.profitAndLoss;
    const bs = report?.balanceSheet;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <LineChart size={24} />
                        </div>
                        Financial Reports
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Live data aggregated from ledger transactions · IFRS / GAAP aligned
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Period Selector */}
                    <div className="relative">
                        <select
                            value={period}
                            onChange={e => setPeriod(e.target.value)}
                            className="appearance-none h-12 pl-4 pr-10 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 rounded-2xl font-bold text-sm focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                        >
                            <option value="this-month">This Month</option>
                            <option value="last-month">Last Month</option>
                            <option value="this-year">This Year</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                    </div>
                    <Button variant="outline" className="h-12 px-5 rounded-2xl gap-2 font-bold border-[var(--color-outline-variant)]/30">
                        <Printer size={18} /> Print
                    </Button>
                    <Button variant="default" className="h-12 px-5 rounded-2xl gap-2 font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                        <Download size={18} /> Export
                    </Button>
                </div>
            </div>

            {/* No data state */}
            {!report && (
                <div className="p-16 rounded-3xl bg-[var(--color-surface-container-low)] text-center">
                    <FileText size={48} className="mx-auto opacity-20 mb-4" />
                    <p className="font-bold opacity-40">No report data available. Record some transactions first.</p>
                </div>
            )}

            {report && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profit & Loss */}
                    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 space-y-6 shadow-[var(--shadow-m3-1)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/10 pb-4">
                            <h3 className="text-xl font-black text-[var(--color-on-surface)]">Profit & Loss</h3>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                {new Date(report.period.from).toLocaleDateString()} – {new Date(report.period.to).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="space-y-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2">Revenue</p>
                            {pl?.revenue.length === 0 && (
                                <p className="text-sm opacity-40 font-medium py-2">No revenue recorded this period.</p>
                            )}
                            {pl?.revenue.map(r => (
                                <ListItem key={r.code} code={r.code} label={r.name} value={r.balance} />
                            ))}

                            <div className="mt-4 py-3 border-b border-[var(--color-outline-variant)]/20 flex justify-between">
                                <span className="text-xs font-black uppercase tracking-widest opacity-60">Total Revenue</span>
                                <span className="text-sm font-black text-[var(--color-on-surface)]">{fmt(pl?.totalRevenue ?? 0)}</span>
                            </div>

                            <div className="mt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2">Expenses</p>
                                {pl?.expenses.length === 0 && (
                                    <p className="text-sm opacity-40 font-medium py-2">No expenses recorded this period.</p>
                                )}
                                {pl?.expenses.map(e => (
                                    <ListItem key={e.code} code={e.code} label={e.name} value={e.balance} negative />
                                ))}
                            </div>

                            <div className="mt-6 p-6 rounded-3xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">Net Income</div>
                                    <div className={`text-3xl font-black mt-1 ${(pl?.netIncome ?? 0) < 0 ? "text-rose-600" : "text-[var(--color-on-surface)]"}`}>
                                        {(pl?.netIncome ?? 0) < 0 ? `(${fmt(pl?.netIncome ?? 0)})` : fmt(pl?.netIncome ?? 0)}
                                    </div>
                                </div>
                                <div className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${(pl?.netIncome ?? 0) >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                                    {(pl?.netIncome ?? 0) >= 0 ? "Profit" : "Loss"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Sheet */}
                    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 space-y-6 shadow-[var(--shadow-m3-1)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/10 pb-4">
                            <h3 className="text-xl font-black text-[var(--color-on-surface)]">Balance Sheet</h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${bs?.balanced ? "bg-emerald-500" : "bg-rose-500"}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                    {bs?.balanced ? "Balanced" : "Unbalanced"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2">Assets</p>
                                {bs?.assets.map(a => (
                                    <ListItem key={a.code} code={a.code} label={a.name} value={a.balance} />
                                ))}
                                <div className="mt-2 flex justify-between py-2">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Total Assets</span>
                                    <span className="text-sm font-black">{fmt(bs?.totalAssets ?? 0)}</span>
                                </div>
                            </div>

                            <div className="border-t border-[var(--color-outline-variant)]/10 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2">Liabilities</p>
                                {bs?.liabilities.map(l => (
                                    <ListItem key={l.code} code={l.code} label={l.name} value={l.balance} negative />
                                ))}
                                <div className="mt-2 flex justify-between py-2">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Total Liabilities</span>
                                    <span className="text-sm font-black text-rose-600">{fmt(bs?.totalLiabilities ?? 0)}</span>
                                </div>
                            </div>

                            <div className="border-t border-[var(--color-outline-variant)]/10 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Equity</p>
                                {bs?.equity.map(e => (
                                    <ListItem key={e.code} code={e.code} label={e.name} value={e.balance} />
                                ))}
                                <div className="mt-2 flex justify-between py-2">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Total Equity</span>
                                    <span className="text-sm font-black text-emerald-600">{fmt(bs?.totalEquity ?? 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
