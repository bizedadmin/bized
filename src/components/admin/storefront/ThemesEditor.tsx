"use client";

import React, { useState, useEffect } from "react";
import { Palette, Play, Loader2, Check } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/Button";

export function ThemesEditor() {
    const { currentBusiness, updateBusiness } = useBusiness();
    const [primaryColor, setPrimaryColor] = useState("#000000");
    const [secondaryColor, setSecondaryColor] = useState("#000000");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (currentBusiness) {
            setPrimaryColor(currentBusiness.themeColor || "#000000");
            setSecondaryColor(currentBusiness.secondaryColor || "#000000");
        }
    }, [currentBusiness]);

    const handleSave = async () => {
        setSaving(true);
        const ok = await updateBusiness({
            themeColor: primaryColor,
            secondaryColor: secondaryColor
        });
        setSaving(false);
        if (ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    if (!currentBusiness) return null;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Theme Settings</h2>
                <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70">Customize your brand colors.</p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-2xl p-5 shadow-sm space-y-6">

                {/* Primary Color */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60">Primary color</label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl border border-[var(--color-outline-variant)]/20 overflow-hidden shadow-sm flex-shrink-0">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 font-mono text-xs uppercase focus:border-[var(--color-primary)] outline-none"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50 px-1">
                        Main brand color for buttons, active states, and highlights.
                    </p>
                </div>

                <div className="h-px bg-[var(--color-outline-variant)]/10" />

                {/* Secondary Color */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60">Secondary color</label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl border border-[var(--color-outline-variant)]/20 overflow-hidden shadow-sm flex-shrink-0">
                            <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 font-mono text-xs uppercase focus:border-[var(--color-primary)] outline-none"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50 px-1">
                        Accent color for secondary actions and subtle details.
                    </p>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className={`w-full ${saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}>
                        {saving ? (
                            <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</>
                        ) : saved ? (
                            <><Check size={16} className="mr-2" /> Saved</>
                        ) : (
                            "Save changes"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
