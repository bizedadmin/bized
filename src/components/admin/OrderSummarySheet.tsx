"use client";

import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import {
    Package, Phone, Mail, CreditCard, Banknote, Smartphone,
    Building2, Receipt, ExternalLink, Clock, CheckCircle2,
    XCircle, Truck, AlertCircle, Hash, MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderSummarySheetProps {
    order: any | null;
    open: boolean;
    onClose: () => void;
    /** The path the user came from — used for the "View Full Order" back-navigation context */
    fromPath: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    OrderProcessing: { label: "Processing", color: "text-blue-700", bg: "bg-blue-100", icon: Clock },
    OrderPaymentDue: { label: "Payment Due", color: "text-amber-700", bg: "bg-amber-100", icon: AlertCircle },
    OrderShipped: { label: "Shipped", color: "text-violet-700", bg: "bg-violet-100", icon: Truck },
    OrderPickupAvailable: { label: "Ready for Pickup", color: "text-cyan-700", bg: "bg-cyan-100", icon: Package },
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

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderSummarySheet({ order, open, onClose, fromPath }: OrderSummarySheetProps) {
    const router = useRouter();

    if (!order) return null;

    const currency = order.priceCurrency ?? "KES";
    const fmt = (n: number) => `${currency} ${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const meta = STATUS_META[order.orderStatus];
    const StatusIcon = meta?.icon ?? Clock;
    const PayIcon = PAYMENT_ICONS[order.paymentMethod] ?? Receipt;

    const subtotal = order.price ?? 0;
    const discount = order.discountTotal ?? 0;
    const total = order.totalPayable ?? subtotal;
    const orderDate = new Date(order.orderDate || order.createdAt);

    const handleViewFull = () => {
        onClose();
        router.push(`/admin/orders/${order._id}?from=${encodeURIComponent(fromPath)}`);
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={order.orderNumber ?? "Order"}
            icon={<Receipt size={20} />}
            footer={
                <Button
                    onClick={handleViewFull}
                    className="h-14 w-full rounded-[var(--radius-m3-l)] font-black bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg flex items-center justify-center gap-2"
                >
                    <ExternalLink size={16} /> View Full Order Details
                </Button>
            }
        >
            <div className="space-y-6">

                {/* Status + date */}
                <div className="flex items-center justify-between">
                    {meta ? (
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest", meta.bg, meta.color)}>
                            <StatusIcon size={12} /> {meta.label}
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-black uppercase">
                            {(order.orderStatus ?? "").replace("Order", "")}
                        </span>
                    )}
                    <div className="text-right">
                        <p className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50">
                            {orderDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-30">
                            {orderDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                </div>

                {/* Customer */}
                <div className="p-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Customer</p>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center font-black text-base shadow-md shadow-[var(--color-primary)]/20 shrink-0">
                            {(order.customer?.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-base text-[var(--color-on-surface)] truncate">{order.customer?.name ?? "—"}</p>
                            {order.customer?.telephone && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50 mt-0.5">
                                    <Phone size={10} /> {order.customer.telephone}
                                </div>
                            )}
                        </div>
                    </div>
                    {order.customer?.email && (
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60">
                            <Mail size={11} /> {order.customer.email}
                        </div>
                    )}
                    {order.deliveryAddress?.streetAddress && (
                        <div className="flex items-start gap-2 text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60">
                            <MapPin size={11} className="mt-0.5 shrink-0" /> {order.deliveryAddress.streetAddress}
                        </div>
                    )}
                </div>

                {/* Items */}
                <div className="rounded-[var(--radius-m3-l)] border border-[var(--color-outline-variant)]/10 overflow-hidden">
                    <div className="px-4 py-3 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]/10 flex items-center gap-2">
                        <Package size={14} className="text-[var(--color-primary)]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">
                            Items · {(order.orderedItem ?? []).length}
                        </p>
                    </div>
                    <div className="divide-y divide-[var(--color-outline-variant)]/8 bg-[var(--color-surface)]">
                        {(order.orderedItem ?? []).map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                {item.image
                                    ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                    : (
                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center shrink-0">
                                            <Package size={14} className="opacity-25" />
                                        </div>
                                    )
                                }
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm text-[var(--color-on-surface)] truncate">{item.name}</p>
                                    {item.note && <p className="text-[10px] font-medium text-[var(--color-primary)] opacity-60 truncate">{item.note}</p>}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-black text-sm text-[var(--color-on-surface)]">{fmt(item.lineTotal ?? (item.unitPrice * item.orderQuantity))}</p>
                                    <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-40">{item.orderQuantity} × {fmt(item.unitPrice)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 px-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-bold text-[var(--color-on-surface-variant)] opacity-60">Subtotal</span>
                        <span className="font-black text-[var(--color-on-surface)]">{fmt(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-[var(--color-error)] opacity-80">Discount</span>
                            <span className="font-black text-[var(--color-error)]">− {fmt(discount)}</span>
                        </div>
                    )}
                    <div className="h-px bg-[var(--color-outline-variant)]/15 my-1" />
                    <div className="flex justify-between">
                        <span className="font-black text-base text-[var(--color-on-surface)]">Total</span>
                        <span className="font-black text-xl text-[var(--color-primary)]">{fmt(total)}</span>
                    </div>
                </div>

                {/* Payment + Channel */}
                <div className="p-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Payment & Channel</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[var(--color-on-surface-variant)] opacity-50">Method</span>
                        <span className="font-black text-sm text-[var(--color-on-surface)] flex items-center gap-1.5">
                            <PayIcon size={13} className="text-[var(--color-primary)]" /> {order.paymentMethod ?? "—"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[var(--color-on-surface-variant)] opacity-50">Channel</span>
                        <span className="font-black text-sm text-[var(--color-on-surface)]">{order.orderChannel ?? "—"}</span>
                    </div>
                    {(order.amountDue ?? 0) > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-outline-variant)]/10">
                            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Amount Due</span>
                            <span className="font-black text-base text-amber-600">{fmt(order.amountDue)}</span>
                        </div>
                    )}
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="p-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-2">Note</p>
                        <p className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-70 leading-relaxed">"{order.notes}"</p>
                    </div>
                )}
            </div>
        </Sheet>
    );
}
