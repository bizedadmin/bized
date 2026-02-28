"use client";

import React from "react";
import { useBusiness } from "@/contexts/BusinessContext";

export default function StoreOverviewPage() {
    const { currentBusiness } = useBusiness();

    return (
        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">Overview</h1>
                <p className="text-[var(--color-on-surface-variant)] opacity-60">
                    Welcome back to {currentBusiness?.name}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Placeholder Stats Cards */}
                {["Total Sales", "Orders", "Visitors", "Conversion"].map((stat) => (
                    <div key={stat} className="p-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20">
                        <p className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60 mb-2">{stat}</p>
                        <p className="text-2xl font-black text-[var(--color-on-surface)]">--</p>
                    </div>
                ))}
            </div>

            <div className="rounded-3xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 p-8 text-center py-20">
                <p className="text-[var(--color-on-surface-variant)] opacity-50">Dashboard activity and charts will appear here.</p>
            </div>
        </div>
    );
}
