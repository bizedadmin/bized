"use client";

import React, { useEffect, useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { List, Plus, Search, Edit3, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HelpIcon } from "@/components/admin/HelpCenter";
import { Sheet } from "@/components/ui/Sheet";

interface Account {
    _id: string;
    name: string;
    type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
    category: string;
    status: string;
    code: string;
    "@type": string; // schema.org type
}

export default function ChartOfAccountsPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        category: ""
    });

    const fetchAccounts = () => {
        if (!currentBusiness?._id) return;
        setLoadingAccounts(true);
        fetch(`/api/finance/accounts?storeId=${currentBusiness._id}`)
            .then(res => res.json())
            .then(data => {
                if (data.accounts) {
                    const sorted = [...data.accounts].sort((a, b) => (a.code || "").localeCompare(b.code || ""));
                    setAccounts(sorted);
                }
                setLoadingAccounts(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingAccounts(false);
            });
    };

    useEffect(() => {
        fetchAccounts();
    }, [currentBusiness?._id]);

    const handleEditClick = (account: Account) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            code: account.code || "",
            category: account.category
        });
        setError(null);
    };

    const handleSave = async () => {
        if (!editingAccount || !currentBusiness?._id) return;
        setIsSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/finance/accounts`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingAccount._id,
                    storeId: currentBusiness._id,
                    ...formData
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update account");

            setEditingAccount(null);
            fetchAccounts();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || loadingAccounts) return <div className="p-8"><div className="w-full h-96 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    // Group accounts by type for the table display
    const groupedAccounts = accounts.reduce((acc, obj) => {
        if (!acc[obj.type]) acc[obj.type] = [];
        acc[obj.type].push(obj);
        return acc;
    }, {} as Record<string, Account[]>);

    return (
        <>
            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <List size={24} />
                            </div>
                            Chart of Accounts <HelpIcon topic="chartOfAccounts" />
                        </h1>
                        <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                            Global standard schema.org compliant ledger accounts.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="default" className="h-12 px-5 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                            <Plus size={18} /> New Account
                        </Button>
                    </div>
                </div>

                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                    <div className="p-4 border-b border-[var(--color-outline-variant)]/10 flex items-center justify-between">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-50" size={18} />
                            <input
                                type="text"
                                placeholder="Search accounts..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--color-surface-container)]/50 text-[var(--color-on-surface-variant)] text-xs uppercase tracking-wider font-extrabold border-b border-[var(--color-outline-variant)]/10">
                                <tr>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Account Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Schema Base</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                                {["Asset", "Liability", "Equity", "Revenue", "Expense"].map((type) => (
                                    <React.Fragment key={type}>
                                        {groupedAccounts[type] && groupedAccounts[type].length > 0 && (
                                            <tr className="bg-[var(--color-surface-container)]/30">
                                                <td colSpan={5} className="px-6 py-3 font-bold text-xs text-[var(--color-primary)] uppercase tracking-widest">
                                                    {type}
                                                </td>
                                            </tr>
                                        )}
                                        {groupedAccounts[type]?.map((account) => (
                                            <tr key={account._id} className="hover:bg-[var(--color-surface-container-high)] transition-colors group">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-primary)]">
                                                    {account.code || "----"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[var(--color-on-surface)] text-sm">{account.name}</span>
                                                        <span className="text-xs text-[var(--color-on-surface-variant)] opacity-60 font-medium">{account.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[var(--color-secondary-container)]/50 text-[var(--color-on-secondary-container)]">
                                                        {account.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs opacity-60">
                                                    {account["@type"] || "AccountingService"}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${(account.status ?? 'active') === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : 'bg-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)] opacity-60'
                                                        }`}>
                                                        {account.status ?? 'active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 px-3 rounded-lg text-xs font-bold text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleEditClick(account)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                                {accounts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-on-surface-variant)] opacity-60 font-medium">
                                            No accounts found for this ledger.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Account Modal */}
            <Sheet
                open={!!editingAccount}
                onClose={() => setEditingAccount(null)}
                title="Edit Ledger Account"
                icon={<Edit3 size={20} />}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <Button variant="outline" onClick={() => setEditingAccount(null)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                }
            >
                {editingAccount && (
                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">Account Type</h4>
                            <p className="font-bold text-[var(--color-on-surface)] mt-1">{editingAccount.type}</p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-start gap-3">
                                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">
                                    Account Code <HelpIcon topic="chartOfAccounts" />
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g. 1000"
                                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]"
                                />
                                <p className="text-[10px] font-medium opacity-40 px-1">
                                    Determines the sort order of your ledger (e.g. 1XXX for Assets).
                                </p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">Account Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40 px-1">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl font-bold focus:outline-none focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Sheet>
        </>
    );
}
