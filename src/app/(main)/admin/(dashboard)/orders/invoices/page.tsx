"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Receipt, Search, Plus, CheckCircle2, Clock, XCircle, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface OrderInvoice {
    _id: string;
    orderId: string;
    orderNumber: string;
    invoiceNumber: string;
    paymentStatus: string;
    totalPaymentDue: number;
    priceCurrency: string;
    paymentDueDate?: string;
    description?: string;
    createdAt: string;
    customer?: { name: string };
}

const STATUS_STYLES: Record<string, string> = {
    PaymentDue: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    PaymentAutoPay: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    PaymentComplete: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    PaymentDeclined: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    PaymentRefunded: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function OrderInvoicesPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [invoices, setInvoices] = useState<OrderInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchInvoices = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setLoading(true);
        try {
            const ordersRes = await fetch(`/api/orders?storeId=${currentBusiness._id}`);
            const ordersData = await ordersRes.json();
            const allOrders: any[] = ordersData.orders ?? [];

            const slice = allOrders.slice(0, 20);
            const results = await Promise.all(
                slice.map(o =>
                    fetch(`/api/orders/${o._id}/invoices?storeId=${currentBusiness._id}`)
                        .then(r => r.json())
                        .then(d => (d.invoices ?? []).map((inv: any) => ({
                            ...inv,
                            orderNumber: o.orderNumber,
                            customer: o.customer,
                            priceCurrency: inv.priceCurrency ?? o.priceCurrency ?? "USD",
                        })))
                        .catch(() => [])
                )
            );
            setInvoices(results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } finally {
            setLoading(false);
        }
    }, [currentBusiness?._id]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const filtered = invoices.filter(i =>
        i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        i.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        i.customer?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const currency = invoices[0]?.priceCurrency ?? "USD";
    const fmt = (n: number, cur = currency) =>
        `${cur} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const totalInvoiced = invoices.reduce((s, i) => s + i.totalPaymentDue, 0);
    const totalPaid = invoices.filter(i => i.paymentStatus === "PaymentComplete").length;
    const totalOutstanding = invoices.filter(i => i.paymentStatus === "PaymentDue" || i.paymentStatus === "PaymentAutoPay").length;
    const totalOverdue = invoices.filter(i => i.paymentStatus === "PaymentDue" && i.paymentDueDate && new Date(i.paymentDueDate) < new Date()).length;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Receipt size={24} />
                        </div>
                        Order Invoices
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        All invoices across orders · schema.org/Invoice
                    </p>
                </div>
                <Button variant="outline" onClick={fetchInvoices}
                    className="h-12 w-12 p-0 rounded-2xl border-[var(--color-outline-variant)]/30">
                    <RefreshCw size={18} />
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Invoiced", value: fmt(totalInvoiced), color: "text-[var(--color-primary)]" },
                    { label: "Paid", value: totalPaid, color: "text-emerald-600" },
                    { label: "Outstanding", value: totalOutstanding, color: "text-amber-600" },
                    { label: "Overdue", value: totalOverdue, color: "text-rose-600" },
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
                        <input type="text" placeholder="Search by invoice, order, customer..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-all" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[var(--color-surface-container)]/50 text-[var(--color-on-surface-variant)] text-xs uppercase tracking-wider font-extrabold border-b border-[var(--color-outline-variant)]/10">
                            <tr>
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 rounded bg-[var(--color-surface-container-high)] animate-pulse w-16" />
                                        </td>
                                    ))}</tr>
                                ))
                            ) : filtered.map(inv => {
                                const isOverdue = inv.paymentStatus === "PaymentDue" && inv.paymentDueDate && new Date(inv.paymentDueDate) < new Date();
                                return (
                                    <tr key={inv._id} className="hover:bg-[var(--color-surface-container-high)] transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-primary)]">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 font-mono text-xs font-bold opacity-60">{inv.orderNumber}</td>
                                        <td className="px-6 py-4 font-bold">{inv.customer?.name ?? "—"}</td>
                                        <td className="px-6 py-4 text-sm opacity-60 max-w-[180px] truncate">{inv.description ?? "—"}</td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {inv.paymentDueDate ? (
                                                <span className={isOverdue ? "text-rose-600 font-bold" : "opacity-60"}>
                                                    {new Date(inv.paymentDueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                    {isOverdue && " ⚠"}
                                                </span>
                                            ) : <span className="opacity-30">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[inv.paymentStatus] ?? ""}`}>
                                                {inv.paymentStatus === "PaymentComplete" ? <CheckCircle2 size={12} /> :
                                                    inv.paymentStatus === "PaymentDue" ? <Clock size={12} /> : <XCircle size={12} />}
                                                {inv.paymentStatus.replace("Payment", "")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-[var(--color-on-surface)]">
                                            {fmt(inv.totalPaymentDue, inv.priceCurrency)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/orders/${inv.orderId}`}>
                                                <Button variant="text" className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowUpRight size={16} />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center opacity-40">
                                        <Receipt size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">No invoices yet.</p>
                                        <p className="text-xs mt-1">Invoices are created automatically when orders are placed.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-xs text-center opacity-30 font-medium">
                Order-level invoices only. For accounting invoices see Finance → Invoices.
            </p>
        </div>
    );
}
