"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, ShieldCheck, Zap, ExternalLink, Search, Loader2, Building2, Globe, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface WabaBusiness {
    _id: string;
    name: string;
    slug: string;
    socialLinks: {
        whatsappConnected: boolean;
        whatsappWabaId?: string;
        whatsappBusiness?: {
            wabaId?: string;
            phoneNumberId?: string;
            businessName?: string;
            status?: string;
            verified?: boolean;
        }
    }
}

export default function HQWhatsAppMonitor() {
    const [businesses, setBusinesses] = useState<WabaBusiness[]>([]);
    const [stats, setStats] = useState({ total: 0, metaAppId: "", configId: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/hq/whatsapp");
            const data = await res.json();
            if (data.businesses) {
                setBusinesses(data.businesses);
                setStats({
                    total: data.total,
                    metaAppId: data.metaAppId,
                    configId: data.configId
                });
            }
        } catch (error) {
            console.error("Failed to fetch WABA data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredBusinesses = businesses.filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.socialLinks.whatsappBusiness?.wabaId?.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-white">WhatsApp Platform Monitor</h1>
                    <p className="text-neutral-500 font-medium">Monitoring official WABA integrations across all tenants.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <div className="px-5 py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center gap-2">
                        <Zap size={14} className="fill-indigo-400" />
                        {stats.total} Active Integrations
                    </div>
                </div>
            </div>

            {/* Platform Settings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Globe size={20} />
                        </div>
                        <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-widest">Meta App ID</h3>
                    </div>
                    <p className="text-xl font-mono font-black text-white">{stats.metaAppId || "Not Configured"}</p>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-widest">WABA Config ID</h3>
                    </div>
                    <p className="text-xl font-mono font-black text-white">{stats.configId || "Not Configured"}</p>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-widest">Webhook Status</h3>
                    </div>
                    <p className="text-xl font-black text-emerald-500 italic">Active & Healthy</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search by business name or WABA ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-14 pl-12 pr-6 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-indigo-500/50 outline-none font-medium text-white transition-all shadow-inner"
                />
            </div>

            {/* List */}
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-neutral-900/50 border-b border-neutral-800 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                            <th className="px-8 py-5">Storefront Business</th>
                            <th className="px-6 py-5">WhatsApp Identity</th>
                            <th className="px-6 py-5">System IDs</th>
                            <th className="px-6 py-5 text-right px-8">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-40">
                                        <Loader2 className="animate-spin" size={32} />
                                        <p className="text-sm font-bold italic">Scanning platform integrations...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredBusinesses.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-40">
                                        <AlertCircle size={32} />
                                        <p className="text-sm font-bold italic">No businesses found matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredBusinesses.map((business) => (
                                <tr key={business._id} className="hover:bg-neutral-900/40 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black text-white tracking-tight">{business.name}</div>
                                                <div className="text-xs text-neutral-600 font-mono">/{business.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-1">
                                            <div className="text-sm font-bold text-neutral-300">
                                                {business.socialLinks.whatsappBusiness?.businessName || business.name}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-wider">Verified</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-1.5 font-mono">
                                            <div className="text-[10px] flex items-center gap-2">
                                                <span className="text-neutral-600 w-16">WABA:</span>
                                                <span className="text-indigo-400">{business.socialLinks.whatsappBusiness?.wabaId || 'N/A'}</span>
                                            </div>
                                            <div className="text-[10px] flex items-center gap-2">
                                                <span className="text-neutral-600 w-16">PHONE:</span>
                                                <span className="text-neutral-400">{business.socialLinks.whatsappBusiness?.phoneNumberId || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">{business.socialLinks.whatsappBusiness?.status || 'Active'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Tip */}
            <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h5 className="font-black italic text-indigo-400 tracking-tight">Admin Note</h5>
                    <p className="text-sm text-neutral-500 leading-relaxed mt-1">
                        Integrations are updated in real-time via Meta Webhooks. If a business status shows "Pending",
                        it may require verification in the Meta Business Manager.
                    </p>
                </div>
            </div>
        </div>
    );
}
