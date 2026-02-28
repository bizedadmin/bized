"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, Loader2, ShoppingBag } from "lucide-react";
import { useBusiness, type ProductItem } from "@/contexts/BusinessContext";
import { useAi } from "@/contexts/AiContext";

const uid = () => Math.random().toString(36).substring(2, 10);

export function CatalogEditor() {
    const { currentBusiness, isLoading, updateBusiness } = useBusiness();
    const [items, setItems] = useState<ProductItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (currentBusiness) {
            setItems(currentBusiness.products || []);
        }
    }, [currentBusiness]);

    const handleUpdateItem = (id: string, field: keyof ProductItem, value: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleAddItem = () => {
        setItems(prev => [...prev, { id: uid(), name: "", price: 0, currency: "KES" }]);
    };

    const handleSave = async () => {
        setSaving(true);
        const ok = await updateBusiness({ products: items });
        setSaving(false);
        if (ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const { setContextData, setOnApplyChanges } = useAi();

    const handleAiApply = React.useCallback((changes: any) => {
        if (changes.products) {
            setItems(changes.products);
        } else if (changes.updateAll) {
            setItems(prev => prev.map(item => ({ ...item, ...changes.updateAll })));
        }
    }, []);

    // AI Context Registration
    useEffect(() => {
        if (items.length > 0) {
            setContextData({ products: items });
            setOnApplyChanges(() => handleAiApply);
        }
        return () => {
            setContextData(null);
            setOnApplyChanges(null);
        };
    }, [items, setContextData, setOnApplyChanges, handleAiApply]);

    if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-[var(--color-surface-container-low)] animate-pulse" />)}</div>;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8 px-4 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">Product Catalog</h2>
                    <p className="text-[var(--color-on-surface-variant)] opacity-70">Manage the items you sell in your store.</p>
                </div>
                <button
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="space-y-4 px-4">
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-outline-variant)]/20 rounded-2xl">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-[var(--color-on-surface-variant)] opacity-50">No products yet. Click "Add Product" to start.</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="relative group rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 p-5 hover:border-[var(--color-primary)]/30 transition-all">
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="absolute top-4 right-4 text-red-500 opacity-20 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Product Name</label>
                                    <input
                                        className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm transition-all"
                                        placeholder="e.g. Fresh Espresso Beans"
                                        value={item.name}
                                        onChange={e => handleUpdateItem(item.id, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Price</label>
                                        <input
                                            type="number"
                                            className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm transition-all"
                                            value={item.price}
                                            onChange={e => handleUpdateItem(item.id, 'price', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Currency</label>
                                        <input
                                            className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm transition-all"
                                            value={item.currency}
                                            onChange={e => handleUpdateItem(item.id, 'currency', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Image URL (Optional)</label>
                                    <input
                                        className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm transition-all"
                                        placeholder="https://..."
                                        value={item.image || ""}
                                        onChange={e => handleUpdateItem(item.id, 'image', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {items.length > 0 && (
                <div className="mt-12 px-4 sticky bottom-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--color-primary)]/30"} disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]`}
                    >
                        {saving ? <><Loader2 size={20} className="animate-spin" /> Saving Changes...</> : saved ? <><Check size={20} /> Saved to Catalog</> : <><Check size={20} /> Save Product Changes</>}
                    </button>
                </div>
            )}
        </div>
    );
}
