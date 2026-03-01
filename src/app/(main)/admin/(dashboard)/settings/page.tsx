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
    Plus,
    Smartphone,
    Info,
    CreditCard,
    Layers,
    Landmark,
    List
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

type SettingsTab = "general" | "contact" | "whatsapp" | "branding" | "regional" | "payments" | "taxes" | "social" | "legal" | "ai";

const TABS = [
    { id: "general", label: "General", icon: Building2, description: "Store name and industry" },
    { id: "contact", label: "Contact", icon: Phone, description: "Phone, email and address" },
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, description: "Chat and button config" },
    { id: "branding", label: "Branding", icon: Palette, description: "Logo and theme colors" },
    { id: "regional", label: "Regional", icon: Languages, description: "Currency and formatting" },
    { id: "payments", label: "Payment Methods", icon: CreditCard, description: "Accepted channels and COA mapping" },
    { id: "taxes", label: "Taxes", icon: Coins, description: "Tax rates and configuration" },
    { id: "social", label: "Socials", icon: Share2, description: "WhatsApp and social links" },
    { id: "legal", label: "Legal", icon: Shield, description: "Policies and terms" },
    { id: "ai", label: "AI Configuration", icon: Globe, description: "BYOK and Agent settings" },
] as const;

import { useAi } from "@/contexts/AiContext";

interface PaymentMethod {
    id: string;
    name: string;
    type: "Cash" | "CreditCard" | "BankTransfer" | "MobileMoney" | "Crypto" | "Cheque" | "Other";
    enabled: boolean;
    coaCode: string;
    gateway?: string;
    gatewayAccountId?: string;
    apiKey?: string;
    publicKey?: string;
    webhookSecret?: string;
    description?: string;
    icon?: string;
    sortOrder: number;
    _id?: string;
    settings?: Record<string, any>;
}

const PaymentMethodCard = ({ method, onToggle, onEdit }: {
    method: PaymentMethod;
    onToggle: (enabled: boolean) => void;
    onEdit: () => void;
}) => (
    <div
        className={cn(
            "flex items-center gap-4 p-5 rounded-2xl border transition-all group",
            method.enabled
                ? "bg-[var(--color-surface-container-low)] border-[var(--color-primary)]/20 shadow-sm"
                : "bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/10 opacity-70 grayscale-[0.5]"
        )}
    >
        <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all",
            method.enabled ? "bg-[var(--color-primary)]/10 scale-105" : "bg-[var(--color-surface-container)]"
        )}>
            {method.icon || "💰"}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">{method.name}</span>
                {method.gateway && (
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        method.enabled
                            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm"
                            : "bg-[var(--color-secondary-container)]/30 border-[var(--color-outline-variant)]/20 text-[var(--color-on-secondary-container)] opacity-60"
                    )}>
                        {method.gateway}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-60 line-clamp-1">
                    {method.description || method.type}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest whitespace-nowrap">
                    <List size={10} /> COA {method.coaCode}
                </span>
            </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <button
                onClick={onEdit}
                className="w-10 h-10 rounded-xl hover:bg-[var(--color-surface-container-highest)] flex items-center justify-center transition-all text-[var(--color-on-surface-variant)] opacity-40 hover:opacity-100 hover:scale-105 active:scale-95"
            >
                <Settings size={18} />
            </button>
            <button
                onClick={() => onToggle(!method.enabled)}
                className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all relative shrink-0",
                    method.enabled ? "bg-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/30" : "bg-[var(--color-outline-variant)]/30"
                )}
            >
                <div className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                    method.enabled ? "translate-x-6" : "translate-x-0"
                )} />
            </button>
        </div>
    </div>
);

