"use client";

import React from "react";
import {
    Package, TrendingUp, AlertCircle, ShoppingBag,
    BarChart3, ArrowRight, DollarSign, Activity
} from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ProductsOverviewPage() {
    const { currentBusiness, isLoading } = useBusiness();

    const products = currentBusiness?.products || [];
    const activeProducts = products.filter(p => p.availability !== 'OutOfStock');
    const outOfStock = products.filter(p => p.availability === 'OutOfStock');
    const categoriesCount = new Set(products.map(p => p.category).filter(Boolean)).size;

    // Calculate some mock "analytics" or totals
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price || 0), 0);

    if (isLoading) return <div className="p-8"><div className="w-full h-64 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">Products Overview</h1>
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60">Analyze your catalog performance and inventory health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/products/all">
                        <Button variant="outline" className="h-14 px-6 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold">
                            View All Products <ArrowRight size={18} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Top Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4 group">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Package size={24} />
                        </div>
                        <span className="text-xs font-black tracking-widest text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">+12% this month</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{products.length}</div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Total Products</div>
                    </div>
                </div>

                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Activity size={24} />
                        </div>
                        <span className="text-xs font-black tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">Healthy</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{activeProducts.length}</div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Active Listings</div>
                    </div>
                </div>

                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl border border-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)] flex items-center justify-center">
                            <FolderTreeIcon size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{categoriesCount}</div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Categories</div>
                    </div>
                </div>
            </div>

            {/* Lower Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory Alerts */}
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-[var(--color-on-surface)]">Inventory Alerts</h3>
                        <Button variant="text" className="h-9 px-4 rounded-xl text-xs font-bold">View Status</Button>
                    </div>

                    {outOfStock.length > 0 ? (
                        <div className="space-y-4">
                            {outOfStock.slice(0, 3).map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-error)]/5 border border-[var(--color-error)]/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] flex items-center justify-center">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-[var(--color-on-surface)]">{p.name}</div>
                                            <div className="text-xs text-[var(--color-error)] font-bold">Out of Stock</div>
                                        </div>
                                    </div>
                                    <Link href={`/admin/products/${p.id}`}>
                                        <Button variant="outline" className="h-8 px-3 rounded-lg text-xs font-bold hover:bg-[var(--color-error)] hover:text-white transition-all hover:border-[var(--color-error)]">Restock</Button>
                                    </Link>
                                </div>
                            ))}
                            {outOfStock.length > 3 && (
                                <div className="text-center pt-2">
                                    <Link href="/admin/inventory" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
                                        + {outOfStock.length - 3} more items out of stock
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center opacity-60">
                            <CheckCircle2Icon size={40} className="text-emerald-500 mb-4" />
                            <p className="font-bold text-[var(--color-on-surface)]">All good!</p>
                            <p className="text-sm font-medium">No inventory alerts found.</p>
                        </div>
                    )}
                </div>

                {/* Catalog Value / Performance Placeholder */}
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] p-6 sm:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-[var(--color-on-surface)]">Est. Catalog Value</h3>
                        <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 flex items-center justify-center text-[var(--color-on-surface)]">
                            <DollarSign size={18} />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                        <div className="text-5xl font-black text-[var(--color-on-surface)] tracking-tighter mb-2">
                            <span className="text-2xl opacity-40 mr-1">{products[0]?.currency || '$'}</span>
                            {totalInventoryValue.toLocaleString()}
                        </div>
                        <p className="text-sm font-medium text-[var(--color-on-surface-variant)] max-w-xs opacity-60">
                            Combined value of all active product prices in your catalog.
                        </p>
                    </div>

                    <div className="mt-8 p-4 rounded-2xl bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-sm font-bold flex items-center justify-center gap-2">
                        <BarChart3 size={18} /> Detailed sales analytics coming soon
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple internal icon overrides if missing from generic import
function FolderTreeIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /><path d="M12 10v6" /><path d="M9 13h6" /></svg>;
}

function CheckCircle2Icon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>;
}
