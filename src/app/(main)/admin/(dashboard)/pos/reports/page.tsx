"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { BarChartHorizontal, RefreshCw, TrendingUp, ShoppingCart, Banknote, Smartphone, CreditCard, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const POS_CHANNELS = ["Manual", "POS", "Phone", "WhatsApp"];
const PAYMENT_ICONS: Record<string, React.ElementType> = {
    Cash: Banknote, "M-Pesa": Smartphone, Card: CreditCard, "Bank Transfer": Building2
};

export default function POSReportsPage() {
    const { currentBusiness } = useBusiness();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<"today" | "week" | "month">("today");

    const fetchOrders = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders?storeId=${currentBusiness._id}&limit=500`);
            const data = await res.json();
            const all = (data.orders ?? data ?? []).filter((o: any) => POS_CHANNELS.includes(o.orderChannel));
            setOrders(all);
        } catch { setOrders([]); }
        finally { setIsLoading(false); }
    }, [currentBusiness?._id]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // Filter by period
    const now = new Date();
    const start = period === "today"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : period === "week"
            ? new Date(now.getTime() - 7 * 86400000)
            : new Date(now.getFullYear(), now.getMonth(), 1);

    const filtered = orders.filter(o => {
        const d = new Date(o.orderDate ?? o.createdAt ?? 0);
        return d >= start;
    });

    const total = filtered.reduce((s, o) => s + (o.totalPayable ?? o.price ?? 0), 0);
    const orderCount = filtered.length;
    const avg = orderCount > 0 ? total / orderCount : 0;
    const currency = currentBusiness?.currency ?? "KES";
    const fmt = (n: number) => `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    // Channel breakdown
    const byChannel = POS_CHANNELS.map(ch => ({
        ch,
        count: filtered.filter(o => o.orderChannel === ch).length,
        total: filtered.filter(o => o.orderChannel === ch).reduce((s, o) => s + (o.totalPayable ?? o.price ?? 0), 0),
    })).filter(x => x.count > 0);

    // Payment breakdown
    const payKeys = Array.from(new Set(filtered.map(o => o.paymentMethod ?? "Unknown")));
    const byPayment = payKeys.map(key => ({
        key,
        count: filtered.filter(o => (o.paymentMethod ?? "Unknown") === key).length,
        total: filtered.filter(o => (o.paymentMethod ?? "Unknown") === key).reduce((s, o) => s + (o.totalPayable ?? o.price ?? 0), 0),
    }));

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <BarChartHorizontal size={24} />
                        </div>
                        POS Reports
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Sales summary from all manual channels
                    </p>
                </div>
                <Button variant="outline" onClick={fetchOrders}
                    className="h-12 w-12 p-0 rounded-2xl border-[var(--color-outline-variant)]/30">
                    <RefreshCw size={18} />
                </Button>
            </div>

            {/* Period tabs */}
            <div className="flex gap-1 bg-[var(--color-surface-container)] rounded-2xl p-1 w-fit">
                {(["today", "week", "month"] as const).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                        className={`px-5 py-2 rounded-xl text-sm font-black capitalize transition-all ${period === p
                                ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-[var(--shadow-m3-1)]"
                                : "text-[var(--color-on-surface-variant)] opacity-50 hover:opacity-80"
                            }`}>{p}</button>
                ))}
            </div>

            {isLoading ? (
                <div className="w-full h-48 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" />
            ) : (
                <>
                    {/* KPI cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total Sales", value: fmt(total), icon: TrendingUp },
                            { label: "Transactions", value: orderCount, icon: ShoppingCart },
                            { label: "Avg. Order", value: fmt(avg), icon: Banknote },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-[var(--color-surface)] rounded-[1.75rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-5 text-center">
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-3">
                                    <Icon size={18} />
                                </div>
                                <p className="text-xl font-black text-[var(--color-on-surface)]">{value}</p>
                                <p className="text-xs font-medium text-[var(--color-on-surface-variant)] opacity-50 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Channel breakdown */}
                    {byChannel.length > 0 && (
                        <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6">
                            <h3 className="font-black text-sm uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-4">By Channel</h3>
                            <div className="space-y-3">
                                {byChannel.map(({ ch, count, total: chTotal }) => (
                                    <div key={ch} className="flex items-center gap-4">
                                        <span className="w-20 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 shrink-0">{ch}</span>
                                        <div className="flex-1 h-2 bg-[var(--color-surface-container)] rounded-full overflow-hidden">
                                            <div className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                                                style={{ width: `${total > 0 ? (chTotal / total) * 100 : 0}%` }} />
                                        </div>
                                        <span className="text-sm font-black text-[var(--color-on-surface)] shrink-0 w-36 text-right">{fmt(chTotal)}</span>
                                        <span className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-40 shrink-0 w-16 text-right">{count} sales</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment breakdown */}
                    {byPayment.length > 0 && (
                        <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6">
                            <h3 className="font-black text-sm uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-4">By Payment Method</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {byPayment.map(({ key, count, total: pt }) => {
                                    const Icon = PAYMENT_ICONS[key] ?? Banknote;
                                    return (
                                        <div key={key} className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm text-[var(--color-on-surface)]">{key}</p>
                                                <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50">{count} transaction{count !== 1 ? "s" : ""}</p>
                                            </div>
                                            <p className="font-black text-sm text-[var(--color-primary)] shrink-0">{fmt(pt)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-on-surface-variant)] opacity-30">
                            <p className="font-black">No POS sales in this period</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
