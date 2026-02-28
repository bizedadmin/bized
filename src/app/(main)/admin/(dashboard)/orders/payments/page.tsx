"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { CreditCard, Search, CheckCircle2, Clock, XCircle, RefreshCw, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface OrderPayment {
    _id: string;
    orderId: string;
    orderNumber: string;
    amount: number;
    priceCurrency: string;
    paymentMethod: string;
    paymentGateway: string;
    paymentStatus: string;
    paymentRef?: string;
    notes?: string;
    processedAt: string;
    createdAt: string;
}

export default function PaymentsPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [payments, setPayments] = useState<OrderPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchPayments = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setLoading(true);
        try {
            // Fetch all orders, then collect their payments
            const ordersRes = await fetch(`/api/orders?storeId=${currentBusiness._id}`);
            const ordersData = await ordersRes.json();
            const orders: any[] = ordersData.orders ?? [];

            // Fetch payments for each order in parallel (max 20 at a time)
            const slice = orders.slice(0, 20);
            const results = await Promise.all(
                slice.map(o =>
                    fetch(`/api/orders/${o._id}/payments?storeId=${currentBusiness._id}`)
                        .then(r => r.json())
                        .then(d => (d.payments ?? []).map((p: any) => ({
                            ...p,
                            orderNumber: o.orderNumber,
                            priceCurrency: o.priceCurrency ?? "USD",
                        })))
                        .catch(() => [])
                )
            );
            setPayments(results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } finally {
            setLoading(false);
        }
    }, [currentBusiness?._id]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const filtered = payments.filter(p =>
        p.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.paymentMethod?.toLowerCase().includes(search.toLowerCase()) ||
        p.paymentGateway?.toLowerCase().includes(search.toLowerCase()) ||
        p.paymentRef?.toLowerCase().includes(search.toLowerCase() ?? "")
    );

    const totalCollected = payments.filter(p => p.paymentStatus === "PaymentComplete").reduce((s, p) => s + p.amount, 0);
    const totalPending = payments.filter(p => p.paymentStatus === "PaymentDue").reduce((s, p) => s + p.amount, 0);
    const currency = payments[0]?.priceCurrency ?? "USD";
    const fmt = (n: number) => `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const STATUS_STYLES: Record<string, string> = {
        PaymentComplete: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        PaymentDue: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        PaymentDeclined: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        PaymentAutoPay: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        PaymentRefunded: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <CreditCard size={24} />
                        </div>
                        Payments
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        All payment transactions across orders · schema.org/PayAction
                    </p>
                </div>
                <Button variant="outline" onClick={fetchPayments}
                    className="h-12 w-12 p-0 rounded-2xl border-[var(--color-outline-variant)]/30">
                    <RefreshCw size={18} />
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Collected", value: fmt(totalCollected), color: "text-emerald-600" },
                    { label: "Awaiting Payment", value: fmt(totalPending), color: "text-amber-600" },
                    { label: "Transactions", value: payments.length, color: "text-[var(--color-primary)]" },
                ].map(s => (
                    <div key={s.label} className="p-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.label}</span>
                        <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                        <input type="text" placeholder="Search by order, method, ref..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-all" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[var(--color-surface-container)]/50 text-[var(--color-on-surface-variant)] text-xs uppercase tracking-wider font-extrabold border-b border-[var(--color-outline-variant)]/10">
                            <tr>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Gateway</th>
                                <th className="px-6 py-4">Ref</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 rounded bg-[var(--color-surface-container-high)] animate-pulse w-16" />
                                        </td>
                                    ))}</tr>
                                ))
                            ) : filtered.map(p => (
                                <tr key={p._id} className="hover:bg-[var(--color-surface-container-high)] transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-primary)]">{p.orderNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                                            {p.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold opacity-60">{p.paymentGateway}</td>
                                    <td className="px-6 py-4 font-mono text-[11px] opacity-40">{p.paymentRef ?? "—"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[p.paymentStatus] ?? ""}`}>
                                            {p.paymentStatus === "PaymentComplete" ? <CheckCircle2 size={12} /> :
                                                p.paymentStatus === "PaymentDue" ? <Clock size={12} /> : <XCircle size={12} />}
                                            {p.paymentStatus.replace("Payment", "")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium opacity-60">
                                        {new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-[var(--color-on-surface)]">
                                        {fmt(p.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/orders/${p.orderId}`}>
                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowUpRight size={16} />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center opacity-40">
                                        <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">No payments recorded yet.</p>
                                        <p className="text-xs mt-1">Payments will appear here when orders are paid.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
