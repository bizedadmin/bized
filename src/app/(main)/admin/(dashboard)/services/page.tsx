"use client";

import React, { useState } from "react";
import {
    Briefcase, Plus, Search, Filter, ArrowUpDown,
    Edit2, Trash2, MapPin,
    TrendingUp, Info, CheckCircle2, ChevronRight
} from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ServicesPage() {
    const { currentBusiness, updateBusiness, isLoading } = useBusiness();
    const [searchQuery, setSearchQuery] = useState("");

    const services = currentBusiness?.services || [];
    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.areaServed?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteService = async (id: string) => {
        if (!currentBusiness || !confirm("Are you sure?")) return;
        await updateBusiness({ services: services.filter(s => s.id !== id) });
    };

    if (isLoading) return <div className="p-8"><div className="w-full h-64 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">Services</h1>
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60">Manage your service offerings, expertise and regions.</p>
                </div>
                <Link href="/admin/services/new">
                    <Button className="h-14 px-8 rounded-[var(--radius-m3-xl)] gap-2 shadow-[var(--shadow-m3-2)] hover:shadow-[var(--shadow-m3-3)] transition-all bg-[var(--color-primary)] text-[var(--color-on-primary)] active:scale-95">
                        <Plus size={22} strokeWidth={3} /> <span className="text-lg">Add Service</span>
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: "Total Services", value: services.length, icon: Briefcase, color: "var(--color-primary)" },
                    { label: "Active Regions", value: new Set(services.map(s => s.areaServed).filter(Boolean)).size, icon: MapPin, color: "oklch(0.6 0.15 150)" },
                    { label: "Revenue Stream", value: services.filter(s => (s.price ?? 0) > 0).length, icon: TrendingUp, color: "oklch(0.55 0.15 285)" },
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
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] shadow-[var(--shadow-m3-1)] overflow-hidden flex flex-col">
                <div className="p-5 flex flex-col sm:flex-row items-center gap-4 border-b border-[var(--color-outline-variant)]/10">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] group-focus-within:opacity-100 transition-all" size={20} />
                        <input
                            type="text"
                            placeholder="Find services by name or region..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all shadow-inner placeholder:opacity-30"
                        />
                    </div>
                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                        <Button variant="outline" className="h-14 px-5 rounded-2xl gap-2 font-black text-xs tracking-widest bg-[var(--color-surface)] flex-1 sm:flex-none">
                            <Filter size={18} /> Filters
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-outline-variant)]/10 text-[11px] font-black tracking-[1px] text-[var(--color-on-surface-variant)] opacity-40">
                                <th className="px-8 py-5">Service overview</th>
                                <th className="px-8 py-5">Availability area</th>
                                <th className="px-8 py-5">Starting price</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                            {filteredServices.map((service) => (
                                <tr key={service.id} className="group hover:bg-[var(--color-primary)]/[0.03] transition-colors relative">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] flex-shrink-0 flex items-center justify-center border border-[var(--color-outline-variant)]/20 shadow-sm relative z-10 transition-transform group-hover:scale-110">
                                                <Briefcase size={20} className="text-[var(--color-primary)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-base text-[var(--color-on-surface)] truncate group-hover:text-[var(--color-primary)] transition-colors">{service.name}</div>
                                                <div className="text-[10px] font-medium text-[var(--color-on-surface-variant)] opacity-50 mt-1 line-clamp-1">
                                                    {service.description || 'No description provided.'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="opacity-40" />
                                            <span className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-80">
                                                {service.areaServed || 'Global'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-lg font-black text-[var(--color-on-surface)] tracking-tight">
                                            <span className="text-xs opacity-40 mr-1">{service.currency}</span>
                                            {service.price?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/services/${service.id}`}>
                                                <button className="w-10 h-10 rounded-xl hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-on-surface-variant)] transition-all flex items-center justify-center active:scale-90 shadow-sm">
                                                    <Edit2 size={18} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteService(service.id)}
                                                className="w-10 h-10 rounded-xl hover:bg-[var(--color-error)] hover:text-white text-[var(--color-on-surface-variant)] transition-all flex items-center justify-center active:scale-90"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredServices.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-surface-container-low)]/20">
                        <div className="w-20 h-20 rounded-[2rem] bg-[var(--color-surface-container)] flex items-center justify-center mb-6 opacity-20">
                            <Briefcase size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-on-surface)]">No services found</h3>
                        <p className="text-[var(--color-on-surface-variant)] opacity-50 mt-1">Try refining your search or add a new service.</p>
                        <Link href="/admin/services/new">
                            <Button variant="outline" className="mt-6 rounded-2xl h-11 px-6 shadow-sm">
                                Create your first service
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
