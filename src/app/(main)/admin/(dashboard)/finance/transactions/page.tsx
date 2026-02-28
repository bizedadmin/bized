"use client";

import React, { useEffect, useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { ArrowRightLeft, Plus, Search, Filter, Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft, AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

interface Transaction {
    _id: string;
    description: string;
    amount: number;
    date: string;
    type: "Debit" | "Credit";
    accountId: string;
    accountName?: string;
    category: string;
    referenceType: string;
    "@type": string;
}

interface Account {
    _id: string;
    code: string;
    name: string;
    type: string;
}

const CATEGORIES = [
    "Sales", "Cost of Goods Sold", "Payroll", "Rent", "Utilities",
    "Marketing", "Equipment", "Travel", "Professional Services",
    "Loan Repayment", "Tax Payment", "Other"
];

export default function TransactionsPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // New transaction form
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [form, setForm] = useState({
        accountId: "",
        type: "Credit" as "Debit" | "Credit",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "Sales",
        referenceType: "Manual",
    });

    const fetchTransactions = () => {
        if (!currentBusiness?._id) return;
        setLoading(true);
        fetch(`/api/finance/transactions?storeId=${currentBusiness._id}`)
            .then(res => res.json())
            .then(data => {
                if (data.transactions) setTransactions(data.transactions);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (!currentBusiness?._id) return;
        // Fetch accounts for the picker
        fetch(`/api/finance/accounts?storeId=${currentBusiness._id}`)
            .then(res => res.json())
            .then(data => {
                if (data.accounts) {
                    const sorted = [...data.accounts].sort((a, b) => (a.code || "").localeCompare(b.code || ""));
                    setAccounts(sorted);
                    // Default to first account
                    if (sorted.length > 0) setForm(f => ({ ...f, accountId: sorted[0]._id }));
                }
            });
        fetchTransactions();
    }, [currentBusiness?._id]);

    const handleSubmit = async () => {
        if (!form.accountId || !form.amount || !form.description) {
            setFormError("Please fill in all required fields.");
            return;
        }
        setIsSaving(true);
        setFormError(null);
        try {
            const res = await fetch("/api/finance/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: currentBusiness?._id,
                    ...form,
                    amount: parseFloat(form.amount),
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to record transaction");
            setShowForm(false);
            setForm({
                accountId: accounts[0]?._id ?? "",
                type: "Credit",
                amount: "",
                date: new Date().toISOString().split("T")[0],
                description: "",
                category: "Sales",
                referenceType: "Manual",
            });
            fetchTransactions();
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = transactions.filter(t =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.referenceType?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading || loading) return (
        <div className="p-8">
            <div className="w-full h-96 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" />
        </div>
    );

    return (
        <>
            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <ArrowRightLeft size={24} />
                            </div>
                            General Ledger
                        </h1>
                        <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                            All financial journal entries · Schema.org TransferAction
                        </p>
                    </div>
                    <Button
                        onClick={() => { setShowForm(true); setFormError(null); }}
                        className="h-12 px-5 rounded-2xl gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    >
                        <Plus size={18} /> Record Journal Entry
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                    <div className="p-4 border-b border-[var(--color-outline-variant)]/10 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-50" size={18} />
                            <input
                                type="text"
                                placeholder="Search description, category, reference..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--color-surface-container)]/50 text-[var(--color-on-surface-variant)] text-xs uppercase tracking-wider font-extrabold border-b border-[var(--color-outline-variant)]/10">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Account</th>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                                {filtered.map((t) => {
                                    const account = accounts.find(a => a._id === t.accountId);
                                    return (
                                        <tr key={t._id} className="hover:bg-[var(--color-surface-container-high)] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[var(--color-on-surface)]">
                                                        {new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                    <span className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">
                                                        {new Date(t.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === "Credit" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                                                        {t.type === "Credit" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[var(--color-on-surface)]">{t.description}</span>
                                                        <span className="text-xs text-[var(--color-on-surface-variant)] opacity-60">{t.category || "Uncategorized"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {account ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] font-bold text-[var(--color-primary)] opacity-70">{account.code}</span>
                                                        <span className="text-sm font-medium text-[var(--color-on-surface-variant)]">{account.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs opacity-40">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)]">
                                                    {t.referenceType || "Manual"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-black uppercase tracking-widest ${t.type === "Credit" ? "text-emerald-600" : "text-rose-600"}`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black ${t.type === "Credit" ? "text-emerald-600" : "text-rose-600"}`}>
                                                {t.type === "Credit" ? "+" : "-"}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-[var(--color-on-surface-variant)] opacity-40">
                                            <ArrowRightLeft size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-bold">{search ? "No matching transactions." : "No journal entries yet."}</p>
                                            <p className="text-xs font-medium mt-1">Click &#34;Record Journal Entry&#34; to post your first transaction.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Record Transaction Sheet */}
            <Sheet
                open={showForm}
                onClose={() => setShowForm(false)}
                title="Record Journal Entry"
                icon={<BookOpen size={20} />}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <Button variant="outline" onClick={() => setShowForm(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving ? "Posting..." : "Post Entry"}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-5">
                    {/* Type toggle */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">Entry Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["Credit", "Debit"] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setForm(f => ({ ...f, type: t }))}
                                    className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${form.type === t
                                            ? t === "Credit"
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                                                : "bg-rose-500/10 border-rose-500/30 text-rose-600"
                                            : "border-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)] opacity-50"
                                        }`}
                                >
                                    {t === "Credit" ? "↓ Credit (Money In)" : "↑ Debit (Money Out)"}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] font-medium opacity-40 px-1">
                            Credit = money received into an account · Debit = money paid out
                        </p>
                    </div>

                    {/* Account picker */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">Account *</label>
                        <select
                            value={form.accountId}
                            onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]"
                        >
                            {accounts.map(a => (
                                <option key={a._id} value={a._id}>
                                    {a.code} · {a.name} ({a.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">Amount *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--color-on-surface-variant)] opacity-40">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                className="w-full pl-8 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">Date *</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">Description *</label>
                        <input
                            type="text"
                            placeholder="e.g. Customer payment for Invoice #001"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]"
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">Category</label>
                        <select
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]"
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Error */}
                    {formError && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-start gap-3">
                            <AlertCircle className="shrink-0 mt-0.5" size={16} />
                            <p className="font-medium">{formError}</p>
                        </div>
                    )}
                </div>
            </Sheet>
        </>
    );
}
