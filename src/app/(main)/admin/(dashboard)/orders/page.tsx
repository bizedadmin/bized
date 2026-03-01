"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import {
    ShoppingBag, Search, Plus, ArrowUpRight, Package,
    Clock, CheckCircle2, XCircle, Truck, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrderSummarySheet } from "@/components/admin/OrderSummarySheet";

type OrderStatus =
    | "OrderPaymentDue" | "OrderProcessing" | "OrderShipped"
    | "OrderPickupAvailable" | "OrderDelivered" | "OrderCancelled" | "OrderReturned";

type PaymentStatus = "PaymentDue" | "PaymentComplete" | "PaymentDeclined" | "PaymentAutoPay" | "PaymentRefunded";

interface Order {
    _id: string;
    orderNumber: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    fulfillmentStatus: string;
    orderChannel: string;
    customer: { name: string; telephone?: string; email?: string };
    orderedItem: any[];
    price: number;
    totalPayable: number;
    amountPaid: number;
    amountDue: number;
    priceCurrency: string;
    createdAt: string;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
    OrderPaymentDue: "Payment Due",
    OrderProcessing: "Processing",
    OrderShipped: "Shipped",
    OrderPickupAvailable: "Ready for Pickup",
    OrderDelivered: "Delivered",
    OrderCancelled: "Cancelled",
    OrderReturned: "Returned",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
    OrderPaymentDue: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    OrderProcessing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    OrderShipped: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    OrderPickupAvailable: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    OrderDelivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    OrderCancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    OrderReturned: "bg-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30",
};

const STATUS_TABS: Array<{ label: string; value: string }> = [
    { label: "All", value: "" },
    { label: "Payment Due", value: "OrderPaymentDue" },
    { label: "Processing", value: "OrderProcessing" },
    { label: "Shipped", value: "OrderShipped" },
    { label: "Delivered", value: "OrderDelivered" },
    { label: "Cancelled", value: "OrderCancelled" },
];

const PAY_STYLES: Record<PaymentStatus, string> = {
    PaymentDue: "text-amber-600",
    PaymentAutoPay: "text-blue-600",
    PaymentComplete: "text-emerald-600",
    PaymentDeclined: "text-rose-600",
    PaymentRefunded: "text-rose-600",
};

export default function OrdersPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("");
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setLoading(true);
        try {
            const qs = new URLSearchParams({ storeId: currentBusiness._id });
            if (activeTab) qs.set("status", activeTab);
            const res = await fetch(`/api/orders?${qs}`);
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
        } catch { }
        setLoading(false);
    }, [currentBusiness?._id, activeTab]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = orders.filter(o =>
        o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(search.toLowerCase())
    );

    const fmt = (n: number, currency = "USD") =>
        `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    // Summary counts
    const counts = {
        total: orders.length,
        payDue: orders.filter(o => o.orderStatus === "OrderPaymentDue").length,
        processing: orders.filter(o => o.orderStatus === "OrderProcessing").length,
        delivered: orders.filter(o => o.orderStatus === "OrderDelivered").length,
    };

    if (isLoading) return <div className="p-8"><div className="w-full h-96 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    return (
        <>
            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <ShoppingBag size={24} />
                            </div>
                            All Orders
                        </h1>
                        <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                            schema.org/Order · {counts.total} total
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchOrders} className="h-12 w-12 p-0 rounded-2xl border-[var(--color-outline-variant)]/30">
                            <RefreshCw size={18} />
                        </Button>
                        <Button
                            disabled={!currentBusiness?._id}
                            onClick={() => router.push("/admin/pos")}
                            className="h-12 px-5 rounded-2xl gap-2 font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                            <Plus size={18} /> New Order
                        </Button>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total", value: counts.total, color: "text-[var(--color-primary)]" },
                        { label: "Payment Due", value: counts.payDue, color: "text-amber-600" },
                        { label: "Processing", value: counts.processing, color: "text-blue-600" },
                        { label: "Delivered", value: counts.delivered, color: "text-emerald-600" },
                    ].map(s => (
                        <div key={s.label} className="p-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.label}</span>
                            <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-[var(--color-outline-variant)]/10 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                            <input type="text" placeholder="Search by name or order #..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-all" />
                        </div>
                        {/* Status tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 w-full sm:w-auto shrink-0">
                            {STATUS_TABS.map(tab => (
                                <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${activeTab === tab.value
                                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                                        : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]"
                                        }`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--color-surface-container)]/50 text-[var(--color-on-surface-variant)] text-xs uppercase tracking-wider font-extrabold border-b border-[var(--color-outline-variant)]/10">
                                <tr>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Channel</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 9 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 rounded bg-[var(--color-surface-container-high)] animate-pulse w-16" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : filtered.map(order =>
                                    <tr
                                        key={order._id}
                                        className="hover:bg-[var(--color-surface-container-high)] transition-colors group cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-primary)]">{order.orderNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[var(--color-on-surface)]">{order.customer?.name}</span>
                                                <span className="text-xs opacity-50">{order.customer?.telephone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                                                {order.orderChannel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{order.orderedItem?.length ?? 0}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[order.orderStatus]}`}>
                                                {order.orderStatus === "OrderDelivered" ? <CheckCircle2 size={12} /> :
                                                    order.orderStatus === "OrderShipped" ? <Truck size={12} /> :
                                                        order.orderStatus === "OrderCancelled" ? <XCircle size={12} /> :
                                                            order.orderStatus === "OrderProcessing" ? <Package size={12} /> :
                                                                <Clock size={12} />}
                                                {STATUS_LABEL[order.orderStatus]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-black ${PAY_STYLES[order.paymentStatus]}`}>
                                                    {order.paymentStatus.replace("Payment", "")}
                                                </span>
                                                {order.amountDue > 0 && (
                                                    <span className="text-[10px] opacity-40 font-medium">
                                                        Due: {fmt(order.amountDue, order.priceCurrency)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium opacity-60">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-[var(--color-on-surface)]">
                                            {fmt(order.totalPayable, order.priceCurrency)}
                                        </td>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                            <Link href={`/admin/orders/${order._id}?from=${encodeURIComponent("/admin/orders")}`}>
                                                <Button variant="text" className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowUpRight size={16} />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )}

                                {!loading && filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-20 text-center opacity-40">
                                            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-bold">No orders found.</p>
                                            <p className="text-xs mt-1">Orders placed through your storefront will appear here.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Order Summary Sheet */}
            <OrderSummarySheet
                order={selectedOrder}
                open={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                fromPath="/admin/orders"
            />
        </>
    );
}

