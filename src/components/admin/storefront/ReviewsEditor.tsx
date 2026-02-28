"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, Loader2, Star } from "lucide-react";
import { useBusiness, type ReviewItem } from "@/contexts/BusinessContext";

const uid = () => Math.random().toString(36).substring(2, 10);

export function ReviewsEditor() {
    const { currentBusiness, isLoading, updateBusiness } = useBusiness();
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (currentBusiness) {
            setItems(currentBusiness.reviews || []);
        }
    }, [currentBusiness]);

    const handleUpdateItem = (id: string, field: keyof ReviewItem, value: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleAddItem = () => {
        setItems(prev => [...prev, { id: uid(), author: "", rating: 5, body: "", date: new Date().toISOString() }]);
    };

    const handleSave = async () => {
        setSaving(true);
        const ok = await updateBusiness({ reviews: items });
        setSaving(false);
        if (ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-[var(--color-surface-container-low)] animate-pulse" />)}</div>;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8 px-4 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">Customer Reviews</h2>
                    <p className="text-[var(--color-on-surface-variant)] opacity-70">Showcase what your customers are saying about you.</p>
                </div>
                <button
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={18} /> Add Review
                </button>
            </div>

            <div className="space-y-4 px-4">
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-outline-variant)]/20 rounded-2xl">
                        <Star size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-[var(--color-on-surface-variant)] opacity-50">No reviews yet. Click "Add Review" to start.</p>
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
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Customer Name</label>
                                        <input
                                            className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm transition-all"
                                            placeholder="e.g. John Doe"
                                            value={item.author}
                                            onChange={e => handleUpdateItem(item.id, 'author', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Rating</label>
                                        <div className="flex items-center gap-2 h-12 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleUpdateItem(item.id, 'rating', star)}
                                                    className={`transition-all ${star <= item.rating ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'}`}
                                                >
                                                    <Star size={20} fill={star <= item.rating ? 'currentColor' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Review Body</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm transition-all resize-none"
                                        placeholder="What did the customer say?"
                                        value={item.body}
                                        onChange={e => handleUpdateItem(item.id, 'body', e.target.value)}
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
                        {saving ? <><Loader2 size={20} className="animate-spin" /> Saving Changes...</> : saved ? <><Check size={20} /> Saved Reviews</> : <><Check size={20} /> Save Review Changes</>}
                    </button>
                </div>
            )}
        </div>
    );
}
