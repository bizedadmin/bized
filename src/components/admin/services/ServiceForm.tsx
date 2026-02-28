"use client";

import React, { useState, useEffect } from "react";
import {
    X, Loader2, Check,
    Type, FileText, DollarSign, Briefcase,
    Globe, ChevronLeft, Save, MapPin, Coins
} from "lucide-react";
import { ServiceItem } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { CurrencyModal } from "@/components/admin/settings/CurrencyModal";
import { CURRENCIES } from "@/lib/currencies";

interface ServiceFormProps {
    initialData?: ServiceItem | null;
    onSave: (service: ServiceItem) => Promise<void>;
    isSubmitting?: boolean;
}

export function ServiceForm({ initialData, onSave, isSubmitting }: ServiceFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<ServiceItem>>({
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        areaServed: ""
    });
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            ...formData,
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
        } as ServiceItem);
        router.push("/admin/services");
    };

    return (
        <form onSubmit={handleSubmit} className="min-h-screen bg-[var(--color-surface)]">
            {/* Mobile Header */}
            <div className="sticky top-0 z-40 flex items-center justify-between p-4 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/10 sm:hidden">
                <button type="button" onClick={() => router.back()} className="p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors">
                    <ChevronLeft size={24} className="text-[var(--color-on-surface)]" />
                </button>
                <h2 className="font-bold text-lg text-[var(--color-on-surface)]">{initialData ? "Edit Service" : "New Service"}</h2>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
                {/* Desktop Header */}
                <div className="hidden sm:flex items-center justify-between mb-2">
                    <div className="flex items-center gap-5">
                        <button type="button" onClick={() => router.back()} className="p-3.5 rounded-2xl bg-[var(--color-surface-container-high)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-all group active:scale-95">
                            <ChevronLeft size={22} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{initialData ? "Edit Service" : "Create Service"}</h1>
                            <p className="text-[var(--color-on-surface-variant)] opacity-70 text-sm mt-1">Define your service offerings and pricing for clients.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Primary Info */}
                    <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <Briefcase size={20} />
                            </div>
                            <h3 className="font-bold text-xl">Service Details</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1">Service Name</label>
                                <div className="relative group">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all" size={20} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Professional Consultation"
                                        value={formData.name}
                                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className="w-full h-[56px] pl-12 pr-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] text-lg font-bold transition-all shadow-sm focus:shadow-md placeholder:font-medium placeholder:opacity-30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1">Description</label>
                                <textarea
                                    placeholder="Explain what is included in this service..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="w-full p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] text-sm leading-relaxed transition-all shadow-sm focus:shadow-md resize-none placeholder:opacity-40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Region */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-8 border border-[var(--color-outline-variant)]/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                    <DollarSign size={20} />
                                </div>
                                <h3 className="font-bold text-xl">Pricing</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-40 px-1">Starting price</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all font-bold text-lg">
                                            {CURRENCIES.find(c => c.code === formData.currency)?.symbol || "$"}
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.price || ""}
                                            onChange={e => setFormData(p => ({ ...p, price: parseFloat(e.target.value) }))}
                                            className="w-full h-[56px] pl-10 pr-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] font-black text-xl transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-40 px-1">Currency</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCurrencyModalOpen(true)}
                                        className="w-full h-14 pl-4 pr-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/50 transition-all flex items-center justify-between group text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-sm">
                                                {CURRENCIES.find(c => c.code === formData.currency)?.name || formData.currency}
                                            </span>
                                        </div>
                                        <Coins className="text-[var(--color-on-surface-variant)] opacity-30" size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-8 border border-[var(--color-outline-variant)]/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="font-bold text-xl">Service Area</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-40 px-1">Regions covered</label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all" size={20} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Worldwide, Nairobi, UK"
                                        value={formData.areaServed}
                                        onChange={e => setFormData(p => ({ ...p, areaServed: e.target.value }))}
                                        className="w-full h-[56px] pl-12 pr-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] font-bold transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-40 italic mt-2 ml-1">Optional: Leave empty for location-independent services.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer for Mobile / Bottom Actions for Desktop */}
                <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-0 sm:relative bg-[var(--color-surface)]/80 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-[var(--color-outline-variant)]/10 sm:border-0 z-40">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="hidden sm:flex h-14 px-8 rounded-2xl font-bold flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-14 flex-[2] rounded-2xl font-bold gap-3 shadow-[0_12px_24px_-8px_var(--color-primary-alpha)] active:scale-[0.98] transition-all bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                        >
                            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                            <span className="text-lg">{initialData ? "Apply changes" : "Create service"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <CurrencyModal
                isOpen={isCurrencyModalOpen}
                onClose={() => setIsCurrencyModalOpen(false)}
                selectedCode={formData.currency}
                onSelect={(curr) => {
                    setFormData(prev => ({ ...prev, currency: curr.code }));
                    setIsCurrencyModalOpen(false);
                }}
            />
        </form>
    );
}
