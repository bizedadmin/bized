"use client";

import React, { useEffect, useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { FileText, Plus, Search, Filter, Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Bill {
    _id: string;
    billNumber: string;
    vendorName: string;
    totalPaymentDue: number;
    paymentDueDate: string;
    paymentStatus: "Unpaid" | "Paid" | "Overdue";
    "@type": string;
}

export default function BillsPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentBusiness?._id) {
            setLoading(true);
            fetch(`/api/finance/bills?storeId=${currentBusiness._id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.bills) setBills(data.bills);
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
            case "Unpaid": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            case "Overdue": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
            default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Paid": return <CheckCircle2 size={12} />;
            case "Overdue": return <AlertCircle size={12} />;
            case "Unpaid": return <Clock size={12} />;
            default: return null;
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        Bills to Pay
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Track vendor balances and accounts payable (Schema.org Invoice).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" className="h-12 px-5 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                        <Plus size={18} /> Record Bill
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-6 rounded-[2rem] flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Total Unpaid</span>
                    <div className="text-3xl font-black text-[var(--color-on-surface)]">$2,840.15</div>
                </div>
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-6 rounded-[2rem] flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Total Overdue</span>
                    <div className="text-3xl font-black text-[var(--color-on-surface)]">$450.00</div>
                </div>
                <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-6 rounded-[2rem] flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Paid this month</span>
                    <div className="text-3xl font-black text-[var(--color-on-surface)]">$6,120.00</div>
                </div>
            </div>

            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-50" size={18} />
                        <input
                            type="text"
                            placeholder="Search vendor, bill ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="h-10 px-4 rounded-xl gap-2 text-xs font-bold border-[var(--color-outline-variant)]/30">
                            <CalendarIcon size={14} /> Due Date
                        </Button>
                        <Button variant="outline" className="h-10 px-4 rounded-xl gap-2 text-xs font-bold border-[var(--color-outline-variant)]/30">
                            <Filter size={14} /> Filter
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[var(--color-surface-container)]/50 text-[var(--color-on-surface-variant)] text-xs uppercase tracking-wider font-extrabold border-b border-[var(--color-outline-variant)]/10">
                            <tr>
                                <th className="px-6 py-4">Bill #</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                            {bills.map((bill) => (
                                <tr key={bill._id} className="hover:bg-[var(--color-surface-container-high)] transition-colors group">
                                    <td className="px-6 py-4 text-xs font-black opacity-40 tracking-wider">
                                        {bill.billNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[var(--color-on-surface)]">{bill.vendorName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(bill.paymentStatus)}`}>
                                            {getStatusIcon(bill.paymentStatus)}
                                            {bill.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[var(--color-on-surface-variant)]">
                                                {new Date(bill.paymentDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {new Date(bill.paymentDueDate) < new Date() && bill.paymentStatus !== 'Paid' && (
                                                <span className="text-[10px] font-black text-rose-600 uppercase">Overdue</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-[var(--color-on-surface)]">
                                        ${bill.totalPaymentDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="outline" className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest border-[var(--color-outline-variant)]/30 hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] hover:border-[var(--color-primary)] transition-all">
                                                Pay Now
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {bills.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-[var(--color-on-surface-variant)] opacity-40">
                                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">No bills found.</p>
                                        <p className="text-xs font-medium">Recorded vendor bills will appear here.</p>
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
