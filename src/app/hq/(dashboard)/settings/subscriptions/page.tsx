"use client";

import React, { useEffect, useState } from "react";
import { Check, Plus, AlertCircle, Loader2, Save, X, Globe, Layers, User, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

export default function PlatformSubscriptions() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [syncWithGateways, setSyncWithGateways] = useState(false);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/hq/plans");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setPlans(data.plans || []);
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/hq/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editingPlan, syncWithGateways }),
            });
            if (!res.ok) throw new Error("Failed to save plan");
            setShowModal(false);
            fetchPlans();
        } catch (e: any) {
            alert(e.message);
        }
        setIsSaving(false);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] opacity-40">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-bold text-sm tracking-widest uppercase">Syncing Tiers...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Globe className="text-indigo-500" /> Subscription Management
                    </h1>
                    <p className="text-zinc-400 font-medium italic">Configure pricing tiers & gatekeep feature limits across the Bized ecosystem.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingPlan({
                            id: "", name: "", description: "", price: 0, currency: "USD", interval: "monthly",
                            features: [], limits: { maxProducts: 50, maxStaff: 1, customDomain: false, analyticsLevel: "basic" },
                            status: "draft"
                        });
                        setShowModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl px-6 font-black uppercase text-xs tracking-widest gap-2"
                >
                    <Plus size={16} /> New Tier
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(tier => (
                    <div
                        key={tier._id}
                        className={`group relative rounded-[2.5rem] border p-8 flex flex-col h-full bg-zinc-900/50 backdrop-blur-xl transition-all hover:bg-zinc-900/80 ${tier.status === "active" ? "border-indigo-500/20" : "border-zinc-800 opacity-60"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-white">{tier.name}</h3>
                                <p className="text-sm text-zinc-500 font-medium mt-1 leading-relaxed">{tier.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${tier.status === "active" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                                    }`}>
                                    {tier.status}
                                </span>
                                {tier.gateways?.stripe && (
                                    <span className="text-[8px] font-black uppercase opacity-30 tracking-tighter">🔗 Stripe Synced</span>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <span className="text-5xl font-black text-white tracking-tighter">
                                {tier.price === 0 ? "FREE" : `${tier.currency} ${tier.price}`}
                            </span>
                            <span className="text-sm text-zinc-600 font-bold ml-2">/ {tier.interval}</span>
                        </div>

                        <div className="flex-1 space-y-4 mb-10">
                            {/* Limits visualization */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <Package size={14} className="text-zinc-500 mb-1" />
                                    <p className="text-[10px] font-black text-zinc-600 uppercase">Products</p>
                                    <p className="text-sm font-black text-white">{tier.limits.maxProducts === 99999 ? "∞" : tier.limits.maxProducts}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                    <User size={14} className="text-zinc-500 mb-1" />
                                    <p className="text-[10px] font-black text-zinc-600 uppercase">Staff</p>
                                    <p className="text-sm font-black text-white">{tier.limits.maxStaff}</p>
                                </div>
                            </div>

                            {tier.features.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-8 border-t border-zinc-800/50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Pricing ID</span>
                                <span className="text-xs font-mono text-zinc-400 truncate max-w-[120px]">
                                    {tier.gateways?.stripe?.priceId || "not-synced"}
                                </span>
                            </div>
                            <Button
                                onClick={() => { setEditingPlan(tier); setShowModal(true); }}
                                variant="outline"
                                className="h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border-zinc-800 hover:bg-zinc-800 text-zinc-400"
                            >
                                Edit Tier
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Plan Editor Sheet */}
            <Sheet
                open={showModal}
                onClose={() => setShowModal(false)}
                title={editingPlan?._id ? "Edit Plan" : "Create Plan"}
                icon={<Layers size={20} />}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 text-white min-w-[120px]">
                            {isSaving ? "Saving..." : "Save Plan"}
                        </Button>
                    </div>
                }
            >
                {editingPlan && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">Internal ID</label>
                                <input
                                    value={editingPlan.id}
                                    onChange={e => setEditingPlan({ ...editingPlan, id: e.target.value })}
                                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm font-bold focus:border-indigo-500 outline-none"
                                    placeholder="e.g. starter"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">Display Name</label>
                                <input
                                    value={editingPlan.name}
                                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm font-bold focus:border-indigo-500 outline-none"
                                    placeholder="e.g. Pro Plan"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">Price</label>
                                <input
                                    type="number"
                                    value={editingPlan.price}
                                    onChange={e => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm font-bold focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">Currency</label>
                                <select
                                    value={editingPlan.currency}
                                    onChange={e => setEditingPlan({ ...editingPlan, currency: e.target.value })}
                                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm font-bold focus:border-indigo-500 outline-none"
                                >
                                    <option value="USD">USD</option>
                                    <option value="KES">KES</option>
                                    <option value="NGN">NGN</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">Interval</label>
                                <select
                                    value={editingPlan.interval}
                                    onChange={e => setEditingPlan({ ...editingPlan, interval: e.target.value })}
                                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm font-bold focus:border-indigo-500 outline-none"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="forever">Forever</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                    <Package size={12} /> Max Products
                                </label>
                                <input
                                    type="number"
                                    value={editingPlan.limits.maxProducts}
                                    onChange={e => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, maxProducts: Number(e.target.value) } })}
                                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm font-bold focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                    <User size={12} /> Max Staff
                                </label>
                                <input
                                    type="number"
                                    value={editingPlan.limits.maxStaff}
                                    onChange={e => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, maxStaff: Number(e.target.value) } })}
                                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm font-bold focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black uppercase tracking-widest opacity-40">Description</label>
                            <textarea
                                value={editingPlan.description}
                                onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm font-bold focus:border-indigo-500 outline-none min-h-[80px]"
                            />
                        </div>

                        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Gateway Synchronization</p>
                                <p className="text-[10px] text-indigo-400/60 font-medium italic">Create/Update this plan on Stripe and Paystack automatically.</p>
                            </div>
                            <button
                                onClick={() => setSyncWithGateways(!syncWithGateways)}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${syncWithGateways ? "bg-indigo-600" : "bg-zinc-800"}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${syncWithGateways ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>
                )}
            </Sheet>
        </div>
    );
}
