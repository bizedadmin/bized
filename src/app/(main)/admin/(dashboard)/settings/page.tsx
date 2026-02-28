"use client";

import React, { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    Building2,
    Share2,
    Languages,
    Coins,
    MessageSquare,
    ArrowUpRight,
    ExternalLink,
    LayoutGrid,
    Type,
    Copy,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Settings,
    User,
    Phone,
    Globe,
    Palette,
    Shield,
    Save,
    Loader2,
    Clock,
    X,
    Plus
} from "lucide-react";
import Link from "next/link";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CurrencyModal } from "@/components/admin/settings/CurrencyModal";
import { CURRENCIES } from "@/lib/currencies";
import { CountryModal } from "@/components/admin/settings/CountryModal";
import { COUNTRIES } from "@/lib/countries";
import { Sheet } from "@/components/ui/Sheet";
import { HelpIcon } from "@/components/admin/HelpCenter";

type SettingsTab = "general" | "contact" | "whatsapp" | "branding" | "regional" | "taxes" | "social" | "legal" | "ai";

const TABS = [
    { id: "general", label: "General", icon: Building2, description: "Store name and industry" },
    { id: "contact", label: "Contact", icon: Phone, description: "Phone, email and address" },
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, description: "Chat and button config" },
    { id: "branding", label: "Branding", icon: Palette, description: "Logo and theme colors" },
    { id: "regional", label: "Regional", icon: Languages, description: "Currency and formatting" },
    { id: "taxes", label: "Taxes", icon: Coins, description: "Tax rates and configuration" },
    { id: "social", label: "Socials", icon: Share2, description: "WhatsApp and social links" },
    { id: "legal", label: "Legal", icon: Shield, description: "Policies and terms" },
    { id: "ai", label: "AI Configuration", icon: Globe, description: "BYOK and Agent settings" },
] as const;

import { useAi } from "@/contexts/AiContext";

