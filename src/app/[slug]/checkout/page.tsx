"use client";

import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
    ChevronLeft, ShoppingBag, CreditCard,
    Truck, User, Phone, MapPin, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    const { cart, totalAmount, clearCart } = useCart();

    const [step, setStep] = useState(1); // 1: Info, 2: Payment/Review, 3: Success
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        notes: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = () => {
        // Here we would normally call an API to save the order
        // For now, we simulate success and suggest WhatsApp integration
        setStep(3);
        clearCart();
    };

    if (cart.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-black mb-4">No items to checkout</h1>
                <Button onClick={() => router.push(`/${slug}`)} className="rounded-2xl px-8 h-12 font-black">
                    Go back to store
                </Button>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 animate-in zoom-in duration-500">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-black text-[var(--color-on-surface)] mb-4 tracking-tight">Order Placed!</h1>
                <p className="text-[var(--color-on-surface-variant)] opacity-60 mb-10 max-w-sm leading-relaxed">
                    Thank you, {formData.name}! Your order has been received. We'll contact you shortly for fulfillment details.
                </p>
                <div className="w-full max-w-xs space-y-4">
                    <Button
                        onClick={() => {
                            // Suggest WhatsApp redirect here
                            const message = `Hi, I just placed an order on your store! \n\nItems: ${cart.map(i => `${i.name} x${i.quantity}`).join(", ")} \nTotal: ${cart[0]?.currency} ${totalAmount.toLocaleString()}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="w-full h-14 rounded-2xl font-black bg-[#25D366] hover:bg-[#20bd5a]"
                    >
                        Confirm on WhatsApp
                    </Button>
                    <Button onClick={() => router.push(`/${slug}`)} variant="outline" className="w-full h-14 rounded-2xl font-black border-2">
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-surface)] pb-32">
            <div className="sticky top-0 z-40 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-outline-variant)]/10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button onClick={() => setStep(prev => Math.max(1, prev - 1))} className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black">
                        {step === 1 ? "Delivery Info" : "Review Order"}
                    </h1>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {step === 1 ? (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {/* Form Section */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                                    <User size={14} /> Full Name
                                </label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. John Doe"
                                    className="w-full h-14 rounded-2xl px-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                                    <Phone size={14} /> Phone Number
                                </label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g. +254 7XX XXX XXX"
                                    className="w-full h-14 rounded-2xl px-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                                    <MapPin size={14} /> Delivery Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Street, Building, Apartment No."
                                    className="w-full min-h-[120px] rounded-2xl p-6 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-bold resize-none"
                                />
                            </div>
                        </div>

                        <Button
                            disabled={!formData.name || !formData.phone || !formData.address}
                            onClick={() => setStep(2)}
                            className="w-full h-16 rounded-3xl font-black text-xl shadow-xl shadow-[var(--color-primary)]/20"
                        >
                            Next: Review
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {/* Summary Section */}
                        <div className="p-6 rounded-[2rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg">Order Summary</h3>
                                <ShoppingBag className="opacity-20" size={20} />
                            </div>

                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="font-medium opacity-60">{item.name} x{item.quantity}</span>
                                        <span className="font-black">{item.currency} {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                                <span className="font-black">Total to pay</span>
                                <span className="text-xl font-black text-[var(--color-primary)]">
                                    {cart[0]?.currency} {totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Delivery Destination */}
                        <div className="p-6 rounded-[2rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg">Delivery</h3>
                                <Truck className="opacity-20" size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold">{formData.name}</p>
                                <p className="text-sm opacity-60">{formData.phone}</p>
                                <p className="text-sm opacity-60">{formData.address}</p>
                            </div>
                        </div>

                        <Button
                            onClick={handlePlaceOrder}
                            className="w-full h-16 rounded-3xl font-black text-xl shadow-xl shadow-[var(--color-primary)]/20"
                        >
                            Place Order
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
