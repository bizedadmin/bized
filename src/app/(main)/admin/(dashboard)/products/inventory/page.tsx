"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function InventoryPage() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Inventory Tracking</h1>
                <p className="text-[var(--color-on-surface-variant)]">Manage stock levels and receive alerts.</p>
            </div>

            <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 shadow-sm mt-8">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                    <BarChart3 size={32} className="text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">Inventory Management coming soon</h3>
                <p className="text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-6">
                    This section is currently under development. Soon, you will be able to track stock levels, set low-stock warnings, and manage your supply chain seamlessly from here.
                </p>
            </div>
        </div>
    );
}
