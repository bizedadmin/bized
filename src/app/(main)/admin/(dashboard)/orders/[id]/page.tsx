"use client";

import React, { useEffect, useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import {
    ArrowLeft, Package, CreditCard, Truck, Receipt, Plus,
    CheckCircle2, Clock, XCircle, User, MapPin, AlertCircle,
    ChevronDown, Banknote
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";

type OrderStatus = "OrderPaymentDue" | "OrderProcessing" | "OrderShipped" | "OrderPickupAvailable" | "OrderDelivered" | "OrderCancelled";
type PaymentStatus = "PaymentDue" | "PaymentComplete" | "PaymentDeclined" | "PaymentAutoPay" | "PaymentRefunded";

const STATUS_LABEL: Record<string, string> = {
    OrderPaymentDue: "Payment Due", OrderProcessing: "Processing",
    OrderShipped: "Shipped", OrderPickupAvailable: "Ready for Pickup",
    OrderDelivered: "Delivered", OrderCancelled: "Cancelled",
};
const STATUS_STYLES: Record<string, string> = {
    OrderPaymentDue: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    OrderProcessing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    OrderShipped: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    OrderDelivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    OrderCancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function OrderDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params?.id as string;
    const backPath = searchParams?.get("from") ?? "/admin/orders";
    const { currentBusiness, isLoading: bizLoading } = useBusiness();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Payment modal
    const [showPayModal, setShowPayModal] = useState(false);
    const [payForm, setPayForm] = useState({ amount: "", paymentMethod: "Cash", paymentGateway: "Manual", notes: "", invoiceId: "" });
    const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
    const [isSavingPay, setIsSavingPay] = useState(false);
    const [payError, setPayError] = useState<string | null>(null);

    // Fulfillment modal
    const [showFulfillModal, setShowFulfillModal] = useState(false);
    const [fulfillForm, setFulfillForm] = useState({ trackingNumber: "", carrier: "", trackingUrl: "", deliveryMode: "Delivery", notes: "" });
    const [isSavingFulfill, setIsSavingFulfill] = useState(false);
    const [fulfillError, setFulfillError] = useState<string | null>(null);

    // Status update
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const fetch_ = async () => {
        if (!currentBusiness?._id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}?storeId=${currentBusiness._id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setData(json);
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    useEffect(() => { if (!bizLoading) fetch_(); }, [orderId, currentBusiness?._id, bizLoading]);

    const updateStatus = async (orderStatus: string) => {
        setIsUpdatingStatus(true);
        await fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeId: currentBusiness?._id, orderStatus }),
        });
        await fetch_();
        setIsUpdatingStatus(false);
    };

    const handleAddPayment = async () => {
        if (!payForm.amount || !payForm.paymentMethod) { setPayError("Amount and method are required."); return; }
        setIsSavingPay(true); setPayError(null);
        try {
            const res = await fetch(`/api/orders/${orderId}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: currentBusiness?._id,
                    amount: parseFloat(payForm.amount),
                    paymentMethod: payForm.paymentMethod,
                    paymentGateway: payForm.paymentGateway,
                    invoiceId: (payingInvoiceId ?? payForm.invoiceId) || undefined,
                    notes: payForm.notes || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setShowPayModal(false);
            setPayForm({ amount: "", paymentMethod: "Cash", paymentGateway: "Manual", notes: "", invoiceId: "" });
            setPayingInvoiceId(null);
            await fetch_();
        } catch (e: any) { setPayError(e.message); }
        setIsSavingPay(false);
    };

    const handleAddFulfillment = async () => {
        setIsSavingFulfill(true); setFulfillError(null);
        try {
            const res = await fetch(`/api/orders/${orderId}/fulfillments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeId: currentBusiness?._id, ...fulfillForm }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setShowFulfillModal(false);
            setFulfillForm({ trackingNumber: "", carrier: "", trackingUrl: "", deliveryMode: "Delivery", notes: "" });
            await fetch_();
        } catch (e: any) { setFulfillError(e.message); }
        setIsSavingFulfill(false);
    };

    const advanceFulfillment = async (fulfillmentId: string, deliveryStatus: string) => {
        await fetch(`/api/orders/${orderId}/fulfillments`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeId: currentBusiness?._id, fulfillmentId, deliveryStatus }),
        });
        await fetch_();
    };

    const fmt = (n: number) => `${data?.order?.priceCurrency ?? "USD"} ${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    if (bizLoading || loading) return (
        <div className="p-8 space-y-4">
            <div className="h-12 w-64 bg-[var(--color-surface-container-low)] rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" />)}
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-bold opacity-40">{error ?? "Order not found"}</p>
            <Link href={backPath}><Button variant="outline" className="mt-4 rounded-2xl">← Back</Button></Link>
        </div>
    );

    const { order, payments, invoices, fulfillments } = data;
    const amountPaidTotal = payments?.filter((p: any) => p.paymentStatus === "PaymentComplete").reduce((s: number, p: any) => s + p.amount, 0) ?? 0;

    return (
        <>
            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={backPath}>
                        <Button variant="text" className="h-10 w-10 p-0 rounded-xl"><ArrowLeft size={20} /></Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-black text-[var(--color-on-surface)]">{order.orderNumber}</h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${STATUS_STYLES[order.orderStatus] ?? ""}`}>
                                {STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                            </span>
                        </div>
                        <p className="text-sm opacity-50 font-medium">{order.orderChannel} · {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    {/* Status transition buttons */}
                    <div className="hidden sm:flex gap-2">
                        {order.orderStatus === "OrderPaymentDue" && (
                            <Button onClick={() => updateStatus("OrderProcessing")} disabled={isUpdatingStatus}
                                className="h-10 px-4 rounded-xl text-xs font-black bg-[var(--color-primary)] text-[var(--color-on-primary)] gap-2">
                                <Package size={14} /> Mark Processing
                            </Button>
                        )}
                        {order.orderStatus === "OrderProcessing" && (
                            <Button onClick={() => updateStatus("OrderShipped")} disabled={isUpdatingStatus}
                                className="h-10 px-4 rounded-xl text-xs font-black bg-violet-600 text-white gap-2">
                                <Truck size={14} /> Mark Shipped
                            </Button>
                        )}
                        {order.orderStatus === "OrderShipped" && (
                            <Button onClick={() => updateStatus("OrderDelivered")} disabled={isUpdatingStatus}
                                className="h-10 px-4 rounded-xl text-xs font-black bg-emerald-600 text-white gap-2">
                                <CheckCircle2 size={14} /> Mark Delivered
                            </Button>
                        )}
                        {!["OrderDelivered", "OrderCancelled"].includes(order.orderStatus) && (
                            <Button onClick={() => updateStatus("OrderCancelled")} disabled={isUpdatingStatus} variant="outline"
                                className="h-10 px-4 rounded-xl text-xs font-black text-rose-600 border-rose-500/20 hover:bg-rose-50">
                                <XCircle size={14} /> Cancel
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: items + payment summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Line items */}
                        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden">
                            <div className="p-5 border-b border-[var(--color-outline-variant)]/10 flex items-center gap-2">
                                <Package size={18} className="opacity-40" />
                                <span className="font-black text-sm uppercase tracking-widest opacity-40">Ordered Items</span>
                                <span className="ml-auto text-xs font-bold opacity-40">{order.orderedItem?.length} item(s)</span>
                            </div>
                            <div className="divide-y divide-[var(--color-outline-variant)]/5">
                                {order.orderedItem?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 p-5">
                                        {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                                        {!item.image && <div className="w-14 h-14 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center shrink-0"><Package size={20} className="opacity-30" /></div>}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{item.name}</p>
                                            <p className="text-xs opacity-50 font-medium">SKU: {item.sku ?? "—"} · Qty: {item.orderQuantity}</p>
                                            {item.bookingTime && (
                                                <p className="text-xs text-[var(--color-primary)] font-bold mt-1">📅 Booking: {new Date(item.bookingTime).toLocaleString()}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="font-black">{fmt(item.lineTotal)}</span>
                                            <span className="text-xs opacity-40">{fmt(item.unitPrice)} × {item.orderQuantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-5 border-t border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container)]/30 space-y-2">
                                <div className="flex justify-between text-sm opacity-60"><span>Subtotal</span><span>{fmt(order.price)}</span></div>
                                {order.taxTotal > 0 && <div className="flex justify-between text-sm opacity-60"><span>Tax</span><span>{fmt(order.taxTotal)}</span></div>}
                                {order.discountTotal > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>-{fmt(order.discountTotal)}</span></div>}
                                {order.shippingCost > 0 && <div className="flex justify-between text-sm opacity-60"><span>Shipping</span><span>{fmt(order.shippingCost)}</span></div>}
                                <div className="flex justify-between font-black text-lg pt-2 border-t border-[var(--color-outline-variant)]/10"><span>Total</span><span className="text-[var(--color-primary)]">{fmt(order.totalPayable)}</span></div>
                            </div>
                        </div>

                        {/* Payments */}
                        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden">
                            <div className="p-5 border-b border-[var(--color-outline-variant)]/10 flex items-center gap-2">
                                <Banknote size={18} className="opacity-40" />
                                <span className="font-black text-sm uppercase tracking-widest opacity-40">Payments</span>
                                {/* Progress bar */}
                                <div className="flex-1 mx-4">
                                    <div className="h-2 rounded-full bg-[var(--color-surface-container-high)] overflow-hidden">
                                        <div className="h-full rounded-full bg-emerald-500 transition-all"
                                            style={{ width: `${Math.min(100, (amountPaidTotal / order.totalPayable) * 100)}%` }} />
                                    </div>
                                </div>
                                <span className="text-xs font-black text-emerald-600 shrink-0">{fmt(amountPaidTotal)} / {fmt(order.totalPayable)}</span>
                                <Button onClick={() => { setShowPayModal(true); setPayError(null); }} variant="text"
                                    className="h-8 w-8 p-0 rounded-lg ml-1 shrink-0" title="Add payment">
                                    <Plus size={16} />
                                </Button>
                            </div>
                            {payments?.length === 0 ? (
                                <div className="p-6 text-center opacity-30 text-sm font-medium">No payments recorded yet.</div>
                            ) : (
                                <div className="divide-y divide-[var(--color-outline-variant)]/5">
                                    {payments?.map((pay: any) => (
                                        <div key={pay._id} className="flex items-center gap-4 p-5">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                                <CreditCard size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{pay.paymentMethod} · {pay.paymentGateway}</p>
                                                <p className="text-xs opacity-40">{new Date(pay.createdAt).toLocaleString()}</p>
                                                {pay.paymentRef && <p className="text-[10px] font-mono opacity-30">{pay.paymentRef}</p>}
                                                {pay.notes && <p className="text-xs italic opacity-40 mt-0.5">"{pay.notes}"</p>}
                                            </div>
                                            <span className="font-black text-emerald-600 shrink-0">{fmt(pay.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {order.amountDue > 0 && (
                                <div className="p-4 border-t border-[var(--color-outline-variant)]/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-amber-600">Outstanding</p>
                                        <p className="text-xl font-black">{fmt(order.amountDue)}</p>
                                    </div>
                                    <Button onClick={() => { setPayForm(f => ({ ...f, amount: String(order.amountDue) })); setShowPayModal(true); }}
                                        className="h-10 px-4 rounded-xl text-xs font-black bg-[var(--color-primary)] text-[var(--color-on-primary)] gap-2">
                                        <CreditCard size={14} /> Record Payment
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Invoices */}
                        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden">
                            <div className="p-5 border-b border-[var(--color-outline-variant)]/10 flex items-center gap-2">
                                <Receipt size={18} className="opacity-40" />
                                <span className="font-black text-sm uppercase tracking-widest opacity-40">Invoices</span>
                                <span className="ml-auto text-xs font-bold opacity-40">{invoices?.length} invoice(s)</span>
                            </div>
                            {invoices?.length === 0 ? (
                                <div className="p-6 text-center opacity-30 text-sm font-medium">No invoices yet.</div>
                            ) : (
                                <div className="divide-y divide-[var(--color-outline-variant)]/5">
                                    {invoices?.map((inv: any) => (
                                        <div key={inv._id} className="flex items-center gap-4 p-5">
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{inv.invoiceNumber}</p>
                                                <p className="text-xs opacity-40">{inv.description}</p>
                                                {inv.paymentDueDate && <p className="text-xs opacity-40">Due: {new Date(inv.paymentDueDate).toLocaleDateString()}</p>}
                                            </div>
                                            <span className={`text-xs font-black px-2 py-1 rounded-full ${inv.paymentStatus === "PaymentComplete" ? "bg-emerald-500/10 text-emerald-600" :
                                                inv.paymentStatus === "PaymentDue" ? "bg-amber-500/10 text-amber-600" :
                                                    "bg-blue-500/10 text-blue-600"
                                                }`}>{inv.paymentStatus.replace("Payment", "")}</span>
                                            <span className="font-black shrink-0">{fmt(inv.totalPaymentDue)}</span>
                                            {inv.paymentStatus !== "PaymentComplete" && (
                                                <Button
                                                    onClick={() => { setPayingInvoiceId(inv._id); setPayForm(f => ({ ...f, amount: String(inv.totalPaymentDue) })); setShowPayModal(true); }}
                                                    variant="text" className="h-8 px-3 rounded-lg text-xs font-bold text-emerald-600">
                                                    Pay
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fulfillments */}
                        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden">
                            <div className="p-5 border-b border-[var(--color-outline-variant)]/10 flex items-center gap-2">
                                <Truck size={18} className="opacity-40" />
                                <span className="font-black text-sm uppercase tracking-widest opacity-40">Fulfillments / Shipments</span>
                                <Button onClick={() => { setShowFulfillModal(true); setFulfillError(null); }} variant="text"
                                    className="h-8 w-8 p-0 rounded-lg ml-auto">
                                    <Plus size={16} />
                                </Button>
                            </div>
                            {fulfillments?.length === 0 ? (
                                <div className="p-6 text-center opacity-30 text-sm font-medium">No shipments created yet.</div>
                            ) : (
                                <div className="divide-y divide-[var(--color-outline-variant)]/5">
                                    {fulfillments?.map((f: any) => (
                                        <div key={f._id} className="p-5 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                                                    <Truck size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm">{f.carrier ?? "No carrier"} · {f.trackingNumber ?? "No tracking"}</p>
                                                    <p className="text-xs opacity-40">{f.deliveryMode} · Created {new Date(f.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-xs font-black px-2 py-1 rounded-full ${f.deliveryStatus === "Delivered" ? "bg-emerald-500/10 text-emerald-600" :
                                                    f.deliveryStatus === "Shipped" ? "bg-violet-500/10 text-violet-600" :
                                                        "bg-amber-500/10 text-amber-600"
                                                    }`}>{f.deliveryStatus}</span>
                                            </div>
                                            {/* Advance fulfillment */}
                                            {f.deliveryStatus !== "Delivered" && (
                                                <div className="flex gap-2 pl-14">
                                                    {f.deliveryStatus === "Packed" && (
                                                        <Button onClick={() => advanceFulfillment(f._id, "Shipped")} variant="outline"
                                                            className="h-7 px-3 rounded-lg text-xs font-bold">Mark Shipped</Button>
                                                    )}
                                                    {f.deliveryStatus === "Shipped" && (
                                                        <Button onClick={() => advanceFulfillment(f._id, "Delivered")} variant="outline"
                                                            className="h-7 px-3 rounded-lg text-xs font-bold text-emerald-600 border-emerald-500/20">Mark Delivered</Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column: customer + meta */}
                    <div className="space-y-6">
                        {/* Customer */}
                        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <User size={18} className="opacity-40" />
                                <span className="font-black text-sm uppercase tracking-widest opacity-40">Customer</span>
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-lg">{order.customer?.name}</p>
                                {order.customer?.telephone && <p className="text-sm opacity-60">{order.customer.telephone}</p>}
                                {order.customer?.email && <p className="text-sm opacity-60">{order.customer.email}</p>}
                            </div>
                            {order.deliveryAddress && (
                                <div className="pt-3 border-t border-[var(--color-outline-variant)]/10 space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                                        <MapPin size={14} /> Delivery Address
                                    </div>
                                    <p className="text-sm font-medium">{order.deliveryAddress.streetAddress}</p>
                                    <p className="text-sm opacity-60">{order.deliveryAddress.addressLocality}{order.deliveryAddress.addressCountry ? `, ${order.deliveryAddress.addressCountry}` : ""}</p>
                                </div>
                            )}
                        </div>

                        {/* Order meta */}
                        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] p-6 space-y-4">
                            <span className="font-black text-sm uppercase tracking-widest opacity-40">Order Details</span>
                            <div className="space-y-3 text-sm">
                                {[
                                    { label: "Order Number", value: order.orderNumber },
                                    { label: "Channel", value: order.orderChannel },
                                    { label: "Currency", value: order.priceCurrency },
                                    { label: "Fulfillment", value: order.fulfillmentStatus },
                                    { label: "Payment Status", value: order.paymentStatus?.replace("Payment", "") },
                                    { label: "Amount Paid", value: fmt(order.amountPaid) },
                                    { label: "Amount Due", value: fmt(order.amountDue) },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between">
                                        <span className="opacity-40 font-medium">{row.label}</span>
                                        <span className="font-bold">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                            {order.notes && (
                                <div className="pt-3 border-t border-[var(--color-outline-variant)]/10">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Notes</p>
                                    <p className="text-sm italic opacity-60">"{order.notes}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Payment Sheet */}
            <Sheet open={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment"
                icon={<CreditCard size={20} />}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <Button variant="outline" onClick={() => setShowPayModal(false)} disabled={isSavingPay}>Cancel</Button>
                        <Button onClick={handleAddPayment} disabled={isSavingPay}>
                            {isSavingPay ? "Recording..." : "Record Payment"}
                        </Button>
                    </div>
                }>
                <div className="space-y-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40">Amount*</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black opacity-40">{order.priceCurrency}</span>
                            <input type="number" min="0" step="0.01" placeholder="0.00" value={payForm.amount}
                                onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                                className="w-full pl-14 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40">Payment Method*</label>
                        <div className="grid grid-cols-2 gap-2">
                            {["Cash", "Card", "Bank Transfer", "M-Pesa"].map(m => (
                                <button key={m} onClick={() => setPayForm(f => ({ ...f, paymentMethod: m }))}
                                    className={`py-3 rounded-2xl text-sm font-bold transition-all border ${payForm.paymentMethod === m
                                        ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                                        : "border-[var(--color-outline-variant)]/20 opacity-60"
                                        }`}>{m}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40">Gateway Reference (optional)</label>
                        <input type="text" placeholder="e.g. Stripe charge ID" value={payForm.paymentGateway}
                            onChange={e => setPayForm(f => ({ ...f, paymentGateway: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]" />
                    </div>
                    {payingInvoiceId && (
                        <div className="p-3 bg-[var(--color-primary)]/5 rounded-2xl text-sm font-bold text-[var(--color-primary)]">
                            Applying to invoice: {invoices?.find((i: any) => i._id === payingInvoiceId)?.invoiceNumber}
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40">Notes (optional)</label>
                        <input type="text" placeholder="Payment notes" value={payForm.notes}
                            onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]" />
                    </div>
                    {payError && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm font-medium">{payError}</div>}
                </div>
            </Sheet>

            {/* Add Fulfillment Sheet */}
            <Sheet open={showFulfillModal} onClose={() => setShowFulfillModal(false)} title="Create Shipment"
                icon={<Truck size={20} />}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <Button variant="outline" onClick={() => setShowFulfillModal(false)} disabled={isSavingFulfill}>Cancel</Button>
                        <Button onClick={handleAddFulfillment} disabled={isSavingFulfill}>
                            {isSavingFulfill ? "Creating..." : "Create Shipment"}
                        </Button>
                    </div>
                }>
                <div className="space-y-5">
                    {[
                        { label: "Carrier", name: "carrier", placeholder: "e.g. DHL, FedEx, UPS" },
                        { label: "Tracking Number", name: "trackingNumber", placeholder: "e.g. 1Z999AA10123456784" },
                        { label: "Tracking URL (optional)", name: "trackingUrl", placeholder: "https://track.carrier.com/..." },
                    ].map(f => (
                        <div key={f.name} className="flex flex-col gap-1.5">
                            <label className="text-xs font-black uppercase tracking-widest opacity-40">{f.label}</label>
                            <input type="text" placeholder={f.placeholder} value={(fulfillForm as any)[f.name]}
                                onChange={e => setFulfillForm(ff => ({ ...ff, [f.name]: e.target.value }))}
                                className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]" />
                        </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40">Delivery Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["Delivery", "Pickup", "Download"].map(m => (
                                <button key={m} onClick={() => setFulfillForm(f => ({ ...f, deliveryMode: m }))}
                                    className={`py-3 rounded-2xl text-xs font-black transition-all border ${fulfillForm.deliveryMode === m
                                        ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                                        : "border-[var(--color-outline-variant)]/20 opacity-60"
                                        }`}>{m}</button>
                            ))}
                        </div>
                    </div>
                    {fulfillError && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm font-medium">{fulfillError}</div>}
                </div>
            </Sheet>
        </>
    );
}
