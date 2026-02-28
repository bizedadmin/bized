"use client";

import React, { useEffect, useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { ScrollText, Plus, Search, Filter, Mail, Download, MoreVertical, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HelpIcon } from "@/components/admin/HelpCenter";

interface Invoice {
    _id: string;
    invoiceNumber: string;
    customerName: string;
    totalPaymentDue: number;
    paymentDueDate: string;
    paymentStatus: "Draft" | "Sent" | "Paid" | "Overdue";
    "@type": string;
}

export default function InvoicesPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentBusiness?._id) {
            setLoading(true);
            fetch(`/api/finance/invoices?storeId=${currentBusiness._id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.invoices) setInvoices(data.invoices);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [currentBusiness?._id]);

    if (isLoading || loading) return <div className="p-8"><div className="w-full h-96 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Paid": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "Sent": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "Overdue": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
            default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Paid": return <CheckCircle2 size={12} />;
            case "Overdue": return <AlertCircle size={12} />;
            case "Sent": return <Clock size={12} />;
            default: return null;
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <ScrollText size={24} />
                        </div>
                        Invoices
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Manage customer billing and accounts receivable (Schema.org Invoice).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" className="h-12 px-5 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                        <Plus size={18} /> Create Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Outstanding", value: "$4,250.00", color: "var(--color-primary)" },
                    { label: "Overdue", value: "$1,120.00", color: "#e11d48" },
                    { label: "Paid this month", value: "$12,840.00", color: "#10b981" },
                    { label: "Drafts", value: "3", color: "var(--color-on-surface-variant)" }
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-4 rounded-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</span>
                        <div className="text-xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-50" size={18} />
                        <input
                            type="text"
                            placeholder="Search customer, invoice #..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="h-10 px-4 rounded-xl gap-2 text-xs font-bold border-[var(--color-outline-variant)]/30">
                            <Filter size={14} /> Filter
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[var(--color-surface-container)]/50 text-[var(--color-on-surface-variant)] text-xs uppercase tracking-wider font-extrabold border-b border-[var(--color-outline-variant)]/10">
                            <tr>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status <HelpIcon topic="invoiceStatus" /></th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                            {invoices.map((inv) => (
                                <tr key={inv._id} className="hover:bg-[var(--color-surface-container-high)] transition-colors group">
                                    <td className="px-6 py-4 font-black text-[var(--color-primary)] text-xs tracking-wider">
                                        {inv.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[var(--color-on-surface)]">{inv.customerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(inv.paymentStatus)}`}>
                                            {getStatusIcon(inv.paymentStatus)}
                                            {inv.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[var(--color-on-surface-variant)] opacity-60">
                                        {new Date(inv.paymentDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-[var(--color-on-surface)]">
                                        ${inv.totalPaymentDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="text" className="h-8 w-8 p-0 rounded-lg text-[var(--color-on-surface-variant)] hover:text-blue-600 transition-colors">
                                                <Mail size={14} />
                                            </Button>
                                            <Button variant="text" className="h-8 w-8 p-0 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">
                                                <Download size={14} />
                                            </Button>
                                            <Button variant="text" className="h-8 w-8 p-0 rounded-lg text-[var(--color-on-surface-variant)]">
                                                <MoreVertical size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-[var(--color-on-surface-variant)] opacity-40">
                                        <ScrollText size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">No invoices created yet.</p>
                                        <p className="text-xs font-medium">Billed customers will appear here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
