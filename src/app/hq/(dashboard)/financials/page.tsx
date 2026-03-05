"use client";

import React, { useEffect, useState } from "react";
import {
    TrendingUp,
    Users,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    DollarSign,
    BarChart3,
    PieChart,
    Calendar,
    RefreshCcw,
    Zap,
    AlertCircle,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface FinancialSummary {
    totalMrr: number;
    activeSubscriptions: number;
    trialingSubscriptions: number;
    churnRate30d: number;
}

interface FinancialData {
    summary: FinancialSummary;
    revenueByPlan: Record<string, { count: number, mrr: number }>;
    recentActivity: any[];
    plans: { id: string, name: string, price: number }[];
}

export default function HQFinancialsPage() {
    const [data, setData] = useState<FinancialData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/hq/financials");
            if (!res.ok) throw new Error("Failed to fetch financial data");
            const result = await res.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-zinc-500 font-medium">Calculating platform treasury data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3">
                <AlertCircle size={20} />
                <p className="font-bold">{error}</p>
                <button onClick={fetchData} className="ml-auto underline font-bold">Retry</button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <BarChart3 className="text-indigo-500" size={36} />
                        Financial Treasury
                    </h1>
                    <p className="text-zinc-400 mt-2 text-lg">Platform-wide revenue, churn, and subscription growth metrics.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-bold hover:bg-neutral-800 transition-all text-neutral-300"
                >
                    <RefreshCcw size={16} /> Refresh Data
                </button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Monthly Recurring Revenue"
                    value={`$${data.summary.totalMrr.toLocaleString()}`}
                    subLabel="Current MRR projection"
                    icon={<DollarSign className="text-emerald-400" />}
                    trend="+12.5%"
                    trendUp={true}
                />
                <StatCard
                    label="Active Subscriptions"
                    value={data.summary.activeSubscriptions.toString()}
                    subLabel="Premium businesses"
                    icon={<Users className="text-blue-400" />}
                    trend={`${data.summary.trialingSubscriptions} trialing`}
                />
                <StatCard
                    label="30d Churn Rate"
                    value={`${data.summary.churnRate30d.toFixed(1)}%`}
                    subLabel="Canceled businesses"
                    icon={<TrendingUp className="text-rose-400" />}
                    trend="-2.1%"
                    trendUp={false}
                />
                <StatCard
                    label="Projected ARR"
                    value={`$${(data.summary.totalMrr * 12).toLocaleString()}`}
                    subLabel="Annual run rate"
                    icon={<Zap className="text-amber-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue by Plan */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8">
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                            <PieChart size={20} className="text-indigo-500" /> Revenue Distribution
                        </h3>
                        <div className="space-y-6">
                            {data.plans.map(plan => {
                                const stats = data.revenueByPlan[plan.id] || { count: 0, mrr: 0 };
                                const percentage = data.summary.totalMrr > 0 ? (stats.mrr / data.summary.totalMrr) * 100 : 0;

                                return (
                                    <div key={plan.id} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                    {plan.name}
                                                    <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full text-zinc-500 font-bold border border-neutral-700">
                                                        ${plan.price}/mo
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 font-medium">{stats.count} active subscribers</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-white">${stats.mrr.toLocaleString()}</div>
                                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{percentage.toFixed(1)}% share</div>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full rounded-full bg-gradient-to-r ${plan.id === 'pro' ? 'from-indigo-600 to-purple-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' :
                                                        plan.id === 'starter' ? 'from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                                            'from-zinc-500 to-zinc-400 opacity-40'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Growth Activity */}
                    <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-emerald-500" /> Recent Conversions
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-800">
                                        <th className="py-3 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Business</th>
                                        <th className="py-3 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Plan</th>
                                        <th className="py-3 font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Date</th>
                                        <th className="py-3 font-bold text-zinc-500 uppercase tracking-widest text-[10px] text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800/50">
                                    {data.recentActivity.map((item, i) => (
                                        <tr key={i} className="hover:bg-neutral-800/10 transition-colors group">
                                            <td className="py-4 font-bold text-zinc-200 group-hover:text-white">{item.name}</td>
                                            <td className="py-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                                                    {item.subscription.planId}
                                                </span>
                                            </td>
                                            <td className="py-4 text-zinc-500 font-mono text-xs">
                                                {new Date(item.subscription.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-[10px] font-black uppercase text-emerald-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                    Active
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.recentActivity.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-10 text-center text-zinc-600 italic">No recent conversions.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20 border border-indigo-500 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                            <CreditCard size={32} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Avg Revenue Per Unit</div>
                            <div className="text-4xl font-black mt-1">
                                ${data.summary.activeSubscriptions > 0 ? (data.summary.totalMrr / data.summary.activeSubscriptions).toFixed(2) : '0.00'}
                            </div>
                        </div>
                        <p className="text-sm opacity-60 font-medium">Monthly average across all premium tiers.</p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 space-y-6">
                        <h4 className="font-bold text-white text-sm uppercase tracking-widest flex items-center gap-2">
                            System Health
                        </h4>
                        <div className="space-y-4">
                            <HealthRow label="Payment Gateways" status="Operational" />
                            <HealthRow label="Cron Service" status="Operational" />
                            <HealthRow label="Sync Webhooks" status="Operational" />
                        </div>
                        <div className="pt-4 border-t border-neutral-800">
                            <button className="w-full h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-zinc-400 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2">
                                <Calendar size={14} /> Full System Status
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, subLabel, icon, trend, trendUp }: any) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 transition-all hover:border-neutral-700 group">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center border border-neutral-800">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trendUp === true ? 'text-emerald-500' : (trendUp === false ? 'text-rose-500' : 'text-zinc-500')}`}>
                        {trendUp === true ? <ArrowUpRight size={12} /> : (trendUp === false ? <ArrowDownRight size={12} /> : null)}
                        {trend}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-black text-white group-hover:scale-105 transition-transform origin-left">{value}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{label}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-800/50">
                <p className="text-[10px] text-zinc-600 font-medium italic">{subLabel}</p>
            </div>
        </div>
    );
}

function HealthRow({ label, status }: { label: string, status: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{label}</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {status}
            </span>
        </div>
    );
}
