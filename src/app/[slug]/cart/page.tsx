"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";
import {
    ShoppingBag, ChevronLeft, Trash2, Plus, Minus,
    ArrowRight, ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    const { cart, updateQuantity, removeItem, totalAmount, totalItems } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-6">
                    <ShoppingCart size={40} />
                </div>
                <h1 className="text-2xl font-black text-[var(--color-on-surface)] mb-2">Your cart is empty</h1>
                <p className="text-[var(--color-on-surface-variant)] opacity-60 mb-8 max-w-xs">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <Button onClick={() => router.push(`/${slug}`)} className="rounded-2xl px-8 h-12 font-black">
                    Start Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-surface)] pb-32">
            <div className="sticky top-0 z-40 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-outline-variant)]/10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black">Your Cart ({totalItems})</h1>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-sm">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[var(--color-surface-container)] flex-shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <ShoppingBag size={24} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-[var(--color-on-surface)] line-clamp-1">{item.name}</h3>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[var(--color-primary)] font-black mt-1">
                                        {item.currency} {item.price.toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center border border-[var(--color-outline-variant)]/20 rounded-xl p-0.5 bg-[var(--color-surface-container)]">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-1.5 hover:bg-[var(--color-surface-container-high)] rounded-lg transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1.5 hover:bg-[var(--color-surface-container-high)] rounded-lg transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <p className="font-black text-sm">
                                        {item.currency} {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Card */}
                <div className="p-6 rounded-[2.5rem] bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/10 space-y-4">
                    <div className="flex justify-between items-center text-sm opacity-60 font-bold uppercase tracking-wider">
                        <span>Subtotal</span>
                        <span>{cart[0]?.currency} {totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm opacity-60 font-bold uppercase tracking-wider">
                        <span>Delivery</span>
                        <span className="text-emerald-500">Calculated at checkout</span>
                    </div>
                    <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                        <span className="text-lg font-black">Total</span>
                        <span className="text-2xl font-black text-[var(--color-primary)]">
                            {cart[0]?.currency} {totalAmount.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        onClick={() => router.push(`/${slug}/checkout`)}
                        className="w-full h-16 rounded-3xl font-black text-xl shadow-xl shadow-[var(--color-primary)]/20"
                    >
                        Checkout
                        <ArrowRight size={20} className="ml-2" />
                    </Button>
                    <Link
                        href={`/${slug}`}
                        className="block w-full text-center mt-6 text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </main>
        </div>
    );
}
