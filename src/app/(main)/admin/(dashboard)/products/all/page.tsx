"use client";

import React, { useState } from "react";
import {
    Package, Plus, Search, Filter, ArrowUpDown,
    ShoppingBag,
    TrendingUp, AlertCircle, CheckCircle2, ChevronRight
} from "lucide-react";
import { ProductItem, useBusiness, ProductCategory } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Trash2, Edit2 } from "lucide-react";

export default function ProductsPage() {
    const router = useRouter();
    const { currentBusiness, updateBusiness, isLoading } = useBusiness();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const products = currentBusiness?.products || [];
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDeleteProduct = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenu(null);
        if (!currentBusiness || !confirm("Are you sure?")) return;
        await updateBusiness({ products: products.filter(p => p.id !== id) });
    };

    const handleRowClick = (id: string) => {
        router.push(`/admin/products/${id}`);
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    const categories = (currentBusiness?.productCategories || []) as ProductCategory[];

    const getCategoryName = (idOrName?: string) => {
        if (!idOrName) return 'General';
        const found = categories.find(c => c.id === idOrName);
        return found ? found.name : idOrName;
    };

    // Helper to generate a flat list of categories with indentation for the <select>
    const renderCategoryOptions = () => {
        if (categories.length === 0) return null;
        const options: React.ReactNode[] = [];
        const addChildren = (parentId: string | undefined, level: number) => {
            categories
                .filter(c => c.parentId === parentId)
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(cat => {
                    const prefix = level > 0 ? '\u00A0\u00A0'.repeat(level) + '↳\u00A0' : '';
                    options.push(
                        <option key={cat.id} value={cat.id}>
                            {prefix}{cat.name.toUpperCase()}
                        </option>
                    );
                    addChildren(cat.id, level + 1);
                });
        };
        addChildren(undefined, 0);
        return options;
    };

    if (isLoading) return <div className="p-8"><div className="w-full h-64 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">Inventory</h1>
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60">Manage products, pricing and availability.</p>
                </div>
                <Link href="/admin/products/new">
                    <Button
                        className="h-14 px-8 rounded-[var(--radius-m3-xl)] gap-2 shadow-[var(--shadow-m3-2)] hover:shadow-[var(--shadow-m3-3)] transition-all bg-[var(--color-primary)] text-[var(--color-on-primary)] active:scale-95"
                    >
                        <Plus size={22} strokeWidth={3} /> <span className="text-lg">Add Product</span>
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Products", value: products.length, icon: Package, color: "var(--color-primary)" },
                    { label: "Active Listings", value: products.filter(p => p.availability !== 'OutOfStock').length, icon: TrendingUp, color: "oklch(0.6 0.15 150)" }, // Tertiary-ish
                    { label: "Low Stock", value: 0, icon: AlertCircle, color: "oklch(0.6 0.2 60)" }, // Warning-ish
                    { label: "Categories", value: categories.length, icon: ShoppingBag, color: "oklch(0.55 0.15 285)" }, // Secondary-ish
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[var(--radius-m3-xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex items-center gap-5 group hover:shadow-[var(--shadow-m3-2)] transition-all">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={26} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-[var(--color-on-surface)] tracking-tight">{stat.value}</div>
                            <div className="text-xs text-[var(--color-on-surface-variant)] opacity-50 font-black tracking-widest">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Table */}
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] shadow-[var(--shadow-m3-1)] flex flex-col">
                <div className="p-5 flex flex-col sm:flex-row items-center gap-4 border-b border-[var(--color-outline-variant)]/10">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] group-focus-within:opacity-100 transition-all" size={20} />
                        <input
                            type="text"
                            placeholder="Find products by name, SKU or brand..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all shadow-inner placeholder:opacity-30"
                        />
                    </div>
                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-14 px-5 pr-10 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 text-xs font-black tracking-widest outline-none focus:border-[var(--color-primary)] transition-all flex-1 sm:flex-none appearance-none cursor-pointer"
                        >
                            <option value="All">ALL CATEGORIES</option>
                            {renderCategoryOptions()}
                        </select>
                        <Button variant="outline" className="h-14 px-5 rounded-2xl gap-2 font-black text-xs tracking-widest bg-[var(--color-surface)] flex-1 sm:flex-none">
                            <ArrowUpDown size={18} /> Sort
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto sm:overflow-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-outline-variant)]/10 text-[11px] font-black tracking-[1px] text-[var(--color-on-surface-variant)] opacity-40">
                                <th className="px-8 py-5">Product info</th>
                                <th className="px-8 py-5">Classification</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Value</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product.id}
                                    onClick={() => handleRowClick(product.id)}
                                    className="group hover:bg-[var(--color-primary)]/[0.03] transition-colors relative cursor-pointer"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[var(--color-outline-variant)]/20 shadow-sm relative z-10">
                                                {product.image ? (
                                                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ShoppingBag size={24} className="opacity-10" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-base text-[var(--color-on-surface)] truncate group-hover:text-[var(--color-primary)] transition-colors">{product.name}</div>
                                                <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] opacity-50 mt-1">
                                                    SKU: {product.sku || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-80 bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-outline-variant)]/10 shadow-sm">
                                            {getCategoryName(product.category)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn(
                                                "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                                                product.availability === 'InStock' ? "bg-emerald-500" : "bg-amber-500"
                                            )} />
                                            <span className={cn(
                                                "text-xs font-black tracking-tight",
                                                product.availability === 'InStock' ? "text-emerald-700" : "text-amber-700"
                                            )}>
                                                {product.availability === 'InStock' ? 'Live' : product.availability?.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-lg font-black text-[var(--color-on-surface)] tracking-tight">
                                            <span className="text-xs opacity-40 mr-1">{product.currency}</span>
                                            {product.price?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end relative">
                                            <button
                                                onClick={(e) => toggleMenu(e, product.id)}
                                                className="w-10 h-10 rounded-xl hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] transition-all flex items-center justify-center active:scale-90"
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenu === product.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-[100]"
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}
                                                    />
                                                    <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-2xl shadow-2xl z-[101] animate-in fade-in zoom-in-95 duration-100">
                                                        <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors">
                                                            <Eye size={18} className="opacity-60" /> View Details
                                                        </Link>
                                                        <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors">
                                                            <Edit2 size={18} className="opacity-60" /> Edit Product
                                                        </Link>
                                                        <div className="h-px bg-[var(--color-outline-variant)]/10 my-1" />
                                                        <button
                                                            onClick={(e) => handleDeleteProduct(e, product.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 size={18} /> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-surface-container-low)]/20">
                        <div className="w-20 h-20 rounded-[2rem] bg-[var(--color-surface-container)] flex items-center justify-center mb-6 opacity-20">
                            <Package size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-on-surface)]">No products found</h3>
                        <p className="text-[var(--color-on-surface-variant)] opacity-50 mt-1">Try refining your search or add a new product.</p>
                        <Link href="/admin/products/new">
                            <Button
                                variant="outline"
                                className="mt-6 rounded-2xl h-11 px-6 shadow-sm"
                            >
                                Add your first product
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
