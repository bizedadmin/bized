"use client";

import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
    ChevronLeft, ShoppingBag, CreditCard,
    Truck, User, Phone, MapPin, CheckCircle2,
    ArrowRight, Package, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params?.slug as string;

    // Admin mode: opened from /admin/orders via ?admin=true&storeId=...
    const isAdminMode = searchParams?.get("admin") === "true";
    const adminStoreId = searchParams?.get("storeId") ?? "";

    const { cart, totalAmount, clearCart } = useCart();

    const [step, setStep] = useState(1); // 1: Info, 2: Review, 3: Success
    const [isPlacing, setIsPlacing] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        country: "",
        notes: "",
        paymentMethod: "Cash" as string,
        orderChannel: "Manual" as string, // admin-only
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        setIsPlacing(true);
        setError(null);
        try {
            let storeId = adminStoreId;

            // If not admin mode, look up store by slug
            if (!storeId) {
                const storeRes = await fetch(`/api/stores?slug=${slug}`);
                const storeData = await storeRes.json();
                const store = storeData.store ?? storeData.stores?.[0];
                if (!store?._id) throw new Error("Could not identify store");
                storeId = store._id;
            }

            const subtotal = totalAmount;
            const currency = cart[0]?.currency ?? "USD";

            const orderPayload = {
                storeId,
                customer: {
                    "@type": "Person",
                    name: formData.name,
                    telephone: formData.phone,
                    email: formData.email || undefined,
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: formData.address,
                        addressLocality: formData.city,
                        addressCountry: formData.country || undefined,
                    }
                },
                orderedItem: cart.map(item => ({
                    "@type": "OrderItem",
                    productId: item.id,
                    name: item.name,
                    image: item.image,
                    orderQuantity: item.quantity,
                    unitPrice: item.price,
                    lineTotal: item.price * item.quantity,
                    orderItemStatus: "OrderProcessing",
                })),
                price: subtotal,
                priceCurrency: currency,
                taxTotal: 0,
                discountTotal: 0,
                shippingCost: 0,
                totalPayable: subtotal,
                deliveryAddress: {
                    "@type": "PostalAddress",
                    streetAddress: formData.address,
                    addressLocality: formData.city,
                    addressCountry: formData.country || undefined,
                },
                deliveryMode: "Delivery",
                orderChannel: isAdminMode ? formData.orderChannel : "Online",
                notes: formData.notes || undefined,
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to place order");

            setOrderNumber(data.orderNumber);
            clearCart();
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsPlacing(false);
        }
    };

    // ─── Empty cart ───────────────────────────────────────────────────────────
    if (cart.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center p-6 text-center">
                {isAdminMode && (
                    <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
                        <ShieldCheck size={16} />
                        <span className="text-sm font-black">Admin Mode — Manual Order Entry</span>
                    </div>
                )}
                <ShoppingBag size={48} className="opacity-20 mb-4" />
                <h1 className="text-2xl font-black mb-2">Cart is empty</h1>
                <p className="text-sm opacity-50 mb-6">Add items from the storefront first, then return to checkout.</p>
                <div className="flex gap-3">
                    <Button onClick={() => router.push(`/${slug}`)} className="rounded-2xl px-8 h-12 font-black">
                        Browse Store
                    </Button>
                    {isAdminMode && (
                        <Button variant="outline" onClick={() => router.push("/admin/orders")}
                            className="rounded-2xl px-8 h-12 font-black">
                            Back to Orders
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // ─── Success ──────────────────────────────────────────────────────────────
    if (step === 3) {
        return (
            <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center p-6 text-center">
                {isAdminMode && (
                    <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
                        <ShieldCheck size={16} />
                        <span className="text-sm font-black">Admin Mode — Manual Order Entry</span>
                    </div>
                )}
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 animate-in zoom-in duration-500">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-black text-[var(--color-on-surface)] mb-2 tracking-tight">Order Placed!</h1>
                {orderNumber && (
                    <div className="mb-4 px-4 py-2 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20">
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">Order Number</span>
                        <p className="font-mono font-black text-[var(--color-primary)]">{orderNumber}</p>
                    </div>
                )}
                <p className="text-[var(--color-on-surface-variant)] opacity-60 mb-10 max-w-sm leading-relaxed">
                    {isAdminMode
                        ? `Order ${orderNumber} created successfully for ${formData.name}.`
                        : `Thank you, ${formData.name}! We'll contact you shortly to confirm your order.`
                    }
                </p>
                <div className="w-full max-w-xs space-y-4">
                    {isAdminMode ? (
                        <>
                            <Button
                                onClick={() => window.close()}
                                className="w-full h-14 rounded-2xl font-black bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                                ✓ Done — Close Tab
                            </Button>
                            <Button
                                onClick={() => {
                                    // Reset by navigating to same URL fresh
                                    window.location.href = window.location.href.split("?")[0]
                                        + `?admin=true&storeId=${adminStoreId}`;
                                }}
                                variant="outline"
                                className="w-full h-14 rounded-2xl font-black border-2">
                                Add Another Order
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => {
                                    const items = cart.map(i => `${i.name} ×${i.quantity}`).join(", ");
                                    const msg = `Hi! I placed order ${orderNumber}.\n\nItems: ${items}\nTotal: ${cart[0]?.currency} ${totalAmount.toLocaleString()}\nDelivery to: ${formData.address}, ${formData.city}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                                }}
                                className="w-full h-14 rounded-2xl font-black bg-[#25D366] hover:bg-[#20bd5a] text-white"
                            >
                                Confirm on WhatsApp
                            </Button>
                            <Button onClick={() => router.push(`/${slug}`)} variant="outline"
                                className="w-full h-14 rounded-2xl font-black border-2">
                                Continue Shopping
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ─── Form Steps ───────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[var(--color-surface)] pb-32">
            {/* Top bar */}
            <div className="sticky top-0 z-40 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-outline-variant)]/10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => step === 1
                            ? (isAdminMode ? window.close() : router.back())
                            : setStep(prev => prev - 1)}
                        className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black leading-tight">
                            {step === 1 ? "Your Information" : "Review Order"}
                        </h1>
                        {isAdminMode && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] opacity-70 flex items-center gap-1">
                                <ShieldCheck size={10} /> Admin · Manual Order Entry
                            </span>
                        )}
                    </div>
                    {/* Step dots */}
                    <div className="ml-auto flex items-center gap-2">
                        {[1, 2].map(s => (
                            <div key={s} className={`w-2 h-2 rounded-full transition-all ${step >= s ? "bg-[var(--color-primary)]" : "bg-[var(--color-outline-variant)]/40"}`} />
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* ── Step 1: Customer Info ── */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {[
                            { label: "Full Name", name: "name", icon: User, placeholder: "e.g. Alice Johnson", required: true },
                            { label: "Phone Number", name: "phone", icon: Phone, placeholder: "+254 7XX XXX XXX", required: true },
                            { label: "Email (optional)", name: "email", icon: CreditCard, placeholder: "alice@example.com", required: false },
                        ].map(field => (
                            <div key={field.name} className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                                    <field.icon size={14} /> {field.label}
                                </label>
                                <input
                                    name={field.name}
                                    value={(formData as any)[field.name]}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    className="w-full h-14 rounded-2xl px-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-bold"
                                />
                            </div>
                        ))}

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                                <MapPin size={14} /> Delivery Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Street, building, apartment no."
                                className="w-full min-h-[100px] rounded-2xl p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-bold resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">City</label>
                                <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Nairobi"
                                    className="w-full h-12 rounded-2xl px-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">Country</label>
                                <input name="country" value={formData.country} onChange={handleInputChange} placeholder="KE"
                                    className="w-full h-12 rounded-2xl px-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-bold" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest opacity-40">Notes (optional)</label>
                            <textarea name="notes" value={formData.notes} onChange={handleInputChange}
                                placeholder="Special instructions, gate code, etc."
                                className="w-full min-h-[80px] rounded-2xl p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 font-bold resize-none" />
                        </div>

                        {/* Channel selector — admin only */}
                        {isAdminMode && (
                            <div className="space-y-2 p-5 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-primary)] opacity-70">
                                    <ShieldCheck size={14} /> Order Channel
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {["Manual", "POS", "Phone", "WhatsApp"].map(ch => (
                                        <button key={ch} onClick={() => setFormData(f => ({ ...f, orderChannel: ch }))}
                                            className={`py-2.5 rounded-xl text-xs font-black transition-all border ${formData.orderChannel === ch
                                                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent"
                                                : "border-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)]"
                                                }`}>
                                            {ch}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            disabled={!formData.name || !formData.phone || !formData.address}
                            onClick={() => setStep(2)}
                            className="w-full h-16 rounded-3xl font-black text-xl shadow-xl shadow-[var(--color-primary)]/20 flex items-center gap-3 justify-center"
                        >
                            Next: Review <ArrowRight size={20} />
                        </Button>
                    </div>
                )}

                {/* ── Step 2: Review ── */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {/* Items */}
                        <div className="p-6 rounded-[2rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg">Order Summary</h3>
                                <Package className="opacity-20" size={20} />
                            </div>
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{item.name}</p>
                                            <p className="text-xs opacity-50 font-medium">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="font-black shrink-0">{item.currency} {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-[var(--color-outline-variant)]/10 flex justify-between items-center">
                                <span className="font-black">Total</span>
                                <span className="text-2xl font-black text-[var(--color-primary)]">
                                    {cart[0]?.currency} {totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Delivery info */}
                        <div className="p-6 rounded-[2rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-lg">Delivery</h3>
                                <Truck className="opacity-20" size={20} />
                            </div>
                            <p className="font-bold">{formData.name}</p>
                            <p className="text-sm opacity-60">{formData.phone}</p>
                            <p className="text-sm opacity-60">{formData.address}{formData.city ? `, ${formData.city}` : ""}</p>
                            {formData.notes && <p className="text-xs italic opacity-40">"{formData.notes}"</p>}
                        </div>

                        {/* Payment method */}
                        <div className="p-6 rounded-[2rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-3">
                            <h3 className="font-black text-lg">Payment</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {["Cash", "Card", "Bank Transfer", "M-Pesa"].map(method => (
                                    <button key={method} onClick={() => setFormData(f => ({ ...f, paymentMethod: method }))}
                                        className={`py-3 rounded-2xl font-bold text-sm transition-all border ${formData.paymentMethod === method
                                            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                                            : "border-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)]"
                                            }`}>
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Admin channel badge on review */}
                        {isAdminMode && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                                <ShieldCheck size={14} className="text-[var(--color-primary)]" />
                                <span className="text-xs font-black text-[var(--color-primary)]">Channel: {formData.orderChannel}</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <Button onClick={handlePlaceOrder} disabled={isPlacing}
                            className="w-full h-16 rounded-3xl font-black text-xl shadow-xl shadow-[var(--color-primary)]/20">
                            {isPlacing ? "Placing Order..." : "Place Order"}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
