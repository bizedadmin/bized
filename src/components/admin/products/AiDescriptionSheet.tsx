"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle, RotateCcw, MessageSquare, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";

interface AiDescriptionSheetProps {
    open: boolean;
    onClose: () => void;
    onApply: (description: string) => void;
    initialData: {
        name: string;
        brand?: string;
        description: string;
    };
}

type Tone = "professional" | "playful" | "salesy";

export function AiDescriptionSheet({ open, onClose, onApply, initialData }: AiDescriptionSheetProps) {
    const { currentBusiness } = useBusiness();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [improvedDescription, setImprovedDescription] = useState("");
    const [currentTone, setCurrentTone] = useState<Tone>("professional");

    const improveDescription = async (tone: Tone = "professional") => {
        if (!currentBusiness?._id) return;
        setIsAnalyzing(true);
        setCurrentTone(tone);
        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{
                        role: "user",
                        content: `Improve this product description for a product named "${initialData.name}"${initialData.brand ? ` by brand ${initialData.brand}` : ''}. Tone: ${tone}. Current description: ${initialData.description}. 

The output MUST be:
1. A concise and engaging short description overview.
2. Followed by key features or benefits in a clear bulleted list (using "-" or "•") for easy readability.

Respond ONLY with the improved content (overview + bullet points), no other text.`
                    }],
                    business: currentBusiness,
                    context: {
                        type: "product_description",
                        productName: initialData.name,
                        brand: initialData.brand,
                        tone: tone
                    }
                })
            });
            if (!res.ok) throw new Error("AI improvement failed");
            const data = await res.json();
            const result = data.suggestedChanges?.description || data.message;
            if (result) {
                setImprovedDescription(result);
            }
        } catch (error) {
            console.error("AI Improvement Error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Auto-trigger on open if no improved description yet
    useEffect(() => {
        if (open && !improvedDescription && initialData.description) {
            improveDescription("professional");
        }
    }, [open]);

    const handleApply = () => {
        onApply(improvedDescription);
        onClose();
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="AI Description Lab"
            icon={<Sparkles size={20} className="text-[var(--color-primary)]" />}
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl font-bold"
                    >
                        Discard
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApply}
                        disabled={!improvedDescription || isAnalyzing}
                        className="flex-[2] h-12 rounded-xl font-bold bg-[var(--color-primary)] text-white disabled:opacity-50"
                    >
                        Apply Changes
                    </Button>
                </div>
            }
        >
            <div className="space-y-8">
                {/* Tone Selector */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50 ml-1">
                        Select Tone
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'professional', label: 'Pro', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { id: 'playful', label: 'Fun', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { id: 'salesy', label: 'Sales', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                        ].map((tone) => (
                            <button
                                key={tone.id}
                                type="button"
                                onClick={() => improveDescription(tone.id as Tone)}
                                disabled={isAnalyzing}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2",
                                    currentTone === tone.id
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm"
                                        : "border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/40"
                                )}
                            >
                                <tone.icon size={20} className={cn(tone.color)} />
                                <span className="text-xs font-bold">{tone.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comparison Card */}
                <div className="space-y-4">
                    <div className="bg-[var(--color-surface-container-low)] rounded-3xl p-6 border border-[var(--color-outline-variant)]/10 relative overflow-hidden">
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                                <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                                <p className="text-xs font-black uppercase tracking-wider opacity-40">AI Brainstorming...</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)] opacity-40">
                                    <RotateCcw size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Original</span>
                                </div>
                                <p className="text-sm font-medium text-[var(--color-on-surface-variant)] leading-relaxed italic">
                                    "{initialData.description || 'No description provided'}"
                                </p>
                            </div>

                            <div className="h-px bg-[var(--color-outline-variant)]/10" />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[var(--color-primary)]">
                                        <Sparkles size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">AI Improvement</span>
                                    </div>
                                    {improvedDescription && !isAnalyzing && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                                            <CheckCircle2 size={12} />
                                            <span className="text-[9px] font-black uppercase">Ready</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-[var(--color-outline-variant)]/20 shadow-sm">
                                    <p className="text-sm font-bold text-[var(--color-on-surface)] leading-relaxed whitespace-pre-wrap">
                                        {improvedDescription || 'Analyzing your product to generate a fresh take...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Tip */}
                <div className="flex gap-4 p-4 rounded-3xl bg-[var(--color-primary-container)]/30 border border-[var(--color-primary)]/10">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0 text-white shadow-lg shadow-[var(--color-primary)]/20">
                        <Sparkles size={18} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-black text-[var(--color-on-primary-container)]">Pro Tip</p>
                        <p className="text-[11px] text-[var(--color-on-primary-container)] opacity-80 leading-relaxed font-medium">
                            Choose a tone and let the AI rewrite your description to better match your brand personality.
                        </p>
                    </div>
                </div>
            </div>
        </Sheet>
    );
}