export default function SettingsPage() {
    const { currentBusiness, updateBusiness, isLoading } = useBusiness();
    const { setContextData, setOnApplyChanges } = useAi();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const tab = searchParams.get('tab') as SettingsTab;
        return (tab && TABS.some(t => t.id === tab)) ? tab : "general";
    });

    // Handle tab change when URL changes (e.g. clicking link from AI chat)
    React.useEffect(() => {
        const tab = searchParams.get('tab') as SettingsTab;
        if (tab && TABS.some(t => t.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [formData, setFormData] = useState<any>(null);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

    const [isTaxAiOpen, setIsTaxAiOpen] = useState(false);
    const [isTaxAiLoading, setIsTaxAiLoading] = useState(false);
    const [taxAiResults, setTaxAiResults] = useState<{ name: string, rate: number, id: string, selected: boolean }[]>([]);

    const handleFetchAiTaxes = async () => {
        if (!formData?.country) {
            alert("Please set your business country in the Regional tab first.");
            return;
        }
        setIsTaxAiLoading(true);
        setIsTaxAiOpen(true);
        setTaxAiResults([]);

        try {
            const res = await fetch("/api/ai/taxes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    country: formData.country,
                    storeId: currentBusiness?._id
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to analyze taxes");
            }

            const data = await res.json();
            const parsed = (data.taxes || []).map((t: any) => ({
                ...t,
                id: crypto.randomUUID(),
                selected: true
            }));
            setTaxAiResults(parsed);
        } catch (error) {
            console.error("AI Tax Error:", error);
            alert((error as Error).message);
            setIsTaxAiOpen(false);
        } finally {
            setIsTaxAiLoading(false);
        }
    };

    const handleAiApply = React.useCallback((changes: any) => {
        setFormData((prev: any) => ({ ...prev, ...changes }));
    }, []);

    // AI Context Registration
    React.useEffect(() => {
        if (formData) {
            setContextData(formData);
            setOnApplyChanges(() => handleAiApply);
        }
        return () => {
            setContextData(null);
            setOnApplyChanges(null);
        };
    }, [formData, setContextData, setOnApplyChanges, handleAiApply]);

    // Advanced Geolocation for Country & Currency
    React.useEffect(() => {
        if (!formData || (formData.currency && formData.country)) return;

        const detectLocation = async () => {
            try {
                // Try IP geolocation API
                const res = await fetch("https://ipapi.co/json/");
                if (res.ok) {
                    const data = await res.json();
                    setFormData((prev: any) => ({
                        ...prev,
                        country: prev.country || data.country_name,
                        currency: prev.currency || data.currency,
                    }));
                } else {
                    // Fallback to Intl if API fails
                    const detectedCurrency = Intl.NumberFormat().resolvedOptions().currency;
                    if (detectedCurrency && CURRENCIES.some(c => c.code === detectedCurrency)) {
                        setFormData((prev: any) => ({ ...prev, currency: prev.currency || detectedCurrency }));
                    }
                }
            } catch (e) {
                console.error("Location detection failed", e);
            }
        };

        detectLocation();
    }, [formData?.currency, formData?.country]);

    React.useEffect(() => {
        if (currentBusiness && !formData) {
            setFormData({ ...currentBusiness });
        }
    }, [currentBusiness, formData]);

    const handleSave = async () => {
        if (!formData) return;
        setIsSaving(true);
        setSaveSuccess(false);

        const success = await updateBusiness(formData);

        setIsSaving(false);
        if (success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    if (isLoading || !formData) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const activeTabData = TABS.find(t => t.id === activeTab) || TABS[0];

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--color-surface)]">
            {/* Left Sidebar - Tabs */}
            <aside className="w-80 border-r border-[var(--color-outline-variant)]/20 flex flex-col flex-shrink-0 bg-[var(--color-surface)]">
                <div className="p-6 border-b border-[var(--color-outline-variant)]/10">
                    <h1 className="text-xl font-black text-[var(--color-on-surface)] tracking-tight">Settings</h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">Manage your business configuration</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as SettingsTab)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group",
                                activeTab === tab.id
                                    ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-sm"
                                    : "hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    activeTab === tab.id
                                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md"
                                        : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] group-hover:bg-[var(--color-surface-container-highest)]"
                                )}>
                                    <tab.icon size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-sm leading-tight">{tab.label}</div>
                                    <div className="text-[10px] opacity-60 truncate">{tab.description}</div>
                                </div>
                            </div>
                            {activeTab === tab.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[var(--color-surface-container-low)]/30 relative">
                <div className="max-w-3xl mx-auto p-8 pb-32">
                    <header className="mb-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight capitalize">
                                {activeTabData?.label} Settings
                            </h2>
                            <p className="text-[var(--color-on-surface-variant)] opacity-60 mt-1">
                                {activeTabData?.description}
                            </p>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {/* TAB CONTENT: GENERAL */}
                            {activeTab === 'general' && (
                                <section className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Store name<HelpIcon topic="storeName" /></label>
                                            <input
                                                type="text"
                                                value={formData.name || ""}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                placeholder="My Awesome Store"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Store slug</label>
                                            <div className="flex items-center h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 opacity-50 cursor-not-allowed">
                                                <span className="text-sm opacity-40 mr-1">bized.app/</span>
                                                <span className="font-mono text-sm">{formData.slug}</span>
                                            </div>
                                            <p className="text-[10px] text-[var(--color-on-surface-variant)] ml-1 italic opacity-40">Slug is permanent once set</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Industry<HelpIcon topic="businessIndustry" /></label>
                                            <input
                                                type="text"
                                                value={formData.industry || ""}
                                                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                placeholder="Retail, Food, etc."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Business type</label>
                                            <input
                                                type="text"
                                                value={formData.businessType || ""}
                                                onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                placeholder="Online Shop, Local Store, etc."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Short bio / tagline</label>
                                        <input
                                            type="text"
                                            value={formData.subtitle || ""}
                                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                            className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                            placeholder="The best place for your needs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">About business</label>
                                        <textarea
                                            value={formData.description || ""}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full min-h-[120px] p-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium resize-none"
                                            placeholder="Tell customers more about what you do..."
                                        />
                                    </div>
                                </section>
                            )}

                            {/* TAB CONTENT: CONTACT */}
                            {activeTab === 'contact' && (
                                <section className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Public email<HelpIcon topic="supportEmail" /></label>
                                            <input
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                placeholder="contact@business.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Phone number<HelpIcon topic="supportPhone" /></label>
                                            <input
                                                type="tel"
                                                value={formData.phone || ""}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Physical address<HelpIcon topic="physicalAddress" /></label>
                                        <input
                                            type="text"
                                            value={formData.address || ""}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                            placeholder="123 Business St, City"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">City</label>
                                            <input
                                                type="text"
                                                value={formData.city || ""}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                placeholder="Nairobi"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Country</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsCountryModalOpen(true)}
                                                className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)] transition-all flex items-center justify-between group"
                                            >
                                                <span className={cn("font-medium", !formData.country && "text-[var(--color-on-surface-variant)] opacity-40")}>
                                                    {formData.country || "Select country"}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">
                                                        {COUNTRIES.find(c => c.name === formData.country)?.flag}
                                                    </span>
                                                    <ChevronRight size={18} className="text-[var(--color-on-surface-variant)] opacity-40 group-hover:text-[var(--color-primary)] transition-all" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* TAB CONTENT: WHATSAPP */}
                            {activeTab === 'whatsapp' && (
                                <section className="space-y-6">
                                    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-black text-[var(--color-on-surface)]">Connection Settings</h3>
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50 uppercase tracking-widest font-black mt-1">Direct chat integration</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                <MessageSquare size={24} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">WhatsApp number<HelpIcon topic="whatsappNumber" /></label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all" size={20} />
                                                    <input
                                                        type="tel"
                                                        value={formData.socialLinks?.whatsapp || ""}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            socialLinks: { ...(formData.socialLinks || {}), whatsapp: e.target.value }
                                                        })}
                                                        placeholder="e.g. 254712345678 (include country code)"
                                                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] ml-1 opacity-40 italic">Include country code without + (e.g. 254 for Kenya)</p>
                                            </div>

                                            <div className="flex items-center justify-between p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                        <LayoutGrid size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">Floating Button</h4>
                                                        <p className="text-[10px] opacity-50">Show chat widget on storefront</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newSettings = {
                                                            ...(formData.socialLinks?.whatsappSettings || {}),
                                                            floatingButtonEnabled: !formData.socialLinks?.whatsappSettings?.floatingButtonEnabled
                                                        };
                                                        setFormData({
                                                            ...formData,
                                                            socialLinks: {
                                                                ...(formData.socialLinks || {}),
                                                                whatsappSettings: newSettings
                                                            }
                                                        });
                                                    }}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full p-1 transition-colors relative",
                                                        formData.socialLinks?.whatsappSettings?.floatingButtonEnabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-container-highest)]"
                                                    )}
                                                >
                                                    <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", formData.socialLinks?.whatsappSettings?.floatingButtonEnabled ? "translate-x-6" : "translate-x-0")} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-lg space-y-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700" />

                                        <div className="relative">
                                            <h3 className="text-xl font-black">Advanced Communication Suite</h3>
                                            <p className="text-sm opacity-80 mt-2 max-w-md">Configure message templates, customize the floating hub style, set availability schedules, and download your store QR codes.</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 relative">
                                            <Link
                                                href="/admin/storefront/whatsapp"
                                                className="h-12 px-6 rounded-xl bg-white text-emerald-600 font-bold text-xs flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all shadow-md"
                                            >
                                                Manage Advanced Settings
                                                <ArrowUpRight size={14} />
                                            </Link>
                                            <div className="flex -space-x-2">
                                                {[Type, Sparkles, Clock, Globe].map((Icon, i) => (
                                                    <div key={i} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                                        <Icon size={14} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* TAB CONTENT: BRANDING */}
                            {activeTab === 'branding' && (
                                <section className="space-y-8">
                                    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Business logo<HelpIcon topic="storeLogo" /></label>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 h-24 rounded-3xl bg-[var(--color-surface-container)] flex items-center justify-center overflow-hidden border-2 border-dashed border-[var(--color-outline-variant)]/30 group relative">
                                                        {formData.logoUrl ? (
                                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Building2 size={32} className="opacity-20" />
                                                        )}
                                                    </div>
                                                    <Button variant="outline" className="rounded-xl h-10 px-4 text-xs font-bold">Change Logo</Button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Theme colors<HelpIcon topic="primaryColor" /></label>
                                                <div className="flex items-center gap-4">
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold opacity-40 ml-1">Primary</div>
                                                        <div className="flex items-center gap-3 h-12 px-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20">
                                                            <input
                                                                type="color"
                                                                value={formData.themeColor || "#000000"}
                                                                onChange={e => setFormData({ ...formData, themeColor: e.target.value })}
                                                                className="w-6 h-6 rounded-md border-none cursor-pointer"
                                                            />
                                                            <span className="text-xs font-mono uppercase truncate w-16">{formData.themeColor}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold opacity-40 ml-1">Secondary</div>
                                                        <div className="flex items-center gap-3 h-12 px-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20">
                                                            <input
                                                                type="color"
                                                                value={formData.secondaryColor || "#000000"}
                                                                onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                                                                className="w-6 h-6 rounded-md border-none cursor-pointer"
                                                            />
                                                            <span className="text-xs font-mono uppercase truncate w-16">{formData.secondaryColor}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-4">
                                        <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Cover image</label>
                                        <div className="aspect-[3/1] rounded-3xl bg-[var(--color-surface-container)] flex items-center justify-center overflow-hidden border-2 border-dashed border-[var(--color-outline-variant)]/30 relative group">
                                            {formData.coverPhotoUrl ? (
                                                <img src={formData.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center opacity-20">
                                                    <Globe size={48} className="mx-auto mb-2" />
                                                    <span className="text-sm font-bold">Recommended size: 1200x400px</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">Replace Cover Image</Button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* TAB CONTENT: SOCIALS */}
                            {activeTab === 'social' && (
                                <section className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-8">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Communication</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative group">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all" size={20} />
                                                    <input
                                                        type="url"
                                                        value={formData.website || ""}
                                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                        placeholder="https://yourwebsite.com"
                                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-emerald-500 rounded-md text-white font-bold text-[8px]">WA</div>
                                                    <input
                                                        type="text"
                                                        value={formData.socialLinks?.whatsapp || ""}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            socialLinks: { ...(formData.socialLinks || {}), whatsapp: e.target.value }
                                                        })}
                                                        placeholder="WhatsApp number (e.g. 254...)"
                                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Social profiles</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 rounded-md text-white font-bold text-[8px]">IG</div>
                                                    <input
                                                        type="text"
                                                        value={formData.socialLinks?.instagram || ""}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            socialLinks: { ...(formData.socialLinks || {}), instagram: e.target.value }
                                                        })}
                                                        placeholder="Instagram username"
                                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-blue-600 rounded-md text-white font-bold text-[8px]">FB</div>
                                                    <input
                                                        type="text"
                                                        value={formData.socialLinks?.facebook || ""}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            socialLinks: { ...(formData.socialLinks || {}), facebook: e.target.value }
                                                        })}
                                                        placeholder="Facebook page URL"
                                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* TAB CONTENT: REGIONAL */}
                            {activeTab === 'regional' && (
                                <section className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Business country<HelpIcon topic="businessCountry" /></label>
                                            <button
                                                type="button"
                                                onClick={() => setIsCountryModalOpen(true)}
                                                className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)] transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Globe size={20} className="text-[var(--color-on-surface-variant)] opacity-40 group-hover:text-[var(--color-primary)] transition-all" />
                                                    <span className={cn("font-medium", !formData.country && "text-[var(--color-on-surface-variant)] opacity-40")}>
                                                        {formData.country || "Select business country"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">
                                                        {COUNTRIES.find(c => c.name === formData.country)?.flag}
                                                    </span>
                                                    <ChevronRight size={18} className="text-[var(--color-on-surface-variant)] opacity-40 group-hover:text-[var(--color-primary)] transition-all" />
                                                </div>
                                            </button>
                                            <p className="text-[10px] text-[var(--color-on-surface-variant)] ml-1 italic opacity-40">Primary location for tax and regional settings</p>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Primary currency<HelpIcon topic="storeCurrency" /></label>
                                            <button
                                                type="button"
                                                onClick={() => setIsCurrencyModalOpen(true)}
                                                className="w-full h-14 pl-12 pr-6 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all flex items-center justify-between group relative text-left"
                                            >
                                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-hover:text-[var(--color-primary)] transition-all" size={20} />
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-sm">
                                                        {CURRENCIES.find(c => c.code === formData.currency)?.name || formData.currency || "Select Currency"}
                                                    </span>
                                                    <span className="text-[11px] font-mono opacity-40">({formData.currency})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-center text-xs shadow-inner">
                                                        {CURRENCIES.find(c => c.code === formData.currency)?.symbol || "$"}
                                                    </div>
                                                    <ChevronRight className="text-[var(--color-on-surface-variant)] opacity-30 group-hover:translate-x-1 transition-transform" size={16} />
                                                </div>
                                            </button>
                                            <p className="text-[10px] text-[var(--color-on-surface-variant)] ml-1 italic opacity-40">Affects how prices are displayed on your store</p>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Date format<HelpIcon topic="dateFormat" /></label>
                                            <div className="relative group">
                                                <select
                                                    value={formData.dateFormat || "DD/MM/YYYY text"}
                                                    onChange={e => setFormData({ ...formData, dateFormat: e.target.value })}
                                                    className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    <option value="DD/MM/YYYY text">DD/MM/YYYY (e.g. 19/02/2026)</option>
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 02/19/2026)</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-02-19)</option>
                                                    <option value="MMMM D, YYYY">MMMM D, YYYY (e.g. February 19, 2026)</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-on-surface-variant)] opacity-40 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Number format</label>
                                            <div className="relative group">
                                                <select
                                                    value={formData.numberFormat || "commas"}
                                                    onChange={e => setFormData({ ...formData, numberFormat: e.target.value })}
                                                    className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    <option value="commas">1,234.56 (Commas)</option>
                                                    <option value="dots">1.234,56 (Dots)</option>
                                                    <option value="spaces">1 234,56 (Spaces)</option>
                                                    <option value="none">1234.56 (Compact)</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-on-surface-variant)] opacity-40 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* TAB CONTENT: TAXES */}
                            {activeTab === 'taxes' && (
                                <section className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-xl text-[var(--color-on-surface)]">Tax Settings<HelpIcon topic="taxRates" /></h3>
                                            <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70 mt-1">Configure the tax rates applicable in your country.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleFetchAiTaxes}
                                                className="px-6 h-12 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)]/10 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Sparkles size={18} /> AI Assist
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newTax = { id: crypto.randomUUID(), name: "", rate: 0, isDefault: (!formData.taxes || formData.taxes.length === 0) };
                                                    setFormData({ ...formData, taxes: [...(formData.taxes || []), newTax] });
                                                }}
                                                className="px-6 h-12 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary)]/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Plus size={18} /> Add Tax Rate
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(!formData.taxes || formData.taxes.length === 0) ? (
                                            <div className="text-center py-12 text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-low)] border-2 border-dashed border-[var(--color-outline-variant)]/20 rounded-2xl flex flex-col items-center gap-3">
                                                <Coins size={32} className="opacity-40" />
                                                <div>
                                                    <p className="font-bold opacity-60">No tax rates configured</p>
                                                    <p className="text-sm opacity-50 mt-1">Add your country's standard and reduced tax rates to apply them to your products.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {formData.taxes.map((tax: any, index: number) => (
                                                    <div key={tax.id} className="flex flex-col md:flex-row md:items-end gap-4 bg-[var(--color-surface-container-low)] p-5 rounded-[var(--radius-m3-md)] border border-[var(--color-outline-variant)]/10">
                                                        <div className="flex-1 space-y-2">
                                                            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-80 uppercase tracking-widest pl-1">Tax Name</label>
                                                            <input
                                                                type="text"
                                                                value={tax.name}
                                                                onChange={e => {
                                                                    const newTaxes = [...formData.taxes];
                                                                    newTaxes[index].name = e.target.value;
                                                                    setFormData({ ...formData, taxes: newTaxes });
                                                                }}
                                                                placeholder="e.g. Standard VAT"
                                                                className="w-full h-12 px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium text-sm"
                                                            />
                                                        </div>
                                                        <div className="w-full md:w-32 space-y-2">
                                                            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-80 uppercase tracking-widest pl-1">Rate (%)</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={tax.rate === 0 && !tax.name ? "" : tax.rate}
                                                                    onChange={e => {
                                                                        const newTaxes = [...formData.taxes];
                                                                        newTaxes[index].rate = parseFloat(e.target.value) || 0;
                                                                        setFormData({ ...formData, taxes: newTaxes });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-full h-12 pl-4 pr-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-bold text-sm text-[var(--color-on-surface)]"
                                                                />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold opacity-40 text-[var(--color-on-surface-variant)]">%</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 pt-2 md:pt-0 pb-1 md:ml-4">
                                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center">
                                                                    <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${tax.isDefault ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-outline-variant)]/40 bg-transparent group-hover:border-[var(--color-primary)]/50'}`}>
                                                                        {tax.isDefault ? <div className="w-2 h-2 bg-white rounded-full scale-100" /> : <div className="w-2 h-2 bg-transparent rounded-full scale-0" />}
                                                                    </div>
                                                                    <input
                                                                        type="radio"
                                                                        name="defaultTax"
                                                                        checked={tax.isDefault}
                                                                        onChange={() => {
                                                                            const newTaxes = formData.taxes.map((t: any) => ({ ...t, isDefault: t.id === tax.id }));
                                                                            setFormData({ ...formData, taxes: newTaxes });
                                                                        }}
                                                                        className="absolute opacity-0 cursor-pointer w-full h-full"
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-bold text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)] transition-colors">Default</span>
                                                            </label>

                                                            <div className="w-[1px] h-6 bg-[var(--color-outline-variant)]/20 mx-2 hidden md:block"></div>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newTaxes = formData.taxes.filter((t: any) => t.id !== tax.id);
                                                                    // If we deleted the default, make the first one default if any exist
                                                                    if (tax.isDefault && newTaxes.length > 0) {
                                                                        newTaxes[0].isDefault = true;
                                                                    }
                                                                    setFormData({ ...formData, taxes: newTaxes });
                                                                }}
                                                                className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                                title="Remove tax rate"
                                                            >
                                                                <X size={20} className="opacity-80" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* TAB CONTENT: LEGAL */}
                            {activeTab === 'legal' && (
                                <section className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-8">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Privacy policy URL</label>
                                            <input
                                                type="url"
                                                value={formData.privacyPolicyUrl || ""}
                                                onChange={e => setFormData({ ...formData, privacyPolicyUrl: e.target.value })}
                                                placeholder="https://yoursite.com/privacy"
                                                className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Terms of service URL</label>
                                            <input
                                                type="url"
                                                value={formData.termsUrl || ""}
                                                onChange={e => setFormData({ ...formData, termsUrl: e.target.value })}
                                                placeholder="https://yoursite.com/terms"
                                                className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">Footer copyright text</label>
                                            <input
                                                type="text"
                                                value={formData.footerText || ""}
                                                onChange={e => setFormData({ ...formData, footerText: e.target.value })}
                                                placeholder="© 2026 My Business Name. All rights reserved."
                                                className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* TAB CONTENT: AI CONFIGURATION */}
                            {activeTab === 'ai' && (
                                <section className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-8">
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                                            <p className="font-bold mb-1 flex items-center gap-2">
                                                <Shield size={16} /> Bring Your Own Key (BYOK)
                                            </p>
                                            <p className="opacity-80">
                                                Configure your own AI model. Your API key is stored securely and used only for your business operations.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* AI Provider Switcher */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">AI provider<HelpIcon topic="aiProvider" /></label>
                                                <div className="flex p-1.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                                    {(['openai', 'google'] as const).map((provider) => (
                                                        <button
                                                            key={provider}
                                                            onClick={() => setFormData({
                                                                ...formData,
                                                                aiConfig: {
                                                                    ...(formData.aiConfig || {}),
                                                                    provider,
                                                                    model: provider === 'google' ? 'gemini-1.5-flash' : 'gpt-4o-mini'
                                                                }
                                                            })}
                                                            className={cn(
                                                                "flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all",
                                                                (formData.aiConfig?.provider || 'openai') === provider
                                                                    ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
                                                                    : "text-[var(--color-on-surface-variant)] opacity-60 hover:opacity-100"
                                                            )}
                                                        >
                                                            {provider === 'openai' ? 'OpenAI' : 'Google Gemini'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* API Key Input based on provider */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">
                                                    {(formData.aiConfig?.provider || 'openai') === 'openai' ? 'OpenAI API key' : 'Google AI API key'}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={(formData.aiConfig?.provider === 'google' ? formData.aiConfig?.googleApiKey : formData.aiConfig?.openaiApiKey) || ""}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        aiConfig: {
                                                            ...(formData.aiConfig || {}),
                                                            [formData.aiConfig?.provider === 'google' ? 'googleApiKey' : 'openaiApiKey']: e.target.value
                                                        }
                                                    })}
                                                    className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                                    placeholder={(formData.aiConfig?.provider || 'openai') === 'openai' ? "sk-..." : "AIza..."}
                                                />
                                                <div className="flex justify-between items-center px-1">
                                                    <p className="text-[10px] text-[var(--color-on-surface-variant)] italic opacity-40">Your key is never shared and used only for your agent.</p>
                                                    {formData.aiConfig?.provider === 'google' ? (
                                                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--color-primary)] font-bold hover:underline">
                                                            Get Gemini API Key (Free)
                                                        </a>
                                                    ) : (
                                                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--color-primary)] font-bold hover:underline">
                                                            Get OpenAI API Key
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-[var(--color-on-surface-variant)] ml-1 opacity-60">AI model</label>
                                                <div className="relative group">
                                                    <select
                                                        value={formData.aiConfig?.model || ((formData.aiConfig?.provider || 'openai') === 'google' ? "gemini-1.5-flash" : "gpt-4o-mini")}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            aiConfig: { ...(formData.aiConfig || {}), model: e.target.value }
                                                        })}
                                                        className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium appearance-none cursor-pointer"
                                                    >
                                                        {(formData.aiConfig?.provider || 'openai') === 'openai' ? (
                                                            <>
                                                                <option value="gpt-4o">GPT-4o (Premium/Fast)</option>
                                                                <option value="gpt-4o-mini">GPT-4o mini (Budget Friendly)</option>
                                                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (State-of-the-Art)</option>
                                                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Efficient)</option>
                                                            </>
                                                        )}
                                                    </select>
                                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-on-surface-variant)] opacity-40 pointer-events-none" size={16} />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-sm font-black text-[var(--color-on-surface-variant)] opacity-60">Sales agent instructions (system prompt)</label>
                                                </div>

                                                {/* Prompt Templates */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {[
                                                        { id: 'pro', label: 'Professional', icon: '👔', prompt: "You are a professional sales executive for Bized. Your goals are to highlight product quality, explain technical specifications clearly, and always maintain a helpful, formal tone. Focus on building trust and long-term customer relationships." },
                                                        { id: 'playful', label: 'Playful', icon: '✨', prompt: "You are an energetic, friendly sales partner! Use emojis often (WhatsApp style), keep your messages punchy and exciting. Your goal is to create buzz. Always include a clear call-to-action!" },
                                                        { id: 'seo', label: 'SEO Expert', icon: '🔍', prompt: "You are an SEO-obsessed growth expert. Focus on high-traffic keywords and clarity for Google search. Your goal is to make every piece of text highly searchable while remaining engaging for humans." },
                                                        { id: 'support', label: 'Supportive', icon: '🤝', prompt: "You are a dedicated Customer Success agent. Your primary goal is to answer questions accurately and resolve concerns. Be patient, clear, and always look for ways to go the extra mile." },
                                                    ].map((template) => (
                                                        <button
                                                            key={template.id}
                                                            onClick={() => setFormData((prev: any) => ({
                                                                ...prev,
                                                                aiConfig: { ...(prev?.aiConfig || {}), systemPrompt: template.prompt }
                                                            }))}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)]/10 text-[10px] font-bold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all tracking-widest whitespace-nowrap"
                                                        >
                                                            <span>{template.icon}</span>
                                                            {template.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                <textarea
                                                    value={formData.aiConfig?.systemPrompt || ""}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        aiConfig: { ...(formData.aiConfig || {}), systemPrompt: e.target.value }
                                                    })}
                                                    className="w-full min-h-[160px] p-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium resize-none text-sm"
                                                    placeholder="e.g. You are a helpful sales assistant for Bized. Your goal is to help customers find products and answer questions about the store..."
                                                />
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] ml-1 italic opacity-40">Choose a template above or define how your AI agent should behave manually.</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Sticky Mobile/Bottom Save Bar */}
                <div className="fixed bottom-0 left-0 md:left-auto right-0 md:w-[calc(100%-320px)] bg-[var(--color-surface-container-high)]/80 backdrop-blur-xl border-t border-[var(--color-outline-variant)]/10 p-4 z-20 flex justify-center">
                    <div className="max-w-3xl w-full flex items-center justify-between gap-4">
                        <div className="hidden sm:block">
                            <AnimatePresence>
                                {saveSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
                                    >
                                        <CheckCircle2 size={16} /> Changes saved successfully
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-14 px-10 rounded-[var(--radius-m3-xl)] gap-2 shadow-[var(--shadow-m3-2)] bg-[var(--color-primary)] text-[var(--color-on-primary)] min-w-[180px] font-black tracking-widest active:scale-95"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} strokeWidth={3} /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </main>

            <CurrencyModal
                isOpen={isCurrencyModalOpen}
                onClose={() => setIsCurrencyModalOpen(false)}
                selectedCode={formData.currency}
                onSelect={(curr) => {
                    setFormData({ ...formData, currency: curr.code });
                    setIsCurrencyModalOpen(false);
                }}
            />

            <Sheet
                open={isTaxAiOpen}
                onClose={() => setIsTaxAiOpen(false)}
                title="AI Tax Assistant"
                icon={<Sparkles size={24} />}
                footer={
                    <Button
                        onClick={() => {
                            const selected = taxAiResults.filter(t => t.selected).map(t => ({
                                id: t.id,
                                name: t.name,
                                rate: t.rate,
                                isDefault: false
                            }));
                            if (selected.length > 0) {
                                const existingTaxes = formData.taxes || [];
                                if (existingTaxes.length === 0) {
                                    selected[0].isDefault = true;
                                }
                                setFormData({ ...formData, taxes: [...existingTaxes, ...selected] });
                            }
                            setIsTaxAiOpen(false);
                        }}
                        className="w-full h-12 rounded-xl font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                    >
                        Apply Selected Rates
                    </Button>
                }
            >
                <div className="space-y-6">
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-80">
                        Based on your business country (<strong>{formData?.country}</strong>), here are the standard tax rates. Select the ones you want to apply.
                    </p>

                    {isTaxAiLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                            <p className="text-sm font-bold opacity-60">Consulting AI knowledge base for {formData?.country}...</p>
                        </div>
                    ) : (
                        <div className="space-y-3 bg-[var(--color-surface-container-low)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/10">
                            {taxAiResults.map((tax, i) => (
                                <label key={tax.id} className="flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-outline-variant)]/20 cursor-pointer hover:border-[var(--color-primary)]/50 transition-all group shadow-sm">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={tax.selected}
                                            onChange={e => {
                                                const newR = [...taxAiResults];
                                                newR[i].selected = e.target.checked;
                                                setTaxAiResults(newR);
                                            }}
                                            className="peer appearance-none w-6 h-6 rounded border-2 border-[var(--color-outline-variant)]/30 checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all cursor-pointer"
                                        />
                                        <CheckCircle2 size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">{tax.name}</p>
                                    </div>
                                    <div className="font-bold text-sm text-[var(--color-on-surface-variant)]">
                                        {tax.rate}%
                                    </div>
                                </label>
                            ))}
                            {taxAiResults.length === 0 && !isTaxAiLoading && (
                                <div className="text-center py-8 opacity-60">
                                    No tax rates found for this country.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Sheet>
            <CountryModal
                isOpen={isCountryModalOpen}
                onClose={() => setIsCountryModalOpen(false)}
                selectedName={formData.country}
                onSelect={(country) => {
                    setFormData({
                        ...formData,
                        country: country.name,
                        currency: country.currencyCode || formData.currency
                    });
                    setIsCountryModalOpen(false);
                }}
            />
        </div>
    );
}