export default function SettingsPage() {
    const { currentBusiness, updateBusiness, refreshBusinesses, isLoading } = useBusiness();
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

    // — Payment Methods state —
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(currentBusiness?.paymentMethods || []);
    const [paymentSubTab, setPaymentSubTab] = useState<'methods' | 'accounting' | 'checkout'>('methods');
    const [pmLoading, setPmLoading] = useState(false);
    const [pmSaving, setPmSaving] = useState(false);
    const [pmSaveSuccess, setPmSaveSuccess] = useState(false);
    const [editingPm, setEditingPm] = useState<PaymentMethod | null>(null);

    // Sync from context if it's already there
    React.useEffect(() => {
        if (currentBusiness?.paymentMethods) {
            setPaymentMethods(currentBusiness.paymentMethods);
        }
    }, [currentBusiness?.paymentMethods]);
    const [pmEditForm, setPmEditForm] = useState({
        gateway: "",
        gatewayAccountId: "",
        apiKey: "",
        publicKey: "",
        webhookSecret: "",
        description: "",
        coaCode: ""
    });
    const [pmSettings, setPmSettings] = useState<Record<string, any>>({});
    const [newPmOpen, setNewPmOpen] = useState(false);
    const [newPmForm, setNewPmForm] = useState({
        name: "",
        type: "Cash" as PaymentMethod["type"],
        coaCode: "",
        gateway: "",
        apiKey: "",
        publicKey: "",
        webhookSecret: "",
        description: "",
        icon: ""
    });
    const [newPmSettings, setNewPmSettings] = useState<Record<string, any>>({});

    const fetchPaymentMethods = React.useCallback(async () => {
        if (!currentBusiness?._id) return;
        setPmLoading(true);
        try {
            const res = await fetch(`/api/stores/${currentBusiness._id}/payment-methods`);
            const data = await res.json();
            if (data.methods) setPaymentMethods(data.methods);
        } finally {
            setPmLoading(false);
        }
    }, [currentBusiness?._id]);

    React.useEffect(() => {
        // Only fetch if context doesn't have them yet or we specifically need a refresh
        if (activeTab === "payments" && (!currentBusiness?.paymentMethods || currentBusiness.paymentMethods.length === 0)) {
            fetchPaymentMethods();
        }
    }, [activeTab, fetchPaymentMethods, currentBusiness?.paymentMethods]);

    const handlePmToggle = async (methodId: string, enabled: boolean) => {
        setPaymentMethods(prev => prev.map(m => m.id === methodId ? { ...m, enabled } : m));
        await fetch(`/api/stores/${currentBusiness?._id}/payment-methods`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates: [{ id: methodId, enabled }] }),
        });
        refreshBusinesses();
    };

    const handlePmEditSave = async () => {
        if (!editingPm || !currentBusiness?._id) return;
        setPmSaving(true);
        await fetch(`/api/stores/${currentBusiness._id}/payment-methods`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                updates: [{ id: editingPm.id, ...pmEditForm, settings: pmSettings }]
            })
        });
        setPmSaving(false);
        setPmSaveSuccess(true);
        setEditingPm(null);
        refreshBusinesses();
        setTimeout(() => setPmSaveSuccess(false), 2500);
    };

    const handleNewPmCreate = async () => {
        if (!newPmForm.name || !newPmForm.coaCode || !currentBusiness?._id) return;
        setPmSaving(true);
        const res = await fetch(`/api/stores/${currentBusiness._id}/payment-methods`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newPmForm, settings: newPmSettings }),
        });
        const data = await res.json();
        setPmSaving(false);
        if (res.ok) {
            setNewPmOpen(false);
            setNewPmForm({ name: "", type: "Cash", coaCode: "", gateway: "", apiKey: "", publicKey: "", webhookSecret: "", description: "", icon: "" });
            refreshBusinesses();
        } else {
            alert(data.error);
        }
    };

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

                            {/* TAB CONTENT: PAYMENT METHODS */}
                            {activeTab === 'payments' && (
                                <section className="space-y-6">
                                    {/* Sub-Tab Switcher */}
                                    <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-2xl w-fit">
                                        {[
                                            { id: 'methods', label: 'Gateways', icon: CreditCard },
                                            { id: 'accounting', label: 'COA Mapping', icon: List },
                                            { id: 'checkout', label: 'Checkout Settings', icon: Smartphone }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setPaymentSubTab(tab.id as any)}
                                                className={cn(
                                                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all",
                                                    paymentSubTab === tab.id
                                                        ? "bg-[var(--color-primary)] text-white shadow-md active:scale-95"
                                                        : "text-[var(--color-on-surface-variant)] opacity-50 hover:opacity-100 hover:bg-[var(--color-surface-container-high)]"
                                                )}
                                            >
                                                <tab.icon size={14} />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {paymentSubTab === 'methods' && (
                                        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-black text-[var(--color-on-surface)]">Payment Channels</h3>
                                                        <HelpIcon topic="paymentMethods" />
                                                    </div>
                                                    <p className="text-xs font-medium text-[var(--color-on-surface-variant)] opacity-60 mt-1">
                                                        Each enabled channel auto-creates a dedicated ledger account in your Chart of Accounts.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setNewPmOpen(true)}
                                                    className="flex items-center gap-2 h-12 px-5 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95 shrink-0"
                                                >
                                                    <Plus size={18} /> Add Custom
                                                </button>
                                            </div>

                                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                                    <Landmark size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-sm text-[var(--color-on-surface)]">Automatic Finance Integration</p>
                                                    <p className="text-xs text-[var(--color-on-surface-variant)] opacity-70 mt-0.5">
                                                        When an order is paid, the system posts a <strong>Debit</strong> to the matching channel account and a <strong>Credit</strong> to Accounts Receivable — fully IFRS/GAAP double-entry compliant.
                                                    </p>
                                                </div>
                                            </div>

                                            {pmLoading ? (
                                                <div className="space-y-3">
                                                    {[...Array(4)].map((_, i) => (
                                                        <div key={i} className="h-20 rounded-2xl bg-[var(--color-surface-container-low)] animate-pulse" />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-10">
                                                    {/* Section: Activated */}
                                                    {(paymentMethods.filter(m => m.enabled).length > 0) && (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 px-1">
                                                                <div className="w-1 h-4 rounded-full bg-[var(--color-primary)]" />
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
                                                                    Activated Channels ({paymentMethods.filter(m => m.enabled).length})
                                                                </h4>
                                                            </div>
                                                            <div className="grid gap-3">
                                                                {paymentMethods.filter(m => m.enabled).map(method => (
                                                                    <PaymentMethodCard
                                                                        key={method.id}
                                                                        method={method}
                                                                        onEdit={() => {
                                                                            setEditingPm(method);
                                                                            setPmEditForm({
                                                                                gateway: method.gateway || "",
                                                                                gatewayAccountId: method.gatewayAccountId || "",
                                                                                apiKey: method.apiKey || "",
                                                                                publicKey: method.publicKey || "",
                                                                                webhookSecret: method.webhookSecret || "",
                                                                                description: method.description || "",
                                                                                coaCode: method.coaCode,
                                                                            });
                                                                            setPmSettings(method.settings || {});
                                                                        }}
                                                                        onToggle={(enabled) => handlePmToggle(method.id, enabled)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Section: Available */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 px-1">
                                                            <div className="w-1 h-4 rounded-full bg-[var(--color-outline-variant)]/40" />
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                                                Available Gateways ({paymentMethods.filter(m => !m.enabled).length})
                                                            </h4>
                                                        </div>
                                                        <div className="grid gap-3">
                                                            {paymentMethods.filter(m => !m.enabled).map(method => (
                                                                <PaymentMethodCard
                                                                    key={method.id}
                                                                    method={method}
                                                                    onEdit={() => {
                                                                        setEditingPm(method);
                                                                        setPmEditForm({
                                                                            gateway: method.gateway || "",
                                                                            gatewayAccountId: method.gatewayAccountId || "",
                                                                            apiKey: method.apiKey || "",
                                                                            publicKey: method.publicKey || "",
                                                                            webhookSecret: method.webhookSecret || "",
                                                                            description: method.description || "",
                                                                            coaCode: method.coaCode,
                                                                        });
                                                                        setPmSettings(method.settings || {});
                                                                    }}
                                                                    onToggle={(enabled) => handlePmToggle(method.id, enabled)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {paymentSubTab === 'accounting' && (
                                        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                    <List size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-[var(--color-on-surface)]">Chart of Accounts Mapping</h4>
                                                    <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">Enabled channels auto-create Current Asset accounts in your ledger</p>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="border-b border-[var(--color-outline-variant)]/10">
                                                            <th className="py-2 px-3 font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">Channel</th>
                                                            <th className="py-2 px-3 font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">COA Code</th>
                                                            <th className="py-2 px-3 font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">Account Type</th>
                                                            <th className="py-2 px-3 font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                                                        {paymentMethods.map(m => (
                                                            <tr key={m.id} className={cn("transition-colors", !m.enabled && "opacity-40")}>
                                                                <td className="py-3 px-3 font-bold">{m.icon} {m.name}</td>
                                                                <td className="py-3 px-3 font-mono font-black text-[var(--color-primary)]">{m.coaCode}</td>
                                                                <td className="py-3 px-3 text-[var(--color-on-surface-variant)]">Current Asset</td>
                                                                <td className="py-3 px-3">
                                                                    <span className={cn(
                                                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                                        m.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
                                                                    )}>
                                                                        {m.enabled ? "Active" : "Inactive"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {paymentSubTab === 'checkout' && (
                                        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                    <Smartphone size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-[var(--color-on-surface)]">Checkout Experience</h4>
                                                    <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">Control how customers interact with payments</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-4">
                                                {[
                                                    { id: 'saveCards', label: 'Allow customers to save cards', desc: 'Securely store card tokens for faster checkout via PCI-compliant processors.' },
                                                    { id: 'stkPush', label: 'Auto-trigger STK Push', desc: 'Automatically send payment requests to mobile phones for M-Pesa / Mobile Money.' },
                                                    { id: 'receipts', label: 'Send automated e-receipts', desc: 'System will email a professional billing confirmation immediately upon successful payment.' }
                                                ].map(item => (
                                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                                        <div className="flex-1 pr-8">
                                                            <p className="text-sm font-bold text-[var(--color-on-surface)]">{item.label}</p>
                                                            <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60 mt-0.5">{item.desc}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setFormData({
                                                                ...formData,
                                                                checkoutSettings: {
                                                                    ...(formData.checkoutSettings || {}),
                                                                    [item.id]: !(formData.checkoutSettings?.[item.id as keyof typeof formData.checkoutSettings] ?? false)
                                                                }
                                                            })}
                                                            className={cn(
                                                                "w-12 h-6 rounded-full p-1 transition-all relative shrink-0",
                                                                formData.checkoutSettings?.[item.id as keyof typeof formData.checkoutSettings] ? "bg-[var(--color-primary)]" : "bg-[var(--color-outline-variant)]/30"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                                                                formData.checkoutSettings?.[item.id as keyof typeof formData.checkoutSettings] ? "translate-x-6" : "translate-x-0"
                                                            )} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                                                    <label className="text-sm font-black text-[var(--color-on-surface-variant)] opacity-60">AI Assistant instructions (system prompt)</label>
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
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] ml-1 italic opacity-40">Choose a template above or define how your AI Assistant should behave manually.</p>
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
            <Sheet
                open={!!editingPm}
                onClose={() => setEditingPm(null)}
                title={editingPm ? `Configure ${pmEditForm.gateway || editingPm.name}` : ""}
                footer={
                    <div className="flex flex-col gap-4 w-full px-1">
                        <div className="flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                AES-256 Encrypted
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">v1.2.x SECURE</span>
                        </div>
                        <Button
                            onClick={handlePmEditSave}
                            disabled={pmSaving}
                            className={cn(
                                "w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95",
                                pmEditForm.gateway?.toLowerCase() === "stripe" ? "bg-[#635bff] hover:bg-[#5b51ea] text-white" :
                                    pmEditForm.gateway?.toLowerCase() === "paystack" ? "bg-[#0ba4db] hover:bg-[#0995c7] text-white" :
                                        pmEditForm.gateway?.toLowerCase() === "m-pesa" ? "bg-[#49ab21] hover:bg-[#3e921b] text-white" :
                                            pmEditForm.gateway?.toLowerCase() === "dpo" ? "bg-[#004a8f] hover:bg-[#003d76] text-white" :
                                                "bg-[var(--color-primary)] text-white"
                            )}
                        >
                            {pmSaving ? <Loader2 className="animate-spin" /> : "Verify & Save Settings"}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-8 py-2">
                    {/* Brand Banner */}
                    <div className={cn(
                        "p-8 rounded-[2rem] flex flex-col items-center justify-center text-center gap-5 border transition-all duration-500",
                        pmEditForm.gateway?.toLowerCase() === "stripe" ? "bg-[#635bff]/5 border-[#635bff]/20" :
                            pmEditForm.gateway?.toLowerCase() === "paystack" ? "bg-[#0ba4db]/5 border-[#0ba4db]/20" :
                                pmEditForm.gateway?.toLowerCase() === "m-pesa" ? "bg-[#49ab21]/5 border-[#49ab21]/20" :
                                    pmEditForm.gateway?.toLowerCase() === "dpo" ? "bg-[#004a8f]/5 border-[#004a8f]/20" :
                                        "bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]/20"
                    )}>
                        <div className={cn(
                            "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500",
                            pmEditForm.gateway?.toLowerCase() === "stripe" ? "bg-white text-[#635bff]" :
                                pmEditForm.gateway?.toLowerCase() === "paystack" ? "bg-white text-[#0ba4db]" :
                                    pmEditForm.gateway?.toLowerCase() === "m-pesa" ? "bg-white text-[#49ab21]" :
                                        pmEditForm.gateway?.toLowerCase() === "dpo" ? "bg-white text-[#004a8f]" :
                                            "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                        )}>
                            {pmEditForm.gateway?.toLowerCase() === "stripe" ? <CreditCard size={40} /> :
                                pmEditForm.gateway?.toLowerCase() === "m-pesa" ? <Smartphone size={40} /> :
                                    <Settings size={40} />}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight text-[var(--color-on-surface)]">
                                {pmEditForm.gateway === "Stripe" ? "Stripe Global" :
                                    pmEditForm.gateway === "Paystack" ? "Paystack Africa" :
                                        pmEditForm.gateway === "M-Pesa" ? "M-Pesa Express" :
                                            pmEditForm.gateway === "DPO" ? "DPO Central" :
                                                "Standard Ledger Channel"}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] opacity-60">Verified Gateway</span>
                                <div className="w-1 h-3 rounded-full bg-[var(--color-outline-variant)]/30" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Store: {currentBusiness?._id?.slice(-8)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Gateway Input (Legacy or Free-form) */}
                        {!editingPm?.gateway && (
                            <div className="space-y-3 px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Payment Provider Backend</label>
                                <input
                                    type="text"
                                    value={pmEditForm.gateway}
                                    onChange={e => setPmEditForm({ ...pmEditForm, gateway: e.target.value })}
                                    placeholder="e.g. Stripe, Paystack, M-Pesa, DPO"
                                    className="w-full h-16 px-6 rounded-2xl bg-[var(--color-surface-container-low)] border-2 border-transparent focus:border-[var(--color-primary)] outline-none transition-all font-bold text-lg shadow-sm"
                                />
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Security Section */}
                            <div className="bg-[var(--color-surface-container-low)]/50 p-6 rounded-[2rem] border border-[var(--color-outline-variant)]/10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        <Shield size={16} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Security Credentials</h4>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">
                                            {pmEditForm.gateway === "M-Pesa" ? "Consumer Key" : pmEditForm.gateway === "DPO" ? "Company Token" : "Secret / Integration Key"}
                                        </label>
                                        <input
                                            type="password"
                                            value={pmEditForm.apiKey}
                                            onChange={e => setPmEditForm({ ...pmEditForm, apiKey: e.target.value })}
                                            placeholder={pmEditForm.gateway === "M-Pesa" ? "MSF_..." : "sk_..."}
                                            className="w-full h-14 px-6 rounded-2xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
                                        />
                                    </div>

                                    {pmEditForm.gateway !== "DPO" && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">
                                                {pmEditForm.gateway === "M-Pesa" ? "Consumer Secret" : "Public / Client Key"}
                                            </label>
                                            <input
                                                type={pmEditForm.gateway === "M-Pesa" ? "password" : "text"}
                                                value={pmEditForm.gateway === "M-Pesa" ? pmEditForm.webhookSecret : pmEditForm.publicKey}
                                                onChange={e => setPmEditForm({ ...pmEditForm, [pmEditForm.gateway === "M-Pesa" ? 'webhookSecret' : 'publicKey']: e.target.value })}
                                                placeholder={pmEditForm.gateway === "M-Pesa" ? "MSF_SEC_..." : "pk_..."}
                                                className="w-full h-14 px-6 rounded-2xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Options & Operations */}
                            {(pmEditForm.gateway === "Stripe" || pmEditForm.gateway === "Paystack" || pmEditForm.gateway === "M-Pesa" || pmEditForm.gateway === "DPO") && (
                                <div className="bg-[var(--color-surface-container-low)]/50 p-6 rounded-[2rem] border border-[var(--color-outline-variant)]/10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                            <Layers size={16} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Operations & Environment</h4>
                                    </div>
                                    <div className="space-y-5">
                                        {pmEditForm.gateway === "M-Pesa" && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">STK Passkey</label>
                                                <input
                                                    type="password"
                                                    value={pmSettings.passkey || ""}
                                                    onChange={e => setPmSettings({ ...pmSettings, passkey: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-2xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
                                                />
                                            </div>
                                        )}

                                        {pmEditForm.gateway === "DPO" && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Service Type</label>
                                                <input
                                                    type="text"
                                                    value={pmSettings.serviceType || ""}
                                                    onChange={e => setPmSettings({ ...pmSettings, serviceType: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-2xl bg-white/50 border border-[var(--color-outline-variant)]/20 shadow-sm outline-none focus:border-[var(--color-primary)] transition-all font-bold"
                                                />
                                            </div>
                                        )}

                                        {pmEditForm.gateway === "Stripe" && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Webhook Signing Secret</label>
                                                <input
                                                    type="password"
                                                    value={pmEditForm.webhookSecret}
                                                    onChange={e => setPmEditForm({ ...pmEditForm, webhookSecret: e.target.value })}
                                                    placeholder="whsec_..."
                                                    className="w-full h-14 px-6 rounded-2xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Operating Environment</label>
                                            <div className="flex p-2 bg-[var(--color-surface-container-highest)]/20 rounded-[1.25rem] border border-[var(--color-outline-variant)]/10">
                                                <button
                                                    onClick={() => setPmSettings({ ...pmSettings, mode: "sandbox" })}
                                                    className={cn(
                                                        "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        pmSettings.mode !== "production" ? "bg-white shadow-xl text-black scale-100" : "opacity-40 hover:opacity-100 scale-95"
                                                    )}
                                                >
                                                    Sandbox
                                                </button>
                                                <button
                                                    onClick={() => setPmSettings({ ...pmSettings, mode: "production" })}
                                                    className={cn(
                                                        "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        pmSettings.mode === "production" ? "bg-[var(--color-error)] text-white shadow-xl scale-100" : "opacity-40 hover:opacity-100 scale-95"
                                                    )}
                                                >
                                                    Live
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Legacy / Identity Section */}
                            <div className="space-y-6 px-1 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Account Identification</label>
                                    <input
                                        type="text"
                                        value={pmEditForm.gatewayAccountId}
                                        onChange={e => setPmEditForm({ ...pmEditForm, gatewayAccountId: e.target.value })}
                                        className="w-full h-16 px-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-bold text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Finance Ledger (COA)</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={pmEditForm.coaCode}
                                            onChange={e => setPmEditForm({ ...pmEditForm, coaCode: e.target.value })}
                                            className="w-full h-16 px-6 rounded-2xl bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/20 outline-none text-[var(--color-primary)] font-black text-2xl tracking-tighter"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white py-1.5 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest">Connected</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Sheet>

            <Sheet
                open={newPmOpen}
                onClose={() => setNewPmOpen(false)}
                title="Register Payment Channel"
                footer={
                    <Button
                        onClick={handleNewPmCreate}
                        disabled={pmSaving || !newPmForm.name || !newPmForm.coaCode}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-[var(--color-primary)] text-white transition-all shadow-xl active:scale-95"
                    >
                        {pmSaving ? <Loader2 className="animate-spin" /> : "Deploy Channel"}
                    </Button>
                }
            >
                <div className="space-y-8 py-2">
                    <div className="bg-[var(--color-surface-container-low)] p-6 rounded-[2rem] border border-[var(--color-outline-variant)]/10 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Channel Branding</label>
                            <input
                                type="text"
                                value={newPmForm.name}
                                onChange={e => setNewPmForm({ ...newPmForm, name: e.target.value })}
                                placeholder="e.g. USDT Gateway"
                                className="w-full h-14 px-5 rounded-2xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-2">Market Asset Type</label>
                                <select
                                    value={newPmForm.type}
                                    onChange={e => setNewPmForm({ ...newPmForm, type: e.target.value as any })}
                                    className="w-full h-14 px-5 rounded-2xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-bold appearance-none"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="CreditCard">Credit / Debit Card</option>
                                    <option value="BankTransfer">Bank Transfer</option>
                                    <option value="MobileMoney">Mobile Money</option>
                                    <option value="Crypto">Cryptocurrency</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-2">Finance Ledger (COA)</label>
                                <input
                                    type="text"
                                    value={newPmForm.coaCode}
                                    onChange={e => setNewPmForm({ ...newPmForm, coaCode: e.target.value })}
                                    placeholder="e.g. 1060"
                                    className="w-full h-14 px-5 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 outline-none text-[var(--color-primary)] font-black text-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Infrastructure Hub</label>
                            <input
                                placeholder="Stripe, Paystack, M-Pesa..."
                                className="w-full h-14 px-5 rounded-2xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-bold"
                            />
                        </div>
                    </div>
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
        </div >
    );
}
