"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { ArrowRightLeft, Search, RefreshCw, ExternalLink, Receipt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
    OrderProcessing: "bg-blue-100 text-blue-700",
    OrderPaymentDue: "bg-amber-100 text-amber-700",
    OrderDelivered: "bg-emerald-100 text-emerald-700",
    OrderCancelled: "bg-rose-100 text-rose-700",
    OrderProblem: "bg-orange-100 text-orange-700",
};

const POS_CHANNELS = ["Manual", "POS", "Phone", "WhatsApp"];

export default function POSTransactionsPage() {
    const { currentBusiness } = useBusiness();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchOrders = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders?storeId=${currentBusiness._id}&limit=200`);
            const data = await res.json();
            const all = data.orders ?? data ?? [];
            // Filter to POS-origin channels only
            setOrders(all.filter((o: any) => POS_CHANNELS.includes(o.orderChannel)));
        } catch { setOrders([]); }
        finally { setIsLoading(false); }
    }, [currentBusiness?._id]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = orders.filter(o =>
        o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(search.toLowerCase())
    );

    const fmt = (n: number, cur = "KES") => `${cur} ${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <ArrowRightLeft size={24} />
                        </div>
                        POS Transactions
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Orders created via Manual · POS · Phone · WhatsApp
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchOrders}
                        className="h-12 w-12 p-0 rounded-2xl border-[var(--color-outline-variant)]/30">
                        <RefreshCw size={18} />
                    </Button>
                    <Button onClick={() => router.push("/admin/pos")}
                        className="h-12 px-5 rounded-2xl gap-2 font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                        + New Sale
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40" />
                <input type="text" placeholder="Search by name or order number…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 text-sm font-bold text-[var(--color-on-surface)] placeholder:opacity-40 focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all" />
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="w-full h-64 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-[var(--color-surface-container)] flex items-center justify-center mb-4">
                        <Receipt size={28} className="opacity-20" />
                    </div>
                    <p className="font-black opacity-30">No POS transactions yet</p>
                    <p className="text-xs opacity-20 mt-1">Create a new sale from the Register</p>
                </div>
            ) : (
                <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-outline-variant)]/10">
                                {["Order #", "Customer", "Channel", "Items", "Total", "Payment", "Status", ""].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                            {filtered.map(o => (
                                <tr key={o._id} className="hover:bg-[var(--color-surface-container-low)] transition-colors group">
                                    <td className="px-5 py-4 font-mono font-black text-sm text-[var(--color-primary)]">{o.orderNumber ?? "—"}</td>
                                    <td className="px-5 py-4">
                                        <p className="font-black text-sm text-[var(--color-on-surface)]">{o.customer?.name ?? "—"}</p>
                                        <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50">{o.customer?.telephone}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                                            {o.orderChannel ?? "Manual"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">
                                        {o.orderedItem?.length ?? 0}
                                    </td>
                                    <td className="px-5 py-4 font-black text-sm text-[var(--color-on-surface)]">
                                        {fmt(o.totalPayable ?? o.price ?? 0, o.priceCurrency)}
                                    </td>
                                    <td className="px-5 py-4 text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">
                                        {o.paymentMethod ?? "—"}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[o.orderStatus] ?? "bg-gray-100 text-gray-600"}`}>
                                            {(o.orderStatus ?? "").replace("Order", "")}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Link href={`/admin/orders/${o._id}`}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-[var(--color-surface-container)] inline-flex text-[var(--color-primary)]">
                                            <ExternalLink size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
