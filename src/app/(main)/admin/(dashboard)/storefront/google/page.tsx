"use client";

import React from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function GoogleIntegrationPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-[2.5rem] bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
                <Search size={40} />
            </div>
            <h1 className="text-3xl font-black mb-4">Google & AI Integration</h1>
            <p className="text-[var(--color-on-surface-variant)] opacity-70 mb-8 leading-relaxed">
                Boost your visibility on Google Search and Maps. Plus, manage your AI configuration
                to empower your store with context-aware smart capabilities.
            </p>

            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 rounded-3xl p-8 w-full mb-8">
                <h3 className="font-bold text-lg mb-2">Enhanced Google Tooling</h3>
                <p className="text-sm opacity-60">
                    Direct integration with Google Business Profile management is on the way.
                    Manage your AI keys and platform settings in the main settings area.
                </p>
            </div>

            <Link href="/admin/settings">
                <Button className="h-14 px-8 rounded-2xl font-bold gap-3 shadow-lg">
                    Open Settings
                </Button>
            </Link>
        </div>
    );
}
