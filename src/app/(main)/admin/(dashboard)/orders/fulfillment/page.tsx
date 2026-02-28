"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Truck, Search, Package, CheckCircle2, Clock, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Fulfillment {
    _id: string;
    orderId: string;
    orderNumber: string;
    customer?: { name: string };
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
    deliveryStatus: string;
    deliveryMode: string;
    expectedArrivalFrom?: string;
    expectedArrivalUntil?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
    createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
    Pending: "bg-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30",
    Processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Packed: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    Shipped: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Failed: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    Returned: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const STAGES = ["Pending", "Processing", "Packed", "Shipped", "Delivered"];

export default function FulfillmentPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchFulfillments = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setLoading(true);
        try {
            const ordersRes = await fetch(`/api/orders?storeId=${currentBusiness._id}`);
            const ordersData = await ordersRes.json();
            const allOrders: any[] = ordersData.orders ?? [];
            setOrders(allOrders);

            const slice = allOrders.slice(0, 20);
            const results = await Promise.all(
                slice.map(o =>
                    fetch(`/api/orders/${o._id}/fulfillments?storeId=${currentBusiness._id}`)
                        .then(r => r.json())
                        .then(d => (d.fulfillments ?? []).map((f: any) => ({
                            ...f,
                            orderNumber: o.orderNumber,
                            customer: o.customer,
                        })))
                        .catch(() => [])
                )
            );
            setFulfillments(results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } finally {
            setLoading(false);
        }
    }, [currentBusiness?._id]);

    useEffect(() => { fetchFulfillments(); }, [fetchFulfillments]);

    const filtered = fulfillments.filter(f =>
        f.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        f.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.carrier?.toLowerCase().includes(search.toLowerCase()) ||
        f.trackingNumber?.toLowerCase().includes(search.toLowerCase() ?? "")
    );

    const stageCounts = STAGES.reduce<Record<string, number>>((acc, s) => {
        acc[s] = fulfillments.filter(f => f.deliveryStatus === s).length;
        return acc;
    }, {});

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Truck size={24} />
                        </div>
                        Fulfillment
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        All shipments across orders · schema.org/ParcelDelivery
                    </p>
                </div>
                <Button variant="outline" onClick={fetchFulfillments}
                    className="h-12 w-12 p-0 rounded-2xl border-[var(--color-outline-variant)]/30">
                    <RefreshCw size={18} />
                </Button>
            </div>

            {/* Pipeline stage counts */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {STAGES.map(stage => (
                    <div key={stage} className="p-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${stage === "Delivered" ? "bg-emerald-500" :
                                    stage === "Shipped" ? "bg-amber-500" :
                                        stage === "Packed" ? "bg-violet-500" :
                                            stage === "Processing" ? "bg-blue-500" :
                                                "bg-[var(--color-outline-variant)]"
                                }`} />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{stage}</span>
                        </div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)]">
                            {loading ? <div className="h-8 w-8 bg-[var(--color-surface-container-high)] rounded animate-pulse" /> : stageCounts[stage] ?? 0}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                        <input type="text" placeholder="Search by order, carrier, tracking..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-all" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[var(--color-surface-container)]/50 text-[var(--color-on-surface-variant)] text-xs uppercase tracking-wider font-extrabold border-b border-[var(--color-outline-variant)]/10">
                            <tr>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Mode</th>
                                <th className="px-6 py-4">Carrier</th>
                                <th className="px-6 py-4">Tracking</th>
                                <th className="px-6 py-4">ETA</th>
                                <th className="px-6 py-4">Status</th>
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
                            ) : filtered.map(f => (
                                <tr key={f._id} className="hover:bg-[var(--color-surface-container-high)] transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-primary)]">{f.orderNumber}</td>
                                    <td className="px-6 py-4 font-bold">{f.customer?.name ?? "—"}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                                            {f.deliveryMode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold opacity-70">{f.carrier ?? "—"}</td>
                                    <td className="px-6 py-4">
                                        {f.trackingUrl ? (
                                            <a href={f.trackingUrl} target="_blank" rel="noreferrer"
                                                className="font-mono text-[11px] text-[var(--color-primary)] underline underline-offset-2">
                                                {f.trackingNumber ?? "Track"}
                                            </a>
                                        ) : (
                                            <span className="font-mono text-[11px] opacity-40">{f.trackingNumber ?? "—"}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium opacity-60">
                                        {f.expectedArrivalUntil
                                            ? new Date(f.expectedArrivalUntil).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                            : "—"
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[f.deliveryStatus] ?? ""}`}>
                                            {f.deliveryStatus === "Delivered" ? <CheckCircle2 size={12} /> :
                                                f.deliveryStatus === "Shipped" ? <Truck size={12} /> :
                                                    f.deliveryStatus === "Packed" ? <Package size={12} /> :
                                                        <Clock size={12} />}
                                            {f.deliveryStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/orders/${f.orderId}`}>
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
                                        <Truck size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">No shipments yet.</p>
                                        <p className="text-xs mt-1">Open an order and create a shipment to see it here.</p>
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
