"use client";

import React from "react";
import { Instagram, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function InstagramIntegrationPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-[2.5rem] bg-pink-500/10 text-pink-600 flex items-center justify-center mb-6">
                <Instagram size={40} />
            </div>
            <h1 className="text-3xl font-black mb-4">Instagram Showcase</h1>
            <p className="text-[var(--color-on-surface-variant)] opacity-70 mb-8 leading-relaxed">
                Connect your Instagram feed to automatically showcase your latest posts on your storefront.
                Turn your social media content into a shoppable experience.
            </p>

            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 rounded-3xl p-8 w-full mb-8">
                <h3 className="font-bold text-lg mb-2">Social Feed Integration</h3>
                <p className="text-sm opacity-60">
                    Instagram feed synchronization and shop integration will be available shortly.
                    You can add your Instagram handle in the Storefront Pages Bio section.
                </p>
            </div>

            <Link href="/admin/storefront/pages">
                <Button className="h-14 px-8 rounded-2xl font-bold gap-3 shadow-lg">
                    Edit Storefront Bio
                </Button>
            </Link>
        </div>
    );
}
