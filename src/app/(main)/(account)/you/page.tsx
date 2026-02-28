"use client";

import React from "react";
import { User } from "lucide-react";

export default function YouPage() {
    return (
        <div className="p-6 md:p-10 lg:p-16 h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-[var(--color-surface-container-high)] flex items-center justify-center mb-6 text-[var(--color-on-surface-variant)] opacity-20">
                <User size={40} />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight mb-2">You</h1>
            <p className="text-[var(--color-on-surface-variant)] opacity-60 max-w-md">
                Manage your personal profile, preferences, and account settings here.
            </p>
        </div>
    );
}
