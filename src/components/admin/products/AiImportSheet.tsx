"use client";

import React, { useState } from "react";
import { Sparkles, Link as LinkIcon, Loader2, CheckCircle2, Globe, Tag, DollarSign, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useBusiness, ProductItem } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";

interface AiImportSheetProps {
    open: boolean;
    onClose: () => void;
    onApply: (data: Partial<ProductItem>) => void;
}

export function AiImportSheet({ open, onClose, onApply }: AiImportSheetProps) {
    const { currentBusiness } = useBusiness();
    const [importUrl, setImportUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importedData, setImportedData] = useState<Partial<ProductItem> | null>(null);

    const handleUrlImport = async () => {
        if (!importUrl || !currentBusiness?._id) return;
        setIsImporting(true);
        setImportedData(null);
        try {
            const res = await fetch("/api/ai/fetch-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: importUrl,
                    storeId: currentBusiness._id
                })
            });
            if (!res.ok) throw new Error("URL import failed");
            const data = await res.json();

            setImportedData({
                name: data.name,
                description: data.description,
                price: data.price,
                brand: data.brand,
                sku: data.sku,
                images: data.images?.length ? data.images : [],
                image: data.images?.[0] || "",
                // SEO Fields
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                productSlug: data.productSlug,
                condition: data.condition || "New",
                material: data.material,
                color: data.color,
                imageAltTexts: data.imageAltTexts || []
            });
        } catch (error) {
            console.error("URL Import Error:", error);
            alert("Failed to import product. Please try again or check the URL.");
        } finally {
            setIsImporting(false);
        }
    };

    const handleApply = () => {
        if (importedData) {
            onApply(importedData);
            setImportUrl("");
            setImportedData(null);
            onClose();
        }
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Import Product via AI"
            icon={<Sparkles size={20} />}
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApply}
                        disabled={!importedData}
                        className="flex-[2] h-12 rounded-xl font-bold bg-[var(--color-primary)] text-white disabled:opacity-50"
                    >
                        Apply to Product
                    </Button>
                </div>
            }
        >
            <div className="space-y-8">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-80 leading-relaxed">
                        Paste a product URL from any marketplace (Amazon, Take App, Shopify, etc.) and our AI will extract all details for you.
                    </p>

                    <div className="space-y-3 pt-2">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
                                <LinkIcon size={18} />
                            </div>
                            <input
                                type="url"
                                placeholder="Paste product URL here..."
                                value={importUrl}
                                onChange={(e) => setImportUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-medium"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={handleUrlImport}
                            disabled={!importUrl || isImporting}
                            className="w-full h-12 rounded-xl font-bold gap-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-all"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Analyzing Page...
                                </>
                            ) : (
                                <>
                                    <Globe size={18} />
                                    Fetch Product Details
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {isImporting && (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-[var(--color-primary)]/10 border-t-[var(--color-primary)] animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto text-[var(--color-primary)] animate-pulse" size={24} />
                        </div>
                        <p className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">WebMCP Browsing Agent at work...</p>
                    </div>
                )}

                {importedData && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 text-[var(--color-primary)]">
                            <CheckCircle2 size={18} />
                            <span className="text-sm font-bold uppercase tracking-wider">Preview Results</span>
                        </div>

                        <div className="bg-[var(--color-surface-container-low)] rounded-3xl p-5 border border-[var(--color-outline-variant)]/10 space-y-5">
                            {/* Images Preview */}
                            {importedData.images && importedData.images.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                    {importedData.images.map((img, i) => (
                                        <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-[var(--color-outline-variant)]/20 bg-white p-1 shrink-0">
                                            <img src={img} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                        <Tag size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-widest mb-0.5">Title</p>
                                        <p className="text-sm font-bold text-[var(--color-on-surface)] line-clamp-2">{importedData.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                                        <DollarSign size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-widest mb-0.5">Price</p>
                                        <p className="text-sm font-bold text-[var(--color-on-surface)]">
                                            {currentBusiness?.currency} {importedData.price}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-widest mb-0.5">Description</p>
                                        <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-3 leading-relaxed">
                                            {importedData.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-[var(--color-outline-variant)]/10 flex flex-wrap gap-2">
                                    {importedData.metaTitle && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                            <Sparkles size={10} />
                                            SEO Title Ready
                                        </div>
                                    )}
                                    {importedData.productSlug && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                            <LinkIcon size={10} />
                                            Slug Generated
                                        </div>
                                    )}
                                    {importedData.imageAltTexts && importedData.imageAltTexts.length > 0 && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                                            <ImageIcon size={10} />
                                            Alt-Texts Generated
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                            <p className="text-xs text-[var(--color-primary)] font-medium leading-relaxed italic">
                                Tip: You can edit or refine these details once they are applied to your product form.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Sheet>
    );
}
