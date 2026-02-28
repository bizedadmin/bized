"use client";

import React, { } from "react";
import { Plus, ChevronRight, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { useBusiness } from "@/contexts/BusinessContext";
import { useRouter } from "next/navigation";

export default function BusinessesPage() {
    const { businesses, isLoading, setCurrentBusiness } = useBusiness();
    const router = useRouter();

    const handleSelectBusiness = (storeId: string) => {
        setCurrentBusiness(storeId);
        router.push("/admin");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-16">
            <header className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight mb-2">My Businesses</h1>
                    <p className="text-[var(--color-on-surface-variant)] opacity-60">Select a business to manage or create a new one.</p>
                </div>
                <Link href="/businesses/new" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:opacity-90 transition-opacity">
                    <Plus size={18} />
                    <span>Create New Business</span>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((b) => (
                    <button
                        key={b._id}
                        onClick={() => handleSelectBusiness(b._id)}
                        className="group relative flex flex-col p-6 rounded-[2.5rem] bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary)]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left h-full"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] shadow-md overflow-hidden">
                                {b.logoUrl ? <img src={b.logoUrl} alt={b.name} className="w-full h-full object-cover" /> : <Store size={28} />}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <ChevronRight size={18} className="text-[var(--color-on-surface-variant)]" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <h2 className="text-2xl font-black text-[var(--color-on-surface)] mb-1 leading-tight">{b.name}</h2>
                            <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-50 font-mono">/{b.slug}</p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-[var(--color-outline-variant)]/10 flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${b.status === 'Active' || !b.status ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'
                                }`}>
                                {b.status || 'Active'}
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-wider">
                                {b.businessType || 'Retail'}
                            </span>
                        </div>
                    </button>
                ))}

                {/* Empty State Card if needed, or just link in header covers it */}
                {businesses.length === 0 && (
                    <div className="md:col-span-2 lg:col-span-3 py-20 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-[2rem] bg-[var(--color-surface-container-high)] flex items-center justify-center mb-6 text-[var(--color-on-surface-variant)] opacity-20">
                            <Store size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">No businesses found</h2>
                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-50 mb-8 max-w-sm">Get started by creating your first business.</p>
                        <Link href="/businesses/new" className="px-8 py-4 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold shadow-xl shadow-[var(--color-primary)]/20 hover:scale-105 transition-transform">
                            Create Business
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-20 text-center">
                <p className="text-[var(--color-on-surface-variant)] text-xs font-medium opacity-30">Bized Commerce OS</p>
            </div>
        </div>
    );
}
