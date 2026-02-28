"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ShoppingBag, ChevronLeft, Star, MessageSquare,
    Truck, ShieldCheck, RotateCcw, Plus, Minus,
    Share2, Heart, Layers, CheckCircle2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductDetailProps {
    product: any;
    store: any;
    slug: string;
}

export function ProductDetail({ product, store, slug }: ProductDetailProps) {
    const router = useRouter();
    const { addItem, totalItems } = useCart();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const images = product.images?.length > 0 ? product.images : [product.image];

    const handleAddToCart = () => {
        setIsAdding(true);
        addItem({
            id: product.id,
            productSlug: product.productSlug,
            name: product.name,
            price: product.price || 0,
            currency: product.currency || "KES",
            image: product.image,
            type: product.type
        }, quantity);

        setTimeout(() => setIsAdding(false), 1000);
    };

    const handleBuyNow = () => {
        addItem({
            id: product.id,
            productSlug: product.productSlug,
            name: product.name,
            price: product.price || 0,
            currency: product.currency || "KES",
            image: product.image,
            type: product.type
        }, quantity);
        router.push(`/${slug}/checkout`);
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface)] pb-32">
            {/* Header / Nav */}
            <div className="sticky top-0 z-40 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-outline-variant)]/10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors">
                            <Share2 size={20} />
                        </button>
                        <button className="p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors text-red-500">
                            <Heart size={20} />
                        </button>
                        <Link href={`/${slug}/cart`} className="p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors relative">
                            <ShoppingBag size={20} />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Image Gallery */}
                    <div className="w-full lg:w-1/2 space-y-4">
                        <div className="aspect-square rounded-[2rem] overflow-hidden bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 flex items-center justify-center">
                            {images[activeImageIndex] ? (
                                <motion.img
                                    key={activeImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={images[activeImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ShoppingBag size={64} className="opacity-10" />
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={cn(
                                            "w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all",
                                            activeImageIndex === idx ? "border-[var(--color-primary)] scale-95" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="w-full lg:w-1/2 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-wider">
                                    {product.type || "Product"}
                                </span>
                                {product.availability === "InStock" && (
                                    <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        In Stock
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-on-surface)] leading-tight mb-4">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 mb-6">
                                <p className="text-4xl font-black text-[var(--color-primary)]">
                                    {product.currency || "KES"} {product.price?.toLocaleString()}
                                </p>
                                {product.compareAtPrice && (
                                    <p className="text-xl text-[var(--color-on-surface-variant)] line-through opacity-40">
                                        {product.currency || "KES"} {product.compareAtPrice.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider opacity-60">Quantity</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-[var(--color-outline-variant)]/20 rounded-2xl p-1 bg-[var(--color-surface-container-low)]">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:bg-[var(--color-surface-container)] rounded-xl transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 hover:bg-[var(--color-surface-container)] rounded-xl transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={handleAddToCart}
                                className={cn(
                                    "flex-1 h-14 rounded-2xl font-black text-lg transition-all",
                                    isAdding ? "bg-emerald-500 hover:bg-emerald-600" : ""
                                )}
                            >
                                <ShoppingBag size={20} className="mr-2" />
                                {isAdding ? "Added!" : "Add to Cart"}
                            </Button>
                            <Button
                                onClick={handleBuyNow}
                                variant="outline"
                                className="flex-1 h-14 rounded-2xl border-2 font-black text-lg"
                            >
                                Buy Now
                            </Button>
                        </div>

                        {/* Bundle Components: "What's Included" */}
                        {product.bundleItems && product.bundleItems.length > 0 && (
                            <div className="pt-8 border-t border-[var(--color-outline-variant)]/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                        <Layers size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-[var(--color-on-surface)]">What's Included</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.bundleItems.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="group flex items-center justify-between p-4 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 hover:bg-white hover:border-blue-500/20 transition-all shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-[var(--color-outline-variant)]/5 flex items-center justify-center text-emerald-500">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--color-on-surface)]">{item.name}</p>
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-[var(--color-on-surface-variant)] opacity-40">
                                                        {item.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-white border border-[var(--color-outline-variant)]/10 text-xs font-black text-blue-600">
                                                x{item.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {product.description && (
                            <div className="space-y-4 pt-8 border-t border-[var(--color-outline-variant)]/10">
                                <h3 className="font-black text-lg">Details</h3>
                                <p className="text-[var(--color-on-surface)]/70 leading-relaxed whitespace-pre-wrap">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-[var(--color-outline-variant)]/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><Truck size={18} /></div>
                                <div className="text-[10px] font-bold uppercase tracking-tight opacity-40">Fast<br />Delivery</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><ShieldCheck size={18} /></div>
                                <div className="text-[10px] font-bold uppercase tracking-tight opacity-40">Secure<br />Payment</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><RotateCcw size={18} /></div>
                                <div className="text-[10px] font-bold uppercase tracking-tight opacity-40">Easy<br />Returns</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations Section */}
                {((store.products?.length || 0) > 1 || (store.services?.length || 0) > 0) && (
                    <div className="mt-24 pt-16 border-t border-[var(--color-outline-variant)]/10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                    <Star size={20} />
                                </div>
                                <h3 className="text-2xl font-black text-[var(--color-on-surface)] tracking-tight">Recommended for You</h3>
                            </div>
                            <Link
                                href={`/${slug}`}
                                className="text-sm font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 group"
                            >
                                View full shop <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Products Recommendations */}
                            {store.products
                                ?.filter((p: any) => p.id !== product.id)
                                ?.slice(0, 3)
                                ?.map((p: any) => (
                                    <Link
                                        key={p.id}
                                        href={`/${slug}/p/${p.productSlug || p.id}`}
                                        className="group rounded-[2.5rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-2 overflow-hidden hover:border-[var(--color-primary)]/40 hover:shadow-xl transition-all"
                                    >
                                        <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-[var(--color-surface-container)] relative">
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <ShoppingBag size={32} className="opacity-10 absolute inset-0 m-auto" />
                                            )}
                                            {p.featured && (
                                                <span className="absolute top-4 left-4 px-2 py-1 rounded-lg bg-[var(--color-primary)] text-white text-[10px] font-black uppercase tracking-wider">
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4 pt-5">
                                            <h4 className="font-bold text-[var(--color-on-surface)] mb-1 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">{p.name}</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-black text-[var(--color-primary)]">
                                                    {p.currency || "KES"} {p.price?.toLocaleString()}
                                                </span>
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                            {/* Service Recommendations (if any) */}
                            {store.services
                                ?.slice(0, 3)
                                ?.map((s: any) => (
                                    <div
                                        key={s.id}
                                        className="group rounded-[2.5rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-6 flex flex-col justify-between hover:border-[var(--color-primary)]/40 hover:shadow-xl transition-all"
                                    >
                                        <div>
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                                                <MessageSquare size={18} />
                                            </div>
                                            <h4 className="font-bold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors mb-2">{s.name}</h4>
                                            <p className="text-xs text-[var(--color-on-surface-variant)] opacity-60 line-clamp-2 mb-4 leading-relaxed">{s.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-black text-[var(--color-primary)]">
                                                {s.price ? `${s.currency || "KES"} ${s.price.toLocaleString()}` : "Price on Inquiry"}
                                            </span>
                                            <button className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)] hover:underline flex items-center gap-1 group/btn">
                                                Book <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
