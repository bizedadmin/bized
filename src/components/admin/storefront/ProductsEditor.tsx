"use client";

import React, { useState } from "react";
import {
    Plus, Search, Package, Edit2, Trash2,
    ShoppingBag, ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function ProductsEditor() {
    const { currentBusiness, updateBusiness } = useBusiness();
    const [searchQuery, setSearchQuery] = useState("");

    const products = currentBusiness?.products || [];

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteProduct = async (id: string) => {
        if (!currentBusiness || !confirm("Are you sure you want to delete this product?")) return;
        const updatedProducts = products.filter(p => p.id !== id);
        await updateBusiness({ products: updatedProducts });
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col gap-4">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] group-focus-within:opacity-100 transition-all">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                </div>

                <Link href="/admin/products/new">
                    <Button className="w-full h-12 rounded-2xl gap-2 shadow-lg shadow-[var(--color-primary)]/10">
                        <Plus size={20} /> Add New Product
                    </Button>
                </Link>
            </div>

            {/* List Overview */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-[2px] text-[var(--color-on-surface-variant)] opacity-40">
                        {filteredProducts.length} Products
                    </span>
                    <button className="text-[10px] font-bold text-[var(--color-primary)] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                        <ArrowUpDown size={10} /> Sort
                    </button>
                </div>

                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingBag size={20} className="text-[var(--color-on-surface-variant)] opacity-30" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-[var(--color-on-surface)] truncate leading-tight">{product.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] font-bold text-[var(--color-primary)]">{product.currency} {product.price?.toLocaleString()}</span>
                                            {product.sku && (
                                                <span className="text-[10px] text-[var(--color-on-surface-variant)] opacity-40 font-medium truncate max-w-[80px]">· {product.sku}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                                    <Link href={`/admin/products/${product.id}`}>
                                        <button
                                            className="p-2 rounded-lg hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="p-2 rounded-lg hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredProducts.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center mx-auto mb-4 opacity-20">
                                <Package size={32} />
                            </div>
                            <p className="text-sm text-[var(--color-on-surface-variant)] opacity-40 italic">
                                {searchQuery ? "No products match your search" : "Your shop is empty"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
