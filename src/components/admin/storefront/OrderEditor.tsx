"use client";

import React, { useState, useEffect } from "react";
import {
    ShoppingBag,
    MessageSquare,
    Check,
    Loader2,
    Sparkles,
    Type,
    Bold,
    Italic,
    Strikethrough,
    CornerDownLeft
} from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const WhatsappBubble = ({ text, time = "09:41" }: { text: string; time?: string }) => {
    const renderFormattedText = (rawText: string) => {
        if (!rawText) return "Your message will appear here...";
        let formatted = rawText
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/~(.*?)~/g, '<del>$1</del>')
            .replace(/\n/g, '<br />');
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
    };

    return (
        <div className="flex flex-col items-end mb-2 max-w-[85%] ml-auto animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-none shadow-sm relative border border-black/5">
                <p className="text-[11px] text-[#303030] leading-relaxed whitespace-pre-wrap">
                    {renderFormattedText(text)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 opacity-40">
                    <span className="text-[8px] font-medium">{time}</span>
                    <div className="flex -space-x-1">
                        <Check size={8} className="text-blue-500" />
                        <Check size={8} className="text-blue-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export function OrderEditor() {
    const { currentBusiness, updateBusiness } = useBusiness();
    const [template, setTemplate] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (currentBusiness?.socialLinks?.whatsappTemplates?.order) {
            setTemplate(currentBusiness.socialLinks.whatsappTemplates.order);
        }
    }, [currentBusiness]);

    const handleSave = async () => {
        if (!currentBusiness) return;
        setIsSaving(true);
        const success = await updateBusiness({
            socialLinks: {
                ...currentBusiness.socialLinks,
                whatsappTemplates: {
                    ...currentBusiness.socialLinks?.whatsappTemplates,
                    order: template
                }
            }
        });
        setIsSaving(false);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const insertVariable = (variable: string) => {
        setTemplate(prev => prev + `{{${variable}}}`);
    };

    const insertFormatting = (marker: string) => {
        if (marker === '\n') {
            setTemplate(prev => prev + '\n');
            return;
        }
        setTemplate(prev => prev + marker + "text" + marker);
    };

    const renderPreviewTemplate = (text: string) => {
        if (!text) return "Hi! I'd like to order {{product_name}}.";
        return text
            .replace(/\{\{business_name\}\}/g, currentBusiness?.name || "My Business")
            .replace(/\{\{product_name\}\}/g, "Classic Leather Bag")
            .replace(/\{\{page_url\}\}/g, `bized.app/${currentBusiness?.slug || 'shop'}`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-8 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Ordering Journey</h3>
                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">Customize the message customers send when placing an order.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50 uppercase tracking-widest">WhatsApp Order Template</label>
                            <div className="flex gap-1">
                                {[
                                    { id: '*', icon: Bold },
                                    { id: '_', icon: Italic },
                                    { id: '~', icon: Strikethrough },
                                    { id: '\n', icon: CornerDownLeft },
                                ].map((tool) => (
                                    <button
                                        key={tool.id}
                                        type="button"
                                        onClick={() => insertFormatting(tool.id)}
                                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] transition-all"
                                    >
                                        <tool.icon size={14} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative group">
                            <MessageSquare className="absolute left-4 top-4 text-[var(--color-on-surface-variant)] opacity-30 group-focus-within:text-[var(--color-primary)] transition-all" size={20} />
                            <textarea
                                rows={5}
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                placeholder="Hi! I'd like to order {{product_name}}..."
                                className="w-full pl-12 pr-6 py-4 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm leading-relaxed transition-all resize-none shadow-inner font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50 px-1 uppercase tracking-widest">Dynamic Variables</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'business_name', label: 'Business Name' },
                                { id: 'product_name', label: 'Product Name' },
                                { id: 'page_url', label: 'Store URL' },
                            ].map((variable) => (
                                <button
                                    key={variable.id}
                                    type="button"
                                    onClick={() => insertVariable(variable.id)}
                                    className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold hover:bg-[var(--color-primary)]/20 transition-all border border-[var(--color-primary)]/10"
                                >
                                    +{variable.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "w-full h-14 rounded-2xl font-bold gap-3 transition-all",
                                saved ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary)]/20"
                            )}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : saved ? <Check size={20} /> : <Check size={20} />}
                            {isSaving ? "Saving..." : saved ? "Template Saved" : "Save Settings"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="bg-[var(--color-surface-container-highest)]/30 rounded-[2.5rem] border border-[var(--color-outline-variant)]/10 p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest opacity-40">Preview Journey</h4>
                    <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase">Customer Perspective</div>
                </div>

                <div className="w-full max-w-sm mx-auto aspect-[16/9] rounded-3xl bg-[#e5ddd5] p-6 shadow-inner relative overflow-hidden flex flex-col justify-end" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
                    <div className="absolute inset-0 bg-black/5" />
                    <WhatsappBubble text={renderPreviewTemplate(template)} />
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3">
                    <Sparkles className="text-amber-500 shrink-0" size={18} />
                    <p className="text-[11px] text-amber-900/60 leading-relaxed">
                        <strong>Pro Tip:</strong> Most products use the Standard Order journey unless they are explicitly marked as "Booking" type.
                    </p>
                </div>
            </div>
        </div>
    );
}
