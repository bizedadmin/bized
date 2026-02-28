"use client";

import React from "react";
import { Users } from "lucide-react";

export default function CustomersPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-24 h-24 rounded-[2rem] bg-[var(--color-surface-container-high)] flex items-center justify-center mb-6 text-[var(--color-on-surface-variant)] opacity-20">
                <Users size={48} />
            </div>
            <h1 className="text-2xl font-black text-[var(--color-on-surface)] mb-2">Customers</h1>
            <p className="text-[var(--color-on-surface-variant)] opacity-50 max-w-sm">
                View and manage your customer base. Coming soon.
            </p>
        </div>
    );
}
