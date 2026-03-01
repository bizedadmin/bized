"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import {
    ShoppingBag, Search, RefreshCw, ExternalLink, Package,
    Phone, CreditCard, Banknote, Smartphone, Building2,
    Clock, CheckCircle2, XCircle, AlertCircle,
    TrendingUp, Receipt, Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { OrderSummarySheet } from "@/components/admin/OrderSummarySheet";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    OrderProcessing: { label: "Processing", color: "text-blue-700", bg: "bg-blue-100", icon: Clock },
    OrderPaymentDue: { label: "Payment Due", color: "text-amber-700", bg: "bg-amber-100", icon: AlertCircle },
    OrderDelivered: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle2 },
    OrderCancelled: { label: "Cancelled", color: "text-rose-700", bg: "bg-rose-100", icon: XCircle },
    OrderProblem: { label: "Problem", color: "text-orange-700", bg: "bg-orange-100", icon: AlertCircle },
};

const PAYMENT_ICONS: Record<string, React.ElementType> = {
    Cash: Banknote,
    Card: CreditCard,
    "M-Pesa": Smartphone,
    "Bank Transfer": Building2,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function POSOrdersPage() {
    const { currentBusiness } = useBusiness();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders?storeId=${currentBusiness._id}&limit=500`);
            const data = await res.json();
            const all = data.orders ?? data ?? [];
            // Filter to POS channel only
            setOrders(all.filter((o: any) => o.orderChannel === "POS"));
        } catch { setOrders([]); }
        finally { setIsLoading(false); }
    }, [currentBusiness?._id]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const currency = currentBusiness?.currency ?? "KES";
    const fmt = (n: number) => `${currency} ${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const filtered = orders.filter(o => {
        const matchSearch =
            o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
            o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
            o.customer?.telephone?.includes(search);
        const matchStatus = statusFilter === "all" || o.orderStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    // ── Stats ──
    const totalRevenue = orders.reduce((s, o) => s + (o.totalPayable ?? o.price ?? 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const processingCount = orders.filter(o => o.orderStatus === "OrderProcessing").length;
    const deliveredCount = orders.filter(o => o.orderStatus === "OrderDelivered").length;

    const statCards = [
        { label: "POS Orders", value: orders.length, icon: ShoppingBag, color: "var(--color-primary)" },
        { label: "Total Revenue", value: fmt(totalRevenue), icon: TrendingUp, color: "oklch(0.55 0.15 285)" },
        { label: "Avg. Order", value: fmt(avgOrderValue), icon: Receipt, color: "oklch(0.55 0.15 180)" },
        { label: "Processing", value: processingCount, icon: Clock, color: "oklch(0.6 0.15 50)" },
        { label: "Delivered", value: deliveredCount, icon: CheckCircle2, color: "oklch(0.55 0.15 145)" },
    ];

    const allStatuses = Array.from(new Set(orders.map(o => o.orderStatus).filter(Boolean)));

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <ShoppingBag size={24} />
                        </div>
                        POS Orders
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[64px]">
                        Orders created through the Point of Sale register
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchOrders}
                        className="h-12 w-12 p-0 rounded-2xl border-[var(--color-outline-variant)]/30 hover:bg-[var(--color-surface-container)] active:scale-95 transition-all"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </Button>
                    <Button
                        onClick={() => router.push("/admin/pos")}
                        className="h-12 px-6 rounded-2xl gap-2 font-black bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-m3-2)] hover:shadow-[var(--shadow-m3-3)] active:scale-95 transition-all"
                    >
                        <Plus size={18} strokeWidth={3} /> New Sale
                    </Button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="p-5 rounded-[1.75rem] bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-3 group hover:shadow-[var(--shadow-m3-2)] transition-all"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${stat.color}18`, color: stat.color }}
                        >
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-black text-[var(--color-on-surface)] tracking-tight leading-tight">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mt-0.5">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] group-focus-within:opacity-100 transition-all" />
                    <input
                        type="text"
                        placeholder="Search by name, phone or order number…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 text-sm font-bold text-[var(--color-on-surface)] placeholder:opacity-40 focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all shadow-[var(--shadow-m3-1)]"
                    />
                </div>

                {/* Status filter pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {["all", ...allStatuses].map(s => {
                        const meta = STATUS_META[s];
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "h-10 px-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all active:scale-95",
                                    statusFilter === s
                                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md"
                                        : "bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)] opacity-60 hover:opacity-100"
                                )}
                            >
                                {s === "all" ? "All" : (meta?.label ?? s.replace("Order", ""))}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Content ── */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 rounded-2xl bg-[var(--color-surface-container-low)] animate-pulse border border-[var(--color-outline-variant)]/10" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-[var(--color-surface-container-low)]/30 rounded-[2.5rem] border-2 border-dashed border-[var(--color-outline-variant)]/10">
                    <div className="w-20 h-20 rounded-[2rem] bg-[var(--color-surface-container)] flex items-center justify-center mb-6">
                        <ShoppingBag size={32} className="text-[var(--color-on-surface-variant)] opacity-20" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-on-surface)] opacity-40">No POS orders found</h3>
                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-30 mt-2 max-w-xs mx-auto">
                        {search || statusFilter !== "all"
                            ? "Try adjusting your search or filter."
                            : "Create your first POS sale from the Register."}
                    </p>
                    {(search || statusFilter !== "all") && (
                        <button
                            onClick={() => { setSearch(""); setStatusFilter("all"); }}
                            className="mt-6 text-sm font-black text-[var(--color-primary)] hover:opacity-80 transition-opacity"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <motion.div layout className="space-y-2">
                    {/* Table header */}
                    <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3">
                        {["Order", "Customer", "Items", "Total", "Payment", "Status", ""].map(h => (
                            <span key={h} className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">{h}</span>
                        ))}
                    </div>

                    <AnimatePresence>
                        {filtered.map(order => {
                            const meta = STATUS_META[order.orderStatus];
                            const StatusIcon = meta?.icon ?? Clock;
                            const PayIcon = PAYMENT_ICONS[order.paymentMethod] ?? Receipt;
                            const itemCount = order.orderedItem?.length ?? 0;
                            const orderDate = new Date(order.orderDate || order.createdAt);

                            return (
                                <motion.div
                                    key={order._id}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] overflow-hidden hover:shadow-[var(--shadow-m3-2)] transition-all cursor-pointer"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center group">
                                        {/* Order */}
                                        <div>
                                            <p className="font-mono font-black text-sm text-[var(--color-primary)]">{order.orderNumber ?? "—"}</p>
                                            <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-40 mt-0.5">
                                                {orderDate.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>

                                        {/* Customer */}
                                        <div className="hidden sm:block">
                                            <p className="font-black text-sm text-[var(--color-on-surface)] truncate max-w-[150px]">{order.customer?.name ?? "—"}</p>
                                            {order.customer?.telephone && (
                                                <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-40">
                                                    <Phone size={9} /> {order.customer.telephone}
                                                </div>
                                            )}
                                        </div>

                                        {/* Items count */}
                                        <div className="hidden sm:flex items-center gap-1.5">
                                            <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-center">
                                                <Package size={12} className="text-[var(--color-on-surface-variant)] opacity-60" />
                                            </div>
                                            <span className="font-black text-sm text-[var(--color-on-surface-variant)] opacity-60">{itemCount}</span>
                                        </div>

                                        {/* Total */}
                                        <div className="hidden sm:block">
                                            <p className="font-black text-sm text-[var(--color-on-surface)]">
                                                {fmt(order.totalPayable ?? order.price ?? 0)}
                                            </p>
                                        </div>

                                        {/* Payment */}
                                        <div className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">
                                            <PayIcon size={14} className="text-[var(--color-primary)]" />
                                            {order.paymentMethod ?? "—"}
                                        </div>

                                        {/* Status */}
                                        <div className="hidden sm:block">
                                            {meta ? (
                                                <span className={cn("text-[10px] font-black px-2.5 py-1.5 rounded-full inline-flex items-center gap-1.5", meta.bg, meta.color)}>
                                                    <StatusIcon size={10} /> {meta.label}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-600">
                                                    {(order.orderStatus ?? "").replace("Order", "")}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                            <Link
                                                href={`/admin/orders/${order._id}?from=${encodeURIComponent("/admin/pos/orders")}`}
                                                className="w-8 h-8 rounded-xl hover:bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <ExternalLink size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    <p className="text-center text-xs font-bold text-[var(--color-on-surface-variant)] opacity-30 pt-2">
                        Showing {filtered.length} of {orders.length} POS orders
                    </p>
                </motion.div>
            )}

            {/* Order Summary Sheet */}
            <OrderSummarySheet
                order={selectedOrder}
                open={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                fromPath="/admin/pos/orders"
            />
        </div>
    );
}
