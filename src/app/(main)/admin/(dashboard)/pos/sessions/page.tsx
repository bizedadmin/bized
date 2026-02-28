"use client";

import React, { useState } from "react";
import { Clock, PlayCircle, StopCircle, Banknote, TrendingUp, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function POSSessionsPage() {
    const [sessionOpen, setSessionOpen] = useState(false);
    const [openingFloat, setOpeningFloat] = useState("");
    const [started, setStarted] = useState<Date | null>(null);

    const openSession = () => {
        setSessionOpen(true);
        setStarted(new Date());
    };

    const duration = started
        ? Math.floor((Date.now() - started.getTime()) / 60000)
        : 0;

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    POS Sessions
                </h1>
                <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                    Manage register shifts and cash drawer reconciliation
                </p>
            </div>

            {/* Current session */}
            <div className={`rounded-[2rem] border shadow-[var(--shadow-m3-2)] p-8 transition-all ${sessionOpen
                    ? "bg-[var(--color-tertiary-container)] border-[var(--color-tertiary)]/20"
                    : "bg-[var(--color-surface)] border-[var(--color-outline-variant)]/10"
                }`}>
                {sessionOpen ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                <h2 className="font-black text-xl text-[var(--color-on-surface)]">Session Active</h2>
                            </div>
                            <span className="font-mono text-sm font-black text-[var(--color-on-surface-variant)] opacity-60">
                                Started {started?.toLocaleTimeString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Opening Float", value: `KES ${openingFloat || "0"}`, icon: Banknote },
                                { label: "Duration", value: `${duration}m`, icon: Clock },
                                { label: "Sales Today", value: "KES —", icon: TrendingUp },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="bg-[var(--color-surface)]/60 rounded-2xl p-4 text-center">
                                    <Icon size={18} className="mx-auto mb-2 text-[var(--color-primary)] opacity-60" />
                                    <p className="font-black text-lg text-[var(--color-on-surface)]">{value}</p>
                                    <p className="text-xs font-medium opacity-50 mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>

                        <Button onClick={() => { setSessionOpen(false); setStarted(null); setOpeningFloat(""); }}
                            className="w-full h-14 rounded-2xl font-black text-base gap-2 bg-[var(--color-on-surface)] text-[var(--color-surface)] flex items-center justify-center">
                            <StopCircle size={20} /> Close Session & Reconcile
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 text-center">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-[var(--color-surface-container)] flex items-center justify-center mx-auto">
                            <ReceiptText size={36} className="text-[var(--color-on-surface-variant)] opacity-20" />
                        </div>
                        <div>
                            <h2 className="font-black text-xl text-[var(--color-on-surface)] mb-1">No Active Session</h2>
                            <p className="text-sm text-[var(--color-on-surface-variant)] opacity-50">Open a session before processing sales</p>
                        </div>
                        <div className="max-w-xs mx-auto space-y-3">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-1.5 block">Opening Float (Cash in Drawer)</label>
                                <div className="flex items-center h-12 px-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus-within:border-[var(--color-primary)]/60 focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10 transition-all gap-2">
                                    <span className="text-sm font-black opacity-40">KES</span>
                                    <input type="number" placeholder="0.00" value={openingFloat}
                                        onChange={e => setOpeningFloat(e.target.value)}
                                        className="flex-1 font-black text-sm text-[var(--color-on-surface)] bg-transparent focus:outline-none" />
                                </div>
                            </div>
                            <Button onClick={openSession}
                                className="w-full h-14 rounded-2xl font-black text-base gap-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-m3-2)] flex items-center justify-center">
                                <PlayCircle size={20} /> Open Session
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Past sessions placeholder */}
            <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6">
                <h3 className="font-black text-sm uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-4">Past Sessions</h3>
                <p className="text-sm text-center py-8 text-[var(--color-on-surface-variant)] opacity-30 font-medium">
                    Session history will appear here
                </p>
            </div>
        </div>
    );
}
