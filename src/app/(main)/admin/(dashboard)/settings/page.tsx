"use client";

import React, { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    Building2,
    Share2,
    Languages,
    Coins,
    ArrowUpRight,
    ExternalLink,
    Copy,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Settings,
    User,
    Phone,
    Globe,
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
    Zap,
    Heart,
    Lock,
    List,
    Mail,
    MapPin,
    Brain
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
import { MODULE_DEFINITIONS, BusinessModule } from "@/lib/modules";

const TABS = [
    { id: "profile", label: "Business Profile", icon: Building2, description: "Business details and contact info" },
    { id: "regional", label: "Regional", icon: Languages, description: "Currency and formatting" },
    { id: "payments", label: "Payment Methods", icon: CreditCard, description: "Accepted channels and COA mapping" },
    { id: "taxes", label: "Taxes", icon: Coins, description: "Tax rates and configuration" },
    { id: "legal", label: "Legal", icon: Shield, description: "Policies and terms" },
    { id: "ai", label: "AI Configuration", icon: Brain, description: "BYOK and Agent settings" },
    { id: "modules", label: "Industry Modules", icon: Layers, description: "Enable specialized features" },
] as const;

type SettingsTab = "overview" | "profile" | "regional" | "payments" | "taxes" | "legal" | "ai" | "modules";

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
    platformDisabled?: boolean;
}

const PaymentMethodCard = ({ method, onToggle, onEdit }: {
    method: PaymentMethod;
    onToggle: (enabled: boolean) => void;
    onEdit: () => void;
}) => (
    <div
        className={cn(
            "flex items-center gap-4 p-5 rounded-xl border transition-all group",
            method.enabled
                ? "bg-[var(--color-surface-container-low)] border-[var(--color-primary)]/20 shadow-sm"
                : "bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/10 opacity-70 grayscale-[0.5]",
            method.platformDisabled && "opacity-40 grayscale pointer-events-none"
        )}
    >
        <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all",
            method.enabled ? "bg-[var(--color-primary)]/10 scale-105" : "bg-[var(--color-surface-container)]"
        )}>
            {method.icon || "💰"}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">{method.name}</span>
                {method.gateway && (
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        method.enabled
                            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm"
                            : "bg-[var(--color-secondary-container)]/30 border-[var(--color-outline-variant)]/20 text-[var(--color-on-secondary-container)] opacity-60"
                    )}>
                        {method.gateway}
                    </span>
                )}
                {method.platformDisabled && (
                    <span className="text-[9px] font-bold bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-full uppercase tracking-widest border border-rose-500/20">
                        Disabled by Platform
                    </span>
                )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-60 line-clamp-1">
                    {method.description || method.type}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest whitespace-nowrap">
                    <List size={10} /> COA {method.coaCode}
                </span>
            </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <button
                disabled={method.platformDisabled}
                onClick={onEdit}
                className="w-10 h-10 rounded-xl hover:bg-[var(--color-surface-container-highest)] flex items-center justify-center transition-all text-[var(--color-on-surface-variant)] opacity-70 hover:opacity-100 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
                <Settings size={18} />
            </button>
            <button
                disabled={method.platformDisabled}
                onClick={() => onToggle(!method.enabled)}
                className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all relative shrink-0",
                    method.enabled ? "bg-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/30" : "bg-[var(--color-outline-variant)]/30",
                    method.platformDisabled && "bg-[var(--color-outline-variant)]/20 cursor-not-allowed"
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

const SummaryCard = ({ icon: Icon, title, description, children, onClick, filledCount = 0, totalFields = 0 }: {
    icon: any;
    title: string;
    description: string;
    children: React.ReactNode;
    onClick: () => void;
    filledCount?: number;
    totalFields?: number;
}) => (
    <button
        onClick={onClick}
        className="group text-left w-full rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    >
        <div className="p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/5 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] flex items-center justify-center transition-colors shadow-sm">
                        <Icon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--color-on-surface)] text-lg">{title}</h3>
                        {totalFields > 0 && (
                            <p className="text-[11px] text-[var(--color-on-surface-variant)] opacity-60 mt-0.5">
                                {filledCount}/{totalFields} fields completed
                            </p>
                        )}
                        {totalFields === 0 && (
                            <p className="text-[11px] text-[var(--color-on-surface-variant)] opacity-60 mt-0.5">{description}</p>
                        )}
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-primary)] bg-[var(--color-primary)]/5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                    <ChevronRight size={18} />
                </div>
            </div>

            <div className="pl-16">
                {children}
            </div>
        </div>

        {totalFields > 0 && (
            <div className="h-1 bg-[var(--color-surface-container-high)]">
                <div className="h-full bg-[var(--color-primary)] transition-all duration-700" style={{ width: `${(filledCount / totalFields) * 100}%` }} />
            </div>
        )}
    </button>
);

export default function SettingsPage() {
    const { currentBusiness, updateBusiness, refreshBusinesses, isLoading } = useBusiness();
    const { setContextData, setOnApplyChanges } = useAi();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const tab = searchParams.get('tab') as SettingsTab;
        return (tab && (tab === "overview" || TABS.some(t => t.id === tab))) ? tab : "overview";
    });

    // Handle tab change when URL changes (e.g. clicking link from AI chat)
    React.useEffect(() => {
        const tab = searchParams.get('tab') as SettingsTab;
        if (tab && (tab === "overview" || TABS.some(t => t.id === tab))) {
            setActiveTab(tab);
        } else if (!tab) {
            setActiveTab("overview");
        }
    }, [searchParams]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [formData, setFormData] = useState<any>(null);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

    // — Settings Edit States —
    const [editingSection, setEditingSection] = useState<"identity" | "details" | "contact" | "presence" | "regional" | "taxes" | "legal" | "ai_keys" | "ai_instructions" | null>(null);

    // — Payment Methods state —
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(currentBusiness?.paymentMethods || []);
    const [paymentSubTab, setPaymentSubTab] = useState<'methods' | 'payouts' | 'accounting' | 'checkout'>('methods');
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

    const handleConnectGateway = (gateway: string, extraParams: string = "") => {
        if (!currentBusiness?._id) return;
        window.location.href = `/api/payments/onboard/${gateway.toLowerCase()}?storeId=${currentBusiness._id}${extraParams}`;
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
        <div className="flex-1 overflow-y-auto bg-[var(--color-surface-container-low)] relative">
            <div className="max-w-3xl mx-auto p-8 pb-32">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--color-on-surface)] tracking-tight">
                            {activeTabData?.label}
                        </h2>
                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70 mt-1">
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
                        {/* OVERVIEW SECTION: CATEGORY CARDS */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id as SettingsTab);
                                            window.history.pushState({}, '', `/admin/settings?tab=${tab.id}`);
                                        }}
                                        className={cn(
                                            "group relative flex items-center justify-between p-7 rounded-[28px] bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/10 hover:border-[var(--color-primary)]/20 hover:shadow-m3-3 transition-all duration-300 transform hover:-translate-y-0.5 mt-4 first:mt-0"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-xl bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-on-surface-variant)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-6">
                                                <tab.icon size={28} strokeWidth={2.5} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xl font-bold text-[var(--color-on-surface)] tracking-tight">{tab.label}</h3>
                                                <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60 font-medium">{tab.description}</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-primary)]/5 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                                            <ChevronRight size={20} strokeWidth={3} />
                                        </div>

                                        {/* Subtle completion indicator */}
                                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                            {(() => {
                                                const getProgress = (id: string) => {
                                                    if (id === 'profile') {
                                                        const fields = ["name", "slug", "email", "phone", "address", "city", "country", "description"];
                                                        const filled = fields.filter(f => formData[f as keyof typeof formData]).length;
                                                        return Math.round((filled / fields.length) * 100);
                                                    }
                                                    if (id === 'payments') {
                                                        return paymentMethods.some(m => m.enabled) ? 100 : 0;
                                                    }
                                                    if (id === 'ai') {
                                                        return (formData.aiConfig?.openaiApiKey || formData.aiConfig?.googleApiKey) ? 100 : 0;
                                                    }
                                                    return 0;
                                                };
                                                const prog = getProgress(tab.id);
                                                return (
                                                    <>
                                                        <div className="h-1.5 w-12 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${prog}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase">{prog}%</span>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TAB CONTENT: BUSINESS PROFILE */}
                        {activeTab === 'profile' && (
                            <>
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    <header className="mb-8 p-1">
                                        <h3 className="text-2xl font-bold text-[var(--color-on-surface)]">Business Profile</h3>
                                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70">Manage your brand identity and contact details</p>
                                    </header>
                                    <SummaryCard
                                        icon={Building2}
                                        title="Primary Identity"
                                        description="Your brand name and basic store info"
                                        onClick={() => setEditingSection("identity")}
                                        {...(() => {
                                            const fields = ["name", "slug", "subtitle"];
                                            const filled = fields.filter(f => formData[f]).length;
                                            return { filledCount: filled, totalFields: fields.length };
                                        })()}
                                    >
                                        <div className="flex flex-col gap-1 mb-2">
                                            <span className="text-sm font-bold text-[var(--color-on-surface)]">{formData.name}</span>
                                            <span className="text-[10px] opacity-40 font-mono">bized.app/{formData.slug}</span>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard
                                        icon={Info}
                                        title="Business Details"
                                        description="Industry and deep description"
                                        onClick={() => setEditingSection("details")}
                                        {...(() => {
                                            const fields = ["industry", "businessType", "description"];
                                            const filled = fields.filter(f => formData[f]).length;
                                            return { filledCount: filled, totalFields: fields.length };
                                        })()}
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--color-surface-container-highest)] text-[10px] font-bold text-[var(--color-on-surface-variant)]">
                                                {formData.industry || "No Industry"}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--color-surface-container-highest)] text-[10px] font-bold text-[var(--color-on-surface-variant)]">
                                                {formData.businessType || "No Type"}
                                            </div>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard
                                        icon={Phone}
                                        title="Contact & Location"
                                        description="How customers reach and find you"
                                        onClick={() => setEditingSection("contact")}
                                        {...(() => {
                                            const fields = ["email", "phone", "address", "city", "country"];
                                            const filled = fields.filter(f => formData[f]).length;
                                            return { filledCount: filled, totalFields: fields.length };
                                        })()}
                                    >
                                        <div className="flex flex-col gap-1.5 mb-2">
                                            <div className="flex items-center gap-2 text-[10px] text-[var(--color-on-surface-variant)] opacity-60">
                                                <Mail size={10} /> {formData.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-[var(--color-on-surface-variant)] opacity-60">
                                                <MapPin size={10} /> {formData.city}, {formData.country} {formData.country && COUNTRIES.find(c => c.name === formData.country)?.flag}
                                            </div>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard
                                        icon={Share2}
                                        title="Online Presence"
                                        description="Social media and web links"
                                        onClick={() => setEditingSection("presence")}
                                        {...(() => {
                                            const fields = ["website", "whatsapp", "instagram", "facebook"];
                                            const filled = [
                                                formData.website,
                                                formData.socialLinks?.whatsapp,
                                                formData.socialLinks?.instagram,
                                                formData.socialLinks?.facebook
                                            ].filter(Boolean).length;
                                            return { filledCount: filled, totalFields: fields.length };
                                        })()}
                                    >
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.website && (
                                                <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center"><Globe size={10} /></div>
                                            )}
                                            {formData.socialLinks?.whatsapp && (
                                                <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[6px]">WA</div>
                                            )}
                                            {formData.socialLinks?.instagram && (
                                                <div className="w-5 h-5 rounded-md bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold text-[6px]">IG</div>
                                            )}
                                            {formData.socialLinks?.facebook && (
                                                <div className="w-5 h-5 rounded-md bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-[6px]">FB</div>
                                            )}
                                        </div>
                                    </SummaryCard>
                                </div>
                            </>
                        )}
                        {/* TAB CONTENT: REGIONAL */}
                        {activeTab === 'regional' && (
                            <div className="space-y-4 max-w-4xl mx-auto">
                                <header className="mb-6">
                                    <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Regional & Localization</h3>
                                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">Manage your business location, currency, and display formats</p>
                                </header>
                                <SummaryCard
                                    icon={Globe}
                                    title="Business Location"
                                    description="Country and tax residency"
                                    onClick={() => setEditingSection("regional")}
                                    {...(() => {
                                        const filled = formData.country ? 1 : 0;
                                        return { filledCount: filled, totalFields: 1 };
                                    })()}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{COUNTRIES.find(c => c.name === formData.country)?.flag}</span>
                                        <span className="text-sm font-bold text-[var(--color-on-surface)]">{formData.country || "Not set"}</span>
                                    </div>
                                </SummaryCard>

                                <SummaryCard
                                    icon={Coins}
                                    title="Currency & Formatting"
                                    description="Store currency and data display"
                                    onClick={() => setEditingSection("regional")}
                                    {...(() => {
                                        const fields = ["currency", "dateFormat", "numberFormat"];
                                        const filled = fields.filter(f => formData[f]).length;
                                        return { filledCount: filled, totalFields: fields.length };
                                    })()}
                                >
                                    <div className="flex flex-col gap-1.5 mb-2">
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-on-surface-variant)] font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] opacity-40" />
                                            {CURRENCIES.find(c => c.code === formData.currency)?.name} ({formData.currency})
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-on-surface-variant)] opacity-40">
                                            <Clock size={10} /> {formData.dateFormat}
                                        </div>
                                    </div>
                                </SummaryCard>
                            </div>
                        )}

                        {/* TAB CONTENT: TAXES */}
                        {activeTab === 'taxes' && (
                            <div className="space-y-4 max-w-4xl mx-auto">
                                <header className="mb-6">
                                    <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Taxation</h3>
                                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">Configure sales tax rates for your business location</p>
                                </header>
                                <SummaryCard
                                    icon={Coins}
                                    title="Tax Configuration"
                                    description="Standard and specialized tax rates"
                                    onClick={() => setEditingSection("taxes")}
                                    {...(() => {
                                        const filled = formData.taxes?.length || 0;
                                        return { filledCount: filled, totalFields: 3 }; // Target mapping
                                    })()}
                                >
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(formData.taxes || []).length === 0 ? (
                                            <p className="text-[10px] opacity-40 italic">No tax rates configured</p>
                                        ) : (
                                            formData.taxes.map((t: any) => (
                                                <div key={t.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--color-surface-container-highest)] text-[10px] font-bold text-[var(--color-on-surface-variant)]">
                                                    {t.name} ({t.rate}%)
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </SummaryCard>
                            </div>
                        )}

                        {/* TAB CONTENT: PAYMENT METHODS */}
                        {activeTab === 'payments' && (
                            <section className="space-y-6">
                                {/* Sub-Tab Switcher */}
                                <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-xl w-fit">
                                    {[
                                        { id: 'methods', label: 'Gateways', icon: CreditCard },
                                        { id: 'payouts', label: 'Payouts Setup', icon: Landmark },
                                        { id: 'accounting', label: 'COA Mapping', icon: List },
                                        { id: 'checkout', label: 'Checkout Settings', icon: Smartphone }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setPaymentSubTab(tab.id as any)}
                                            className={cn(
                                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
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
                                                    <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Payment Channels</h3>
                                                    <HelpIcon topic="paymentMethods" />
                                                </div>
                                                <p className="text-xs font-medium text-[var(--color-on-surface-variant)] opacity-60 mt-1">
                                                    Each enabled channel auto-creates a dedicated ledger account in your Chart of Accounts.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setNewPmOpen(true)}
                                                className="flex items-center gap-2 h-12 px-5 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95 shrink-0"
                                            >
                                                <Plus size={18} /> Add Custom
                                            </button>
                                        </div>

                                        <div className="flex items-start gap-4 p-5 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                                <Landmark size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-[var(--color-on-surface)]">Automatic Finance Integration</p>
                                                <p className="text-xs text-[var(--color-on-surface-variant)] opacity-70 mt-0.5">
                                                    When an order is paid, the system posts a <strong>Debit</strong> to the matching channel account and a <strong>Credit</strong> to Accounts Receivable — fully IFRS/GAAP double-entry compliant.
                                                </p>
                                            </div>
                                        </div>

                                        {pmLoading ? (
                                            <div className="space-y-3">
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className="h-20 rounded-xl bg-[var(--color-surface-container-low)] animate-pulse" />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-10">
                                                {/* Section: Activated */}
                                                {(paymentMethods.filter(m => m.enabled).length > 0) && (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 px-1">
                                                            <div className="w-1 h-4 rounded-full bg-[var(--color-primary)]" />
                                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
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
                                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
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

                                {paymentSubTab === 'payouts' && (
                                    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[28px] p-8 shadow-[var(--shadow-m3-1)] space-y-8">
                                        <div className="flex items-start gap-4 p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                                                <Zap size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-[var(--color-on-surface)]">Automated Vendor Payouts</h3>
                                                <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70 mt-1 max-w-2xl">
                                                    Connect your Stripe or Paystack sub-account to enable automated revenue splitting.
                                                    Bized will automatically deduct the platform commission and deposit your earnings directly into your bank account.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Paystack Payouts */}
                                            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/10 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">P</div>
                                                        <h4 className="font-bold text-sm uppercase tracking-widest">Paystack Onboarding</h4>
                                                    </div>
                                                    {paymentMethods.find(m => m.gateway === 'Paystack')?.gatewayAccountId ? (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                                            <CheckCircle2 size={12} /> Connected
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                                                            Pending Setup
                                                        </span>
                                                    )}
                                                </div>

                                                {!paymentMethods.find(m => m.gateway === 'Paystack')?.gatewayAccountId ? (
                                                    <div className="space-y-4">
                                                        <p className="text-xs text-[var(--color-on-surface-variant)] opacity-60">Enter your official business bank details to receive payments via Paystack.</p>
                                                        <div className="space-y-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Bank Name</label>
                                                                <select className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 focus:border-teal-500 outline-none transition-all text-sm font-medium pr-10" id="paystack_bank">
                                                                    <option value="">Select Bank</option>
                                                                    <option value="044">Access Bank</option>
                                                                    <option value="058">Guaranty Trust Bank</option>
                                                                    <option value="232">United Bank For Africa</option>
                                                                    <option value="011">First Bank of Nigeria</option>
                                                                    <option value="033">United Bank for Africa</option>
                                                                    <option value="057">Zenith Bank</option>
                                                                    <option value="035">Wema Bank</option>
                                                                    <option value="070">Fidelity Bank</option>
                                                                    <option value="215">Unity Bank</option>
                                                                    <option value="101">Providus Bank</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Account Number</label>
                                                                <input type="text" id="paystack_acc" maxLength={10} placeholder="10-digit account number" className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 focus:border-teal-500 outline-none transition-all text-sm font-bold tracking-[0.2em]" />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                const bankCode = (document.getElementById('paystack_bank') as HTMLSelectElement).value;
                                                                const accNum = (document.getElementById('paystack_acc') as HTMLInputElement).value;
                                                                if (!bankCode || !accNum) return alert('Please provide bank details');

                                                                try {
                                                                    const res = await fetch('/api/billing/subaccount', {
                                                                        method: 'POST',
                                                                        body: JSON.stringify({
                                                                            storeId: currentBusiness?._id,
                                                                            gateway: 'Paystack',
                                                                            bankCode,
                                                                            accountNumber: accNum
                                                                        })
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.error) throw new Error(data.error);
                                                                    window.location.reload();
                                                                } catch (e: any) {
                                                                    alert(e.message);
                                                                }
                                                            }}
                                                            className="w-full h-12 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20 active:scale-95 text-xs uppercase tracking-widest"
                                                        >
                                                            Link Paystack Settlements
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 opacity-60">Connected ID</p>
                                                            <p className="text-sm font-mono font-bold text-teal-700 mt-0.5">{paymentMethods.find(m => m.gateway === 'Paystack')?.gatewayAccountId}</p>
                                                        </div>
                                                        <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-40 italic">Payouts will be automatically split and settled to your linked bank account every 24-48 hours.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stripe Payouts */}
                                            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/10 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">S</div>
                                                        <h4 className="font-bold text-sm uppercase tracking-widest">Stripe Connect</h4>
                                                    </div>
                                                    {paymentMethods.find(m => m.gateway === 'Stripe')?.gatewayAccountId ? (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                                            <CheckCircle2 size={12} /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                                                            Requires Connection
                                                        </span>
                                                    )}
                                                </div>

                                                {!paymentMethods.find(m => m.gateway === 'Stripe')?.gatewayAccountId ? (
                                                    <div className="space-y-4">
                                                        <p className="text-xs text-[var(--color-on-surface-variant)] opacity-60">Connect your Stripe account to receive instant global payouts and handle multi-currency revenue splitting.</p>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await fetch('/api/billing/subaccount', {
                                                                        method: 'POST',
                                                                        body: JSON.stringify({
                                                                            storeId: currentBusiness?._id,
                                                                            gateway: 'Stripe'
                                                                        })
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.onboardingUrl) {
                                                                        window.location.href = data.onboardingUrl;
                                                                    }
                                                                } catch (e: any) {
                                                                    alert(e.message);
                                                                }
                                                            }}
                                                            className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                                        >
                                                            <ArrowUpRight size={14} /> Connect Stripe Account
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 opacity-60">Connect ID</p>
                                                            <p className="text-sm font-mono font-bold text-blue-700 mt-0.5">{paymentMethods.find(m => m.gateway === 'Stripe')?.gatewayAccountId}</p>
                                                        </div>
                                                        <a
                                                            href="https://dashboard.stripe.com/"
                                                            target="_blank"
                                                            className="flex items-center justify-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                                                        >
                                                            Manage on Stripe Dashboard <ExternalLink size={10} />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentSubTab === 'accounting' && (
                                    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[2.5rem] p-8 shadow-[var(--shadow-m3-1)] space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                <List size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-[var(--color-on-surface)]">Chart of Accounts Mapping</h4>
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">Enabled channels auto-create Current Asset accounts in your ledger</p>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-[var(--color-outline-variant)]/10">
                                                        <th className="py-2 px-3 font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">Channel</th>
                                                        <th className="py-2 px-3 font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">COA Code</th>
                                                        <th className="py-2 px-3 font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">Account Type</th>
                                                        <th className="py-2 px-3 font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--color-outline-variant)]/5">
                                                    {paymentMethods.map(m => (
                                                        <tr key={m.id} className={cn("transition-colors", !m.enabled && "opacity-40")}>
                                                            <td className="py-3 px-3 font-bold">{m.icon} {m.name}</td>
                                                            <td className="py-3 px-3 font-mono font-bold text-[var(--color-primary)]">{m.coaCode}</td>
                                                            <td className="py-3 px-3 text-[var(--color-on-surface-variant)]">Current Asset</td>
                                                            <td className="py-3 px-3">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
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
                                    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 rounded-[28px] p-8 shadow-[var(--shadow-m3-1)] space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-[var(--color-on-surface)]">Checkout Experience</h4>
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">Control how customers interact with payments</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4">
                                            {[
                                                { id: 'saveCards', label: 'Allow customers to save cards', desc: 'Securely store card tokens for faster checkout via PCI-compliant processors.' },
                                                { id: 'stkPush', label: 'Auto-trigger STK Push', desc: 'Automatically send payment requests to mobile phones for M-Pesa / Mobile Money.' },
                                                { id: 'receipts', label: 'Send automated e-receipts', desc: 'System will email a professional billing confirmation immediately upon successful payment.' }
                                            ].map(item => (
                                                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
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
                            <div className="space-y-4 max-w-4xl mx-auto">
                                <header className="mb-6">
                                    <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Legal & Compliance</h3>
                                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">Privacy, terms of service and business declarations</p>
                                </header>
                                <SummaryCard
                                    icon={Shield}
                                    title="Store Policies"
                                    description="Privacy policy and Terms of service"
                                    onClick={() => setEditingSection("legal")}
                                    {...(() => {
                                        const fields = ["privacyPolicyUrl", "termsUrl", "footerText"];
                                        const filled = fields.filter(f => formData[f as keyof typeof formData]).length;
                                        return { filledCount: filled, totalFields: fields.length };
                                    })()}
                                >
                                    <div className="flex flex-col gap-1.5 mb-2">
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-on-surface-variant)] opacity-60">
                                            <ExternalLink size={10} /> {formData.privacyPolicyUrl ? "Privacy Policy Link Set" : "No Privacy Link"}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-on-surface-variant)] opacity-60">
                                            <ExternalLink size={10} /> {formData.termsUrl ? "Terms of Service Link Set" : "No Terms Link"}
                                        </div>
                                    </div>
                                </SummaryCard>
                            </div>
                        )}

                        {/* TAB CONTENT: AI CONFIGURATION */}
                        {activeTab === 'ai' && (
                            <div className="space-y-4 max-w-4xl mx-auto">
                                <header className="mb-6">
                                    <h3 className="text-xl font-bold text-[var(--color-on-surface)]">AI Assistant</h3>
                                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">Configure your business AI and bring your own keys</p>
                                </header>
                                <SummaryCard
                                    icon={Brain}
                                    title="AI Keys & Model"
                                    description="Primary engine and provider setup"
                                    onClick={() => setEditingSection("ai_keys")}
                                    {...(() => {
                                        const filled = formData.aiConfig?.openaiApiKey || formData.aiConfig?.googleApiKey ? 2 : 0;
                                        return { filledCount: filled, totalFields: 2 };
                                    })()}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--color-surface-container-highest)] text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                                            {formData.aiConfig?.provider || "openai"}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--color-surface-container-highest)] text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                                            {formData.aiConfig?.model || "gpt-4o-mini"}
                                        </div>
                                    </div>
                                </SummaryCard>

                                <SummaryCard
                                    icon={Sparkles}
                                    title="Agent Persona"
                                    description="Custom instructions and behavior"
                                    onClick={() => setEditingSection("ai_instructions")}
                                    {...(() => {
                                        const filled = formData.aiConfig?.systemPrompt ? 1 : 0;
                                        return { filledCount: filled, totalFields: 1 };
                                    })()}
                                >
                                    <div className="max-h-12 overflow-hidden text-[10px] text-[var(--color-on-surface-variant)] opacity-40 italic">
                                        {formData.aiConfig?.systemPrompt || "No custom instructions set"}
                                    </div>
                                </SummaryCard>
                            </div>
                        )}

                        {/* TAB CONTENT: MODULES */}
                        {activeTab === 'modules' && (
                            <div className="space-y-4 max-w-4xl mx-auto">
                                <header className="mb-6">
                                    <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Industry Modules</h3>
                                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">Enable specialized features tailored for your business industry</p>
                                </header>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.keys(MODULE_DEFINITIONS).map((moduleId) => {
                                        const module = MODULE_DEFINITIONS[moduleId as BusinessModule];
                                        const isEnabled = formData.modules?.includes(moduleId);
                                        const Icon = module.icon;
                                        return (
                                            <SummaryCard
                                                key={moduleId}
                                                icon={Icon}
                                                title={module.name}
                                                description={module.description}
                                                onClick={() => {
                                                    const currentModules = [...(formData.modules || [])];
                                                    let updatedModules;
                                                    if (isEnabled) {
                                                        updatedModules = currentModules.filter(m => m !== moduleId);
                                                    } else {
                                                        updatedModules = [...currentModules, moduleId];
                                                    }
                                                    setFormData({ ...formData, modules: updatedModules });
                                                }}
                                            >
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                                        isEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-500/10 text-zinc-500"
                                                    )}>
                                                        {isEnabled ? "Enabled" : "Disabled"}
                                                    </div>
                                                    {module.locked && (
                                                        <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                                            <Lock size={8} /> Pro
                                                        </div>
                                                    )}
                                                </div>
                                            </SummaryCard>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence >
            </div >

            {/* Sticky Mobile/Bottom Save Bar */}
            <div className="fixed bottom-0 left-0 md:left-auto right-0 md:w-[calc(100%-336px)] bg-[var(--color-surface-container-high)]/80 backdrop-blur-xl border-t border-[var(--color-outline-variant)]/10 p-4 z-20 flex justify-center">
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
                        className="h-14 px-10 rounded-[var(--radius-m3-xl)] gap-2 shadow-[var(--shadow-m3-2)] bg-[var(--color-primary)] text-[var(--color-on-primary)] min-w-[180px] font-bold tracking-widest active:scale-95"
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
            </div >


            <Sheet
                open={editingSection === "identity"}
                onClose={() => setEditingSection(null)}
                title="Edit Primary Identity"
                icon={<Building2 size={24} />}
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Store name<HelpIcon topic="storeName" /></label>
                        <input
                            type="text"
                            value={formData.name || ""}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="My Awesome Store"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Store slug</label>
                        <div className="flex items-center h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 opacity-50 cursor-not-allowed">
                            <span className="text-sm opacity-40 mr-1">bized.app/</span>
                            <span className="font-mono text-sm">{formData.slug}</span>
                        </div>
                        <p className="text-[10px] text-[var(--color-on-surface-variant)] ml-1 italic opacity-40">Slug is permanent once set</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Short bio / tagline</label>
                        <input
                            type="text"
                            value={formData.subtitle || ""}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="The best place for your needs"
                        />
                    </div>
                </div>
            </Sheet>

            <Sheet
                open={editingSection === "details"}
                onClose={() => setEditingSection(null)}
                title="Edit Business Details"
                icon={<Info size={24} />}
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] ml-1 opacity-70">Industry<HelpIcon topic="businessIndustry" /></label>
                        <input
                            type="text"
                            value={formData.industry || ""}
                            onChange={e => setFormData({ ...formData, industry: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="Retail, Food, etc."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Business type</label>
                        <input
                            type="text"
                            value={formData.businessType || ""}
                            onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="Online Shop, Local Store, etc."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">About business</label>
                        <textarea
                            value={formData.description || ""}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full min-h-[200px] p-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium resize-none shadow-inner"
                            placeholder="Tell customers more about what you do..."
                        />
                    </div>
                </div>
            </Sheet>

            <Sheet
                open={editingSection === "contact"}
                onClose={() => setEditingSection(null)}
                title="Edit Contact & Location"
                icon={<Phone size={24} />}
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Public email<HelpIcon topic="supportEmail" /></label>
                        <input
                            type="email"
                            value={formData.email || ""}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="contact@business.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Phone number<HelpIcon topic="supportPhone" /></label>
                        <input
                            type="tel"
                            value={formData.phone || ""}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="+1 234 567 890"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Physical address<HelpIcon topic="physicalAddress" /></label>
                        <input
                            type="text"
                            value={formData.address || ""}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="123 Business St, City"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">City</label>
                            <input
                                type="text"
                                value={formData.city || ""}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                                placeholder="Nairobi"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Country</label>
                            <button
                                type="button"
                                onClick={() => setIsCountryModalOpen(true)}
                                className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)] transition-all flex items-center justify-between group"
                            >
                                <span className={cn("font-medium truncate", !formData.country && "opacity-40")}>
                                    {formData.country || "Select"}
                                </span>
                                <ChevronRight size={18} className="text-[var(--color-on-surface-variant)] opacity-40 group-hover:text-[var(--color-primary)] transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
            </Sheet>

            <Sheet
                open={editingSection === "presence"}
                onClose={() => setEditingSection(null)}
                title="Edit Online Presence"
                icon={<Share2 size={24} />}
            >
                <div className="space-y-8 pt-4">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Communication</label>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all" size={20} />
                                <input
                                    type="url"
                                    value={formData.website || ""}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full h-16 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-emerald-500 rounded-lg text-white font-bold text-[10px]">WA</div>
                                <input
                                    type="text"
                                    value={formData.socialLinks?.whatsapp || ""}
                                    onChange={e => setFormData({
                                        ...formData,
                                        socialLinks: { ...(formData.socialLinks || {}), whatsapp: e.target.value }
                                    })}
                                    placeholder="WhatsApp number"
                                    className="w-full h-16 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Social Profiles</label>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 rounded-lg text-white font-bold text-[10px]">IG</div>
                                <input
                                    type="text"
                                    value={formData.socialLinks?.instagram || ""}
                                    onChange={e => setFormData({
                                        ...formData,
                                        socialLinks: { ...(formData.socialLinks || {}), instagram: e.target.value }
                                    })}
                                    placeholder="Instagram username"
                                    className="w-full h-16 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-blue-600 rounded-lg text-white font-bold text-[10px]">FB</div>
                                <input
                                    type="text"
                                    value={formData.socialLinks?.facebook || ""}
                                    onChange={e => setFormData({
                                        ...formData,
                                        socialLinks: { ...(formData.socialLinks || {}), facebook: e.target.value }
                                    })}
                                    placeholder="Facebook page URL"
                                    className="w-full h-16 pl-12 pr-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Sheet>

            <Sheet
                open={editingSection === "regional"}
                onClose={() => setEditingSection(null)}
                title="Edit Regional Settings"
                icon={<Globe size={24} />}
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Base country</label>
                        <button
                            onClick={() => setIsCountryModalOpen(true)}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)] transition-all flex items-center justify-between group"
                        >
                            <span className="font-bold">{formData.country || "Select country"}</span>
                            <ChevronRight size={18} className="opacity-40" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Store currency</label>
                        <button
                            onClick={() => setIsCurrencyModalOpen(true)}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)] transition-all flex items-center justify-between group"
                        >
                            <span className="font-bold">{formData.currency || "Select currency"}</span>
                            <ChevronRight size={18} className="opacity-40" />
                        </button>
                    </div>
                </div>
            </Sheet>

            <Sheet
                open={editingSection === "legal"}
                onClose={() => setEditingSection(null)}
                title="Edit Legal Policies"
                icon={<Shield size={24} />}
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Privacy policy URL</label>
                        <input
                            type="url"
                            value={formData.privacyPolicyUrl || ""}
                            onChange={e => setFormData({ ...formData, privacyPolicyUrl: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Terms of service URL</label>
                        <input
                            type="url"
                            value={formData.termsUrl || ""}
                            onChange={e => setFormData({ ...formData, termsUrl: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1 opacity-60">Footer copyright text</label>
                        <input
                            type="text"
                            value={formData.footerText || ""}
                            onChange={e => setFormData({ ...formData, footerText: e.target.value })}
                            className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium"
                            placeholder={`© ${new Date().getFullYear()} ${formData.name}. All rights reserved.`}
                        />
                    </div>
                </div>
            </Sheet>

            <Sheet
                open={editingSection === "ai_keys"}
                onClose={() => setEditingSection(null)}
                title="AI Keys & Model"
                icon={<Brain size={24} />}
            >
                <div className="space-y-6 pt-4">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                        <p className="font-bold flex items-center gap-2 mb-1"><Shield size={16} /> Bring Your Own Key</p>
                        <p className="opacity-80">Keys are encrypted and stored securely.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex p-1.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
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
                                        "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                                        (formData.aiConfig?.provider || 'openai') === provider
                                            ? "bg-white text-[var(--color-primary)] shadow-sm"
                                            : "text-[var(--color-on-surface-variant)] opacity-40 hover:opacity-100"
                                    )}
                                >
                                    {provider === 'openai' ? 'OpenAI' : 'Google Gemini'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">
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
                                className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] font-mono text-sm"
                                placeholder={(formData.aiConfig?.provider || 'openai') === 'openai' ? "sk-..." : "AIza..."}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Model selector</label>
                            <select
                                value={formData.aiConfig?.model || ((formData.aiConfig?.provider || 'openai') === 'google' ? "gemini-1.5-flash" : "gpt-4o-mini")}
                                onChange={e => setFormData({
                                    ...formData,
                                    aiConfig: { ...(formData.aiConfig || {}), model: e.target.value }
                                })}
                                className="w-full h-14 px-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 outline-none font-bold"
                            >
                                {(formData.aiConfig?.provider || 'openai') === 'openai' ? (
                                    <>
                                        <option value="gpt-4o">GPT-4o (Strongest)</option>
                                        <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                </div>
            </Sheet>

            <Sheet
                open={editingSection === "ai_instructions"}
                onClose={() => setEditingSection(null)}
                title="Agent Persona"
                icon={<Sparkles size={24} />}
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">System instructions</label>
                        <textarea
                            value={formData.aiConfig?.systemPrompt || ""}
                            onChange={e => setFormData({
                                ...formData,
                                aiConfig: { ...(formData.aiConfig || {}), systemPrompt: e.target.value }
                            })}
                            className="w-full min-h-[300px] p-5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all font-medium resize-none text-sm"
                            placeholder="Define how your AI Assistant should behave..."
                        />
                    </div>
                </div>
            </Sheet>

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
                        <div className="space-y-3 bg-[var(--color-surface-container-low)] p-4 rounded-xl border border-[var(--color-outline-variant)]/10">
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
                            <span className="text-[10px] font-bold uppercase tracking-widest">v1.2.x SECURE</span>
                        </div>
                        <Button
                            onClick={handlePmEditSave}
                            disabled={pmSaving}
                            className={cn(
                                "w-full h-14 rounded-xl font-bold uppercase tracking-widest transition-all shadow-xl active:scale-95",
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
                                        pmEditForm.gateway?.toLowerCase() === "adyen" ? "bg-[#0abf53]/5 border-[#0abf53]/20" :
                                            pmEditForm.gateway?.toLowerCase() === "paypal" ? "bg-[#003087]/5 border-[#003087]/20" :
                                                "bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]/20"
                    )}>
                        <div className={cn(
                            "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500",
                            pmEditForm.gateway?.toLowerCase() === "stripe" ? "bg-white text-[#635bff]" :
                                pmEditForm.gateway?.toLowerCase() === "paystack" ? "bg-white text-[#0ba4db]" :
                                    pmEditForm.gateway?.toLowerCase() === "m-pesa" ? "bg-white text-[#49ab21]" :
                                        pmEditForm.gateway?.toLowerCase() === "dpo" ? "bg-white text-[#004a8f]" :
                                            pmEditForm.gateway?.toLowerCase() === "adyen" ? "bg-white text-[#0abf53]" :
                                                pmEditForm.gateway?.toLowerCase() === "paypal" ? "bg-white text-[#003087]" :
                                                    "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                        )}>
                            {pmEditForm.gateway?.toLowerCase() === "stripe" ? <CreditCard size={40} /> :
                                pmEditForm.gateway?.toLowerCase() === "m-pesa" ? <Smartphone size={40} /> :
                                    pmEditForm.gateway?.toLowerCase() === "paypal" ? <div className="text-3xl font-bold italic">PP</div> :
                                        <Settings size={40} />}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight text-[var(--color-on-surface)]">
                                {pmEditForm.gateway === "Stripe" ? "Stripe Global" :
                                    pmEditForm.gateway === "Paystack" ? "Paystack Africa" :
                                        pmEditForm.gateway === "M-Pesa" ? "M-Pesa Express" :
                                            pmEditForm.gateway === "DPO" ? "DPO Central" :
                                                pmEditForm.gateway === "Adyen" ? "Adyen Global" :
                                                    pmEditForm.gateway === "PayPal" ? "PayPal Global" :
                                                        "Standard Ledger Channel"}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] opacity-60">Verified Gateway</span>
                                <div className="w-1 h-3 rounded-full bg-[var(--color-outline-variant)]/30" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Store: {currentBusiness?._id?.slice(-8)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Gateway Input (Legacy or Free-form) */}
                        {!editingPm?.gateway && (
                            <div className="space-y-3 px-1">
                                <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 ml-1">Payment Provider Backend</label>
                                <input
                                    type="text"
                                    value={pmEditForm.gateway}
                                    onChange={e => setPmEditForm({ ...pmEditForm, gateway: e.target.value })}
                                    placeholder="e.g. Stripe, Paystack, M-Pesa, DPO"
                                    className="w-full h-16 px-6 rounded-xl bg-[var(--color-surface-container-low)] border-2 border-transparent focus:border-[var(--color-primary)] outline-none transition-all font-bold text-lg shadow-sm"
                                />
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Platform Onboarding Section */}
                            {["stripe", "paystack", "paypal", "adyen"].includes(pmEditForm.gateway?.toLowerCase() || "") && (
                                <div className="bg-indigo-500/5 p-8 rounded-[2rem] border-2 border-indigo-500/20 space-y-5 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                                            <Zap size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-100 italic">One-Click Setup</h4>
                                            <p className="text-[10px] opacity-60 font-medium">Recommended for automated commission splitting.</p>
                                        </div>
                                    </div>

                                    {pmEditForm.gateway?.toLowerCase() === "paystack" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-bold uppercase tracking-widest opacity-40 ml-2">Bank Code</label>
                                                <input
                                                    id="paystack-bank-code"
                                                    placeholder="058 (GTBank)"
                                                    className="w-full h-12 px-4 rounded-xl bg-white border border-indigo-500/10 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-bold uppercase tracking-widest opacity-40 ml-2">Account No.</label>
                                                <input
                                                    id="paystack-account-number"
                                                    placeholder="0123456789"
                                                    className="w-full h-12 px-4 rounded-xl bg-white border border-indigo-500/10 text-xs"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => {
                                            let url = "";
                                            if (pmEditForm.gateway?.toLowerCase() === "paystack") {
                                                const bc = (document.getElementById('paystack-bank-code') as HTMLInputElement)?.value;
                                                const an = (document.getElementById('paystack-account-number') as HTMLInputElement)?.value;
                                                url = `&bankCode=${bc}&accountNumber=${an}&businessName=${currentBusiness?.name || 'Bized Store'}`;
                                            }
                                            handleConnectGateway(pmEditForm.gateway || "", url);
                                        }}
                                        className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                                    >
                                        Connect {pmEditForm.gateway} Account
                                    </Button>
                                    <div className="flex items-center gap-2 justify-center">
                                        <div className="h-[1px] flex-1 bg-indigo-500/10" />
                                        <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">OR MANUAL SETUP BELOW</span>
                                        <div className="h-[1px] flex-1 bg-indigo-500/10" />
                                    </div>
                                </div>
                            )}

                            {/* Security Section */}
                            <div className="bg-[var(--color-surface-container-low)]/50 p-6 rounded-[2rem] border border-[var(--color-outline-variant)]/10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        <Shield size={16} />
                                    </div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60">Security Credentials</h4>
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
                                            className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
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
                                                className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Options & Operations */}
                            {(pmEditForm.gateway === "Stripe" || pmEditForm.gateway === "Paystack" || pmEditForm.gateway === "M-Pesa" || pmEditForm.gateway === "DPO" || pmEditForm.gateway === "Adyen" || pmEditForm.gateway === "PayPal") && (
                                <div className="bg-[var(--color-surface-container-low)]/50 p-6 rounded-[2rem] border border-[var(--color-outline-variant)]/10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                            <Layers size={16} />
                                        </div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60">Operations & Environment</h4>
                                    </div>
                                    <div className="space-y-5">
                                        {pmEditForm.gateway === "M-Pesa" && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">STK Passkey</label>
                                                <input
                                                    type="password"
                                                    value={pmSettings.passkey || ""}
                                                    onChange={e => setPmSettings({ ...pmSettings, passkey: e.target.value })}
                                                    className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
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
                                                    className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 shadow-sm outline-none focus:border-[var(--color-primary)] transition-all font-bold"
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
                                                    className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
                                                />
                                            </div>
                                        )}

                                        {pmEditForm.gateway === "Adyen" && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Merchant Account</label>
                                                    <input
                                                        type="text"
                                                        value={pmSettings.merchantAccount || ""}
                                                        onChange={e => setPmSettings({ ...pmSettings, merchantAccount: e.target.value })}
                                                        placeholder="YourAdyenAccount"
                                                        className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 shadow-sm outline-none focus:border-[var(--color-primary)] transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Webhook HMAC Key</label>
                                                    <input
                                                        type="password"
                                                        value={pmEditForm.webhookSecret}
                                                        onChange={e => setPmEditForm({ ...pmEditForm, webhookSecret: e.target.value })}
                                                        placeholder="ADYEN_HMAC_KEY"
                                                        className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {pmEditForm.gateway === "PayPal" && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Client ID</label>
                                                    <input
                                                        type="text"
                                                        value={pmSettings.clientId || ""}
                                                        onChange={e => setPmSettings({ ...pmSettings, clientId: e.target.value })}
                                                        placeholder="PayPal Client ID"
                                                        className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 shadow-sm outline-none focus:border-[var(--color-primary)] transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Client Secret</label>
                                                    <input
                                                        type="password"
                                                        value={pmEditForm.apiKey}
                                                        onChange={e => setPmEditForm({ ...pmEditForm, apiKey: e.target.value })}
                                                        placeholder="PayPal Client Secret"
                                                        className="w-full h-14 px-6 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-mono text-sm tracking-widest"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Operating Environment</label>
                                            <div className="flex p-2 bg-[var(--color-surface-container-highest)]/20 rounded-[1.25rem] border border-[var(--color-outline-variant)]/10">
                                                <button
                                                    onClick={() => setPmSettings({ ...pmSettings, mode: "sandbox" })}
                                                    className={cn(
                                                        "flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                                        pmSettings.mode !== "production" ? "bg-white shadow-xl text-black scale-100" : "opacity-40 hover:opacity-100 scale-95"
                                                    )}
                                                >
                                                    Sandbox
                                                </button>
                                                <button
                                                    onClick={() => setPmSettings({ ...pmSettings, mode: "production" })}
                                                    className={cn(
                                                        "flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
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
                                        className="w-full h-16 px-6 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-bold text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-2">Finance Ledger (COA)</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={pmEditForm.coaCode}
                                            onChange={e => setPmEditForm({ ...pmEditForm, coaCode: e.target.value })}
                                            className="w-full h-16 px-6 rounded-xl bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/20 outline-none text-[var(--color-primary)] font-bold text-2xl tracking-tighter"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white py-1.5 px-3 rounded-lg text-[8px] font-bold uppercase tracking-widest">Connected</div>
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
                        className="w-full h-14 rounded-xl font-bold uppercase tracking-widest bg-[var(--color-primary)] text-white transition-all shadow-xl active:scale-95"
                    >
                        {pmSaving ? <Loader2 className="animate-spin" /> : "Deploy Channel"}
                    </Button>
                }
            >
                <div className="space-y-8 py-2">
                    <div className="bg-[var(--color-surface-container-low)] p-6 rounded-[2rem] border border-[var(--color-outline-variant)]/10 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Channel Branding</label>
                            <input
                                type="text"
                                value={newPmForm.name}
                                onChange={e => setNewPmForm({ ...newPmForm, name: e.target.value })}
                                placeholder="e.g. USDT Gateway"
                                className="w-full h-14 px-5 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-2">Market Asset Type</label>
                                <select
                                    value={newPmForm.type}
                                    onChange={e => setNewPmForm({ ...newPmForm, type: e.target.value as any })}
                                    className="w-full h-14 px-5 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-bold appearance-none"
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
                                    className="w-full h-14 px-5 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 outline-none text-[var(--color-primary)] font-bold text-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Infrastructure Hub</label>
                            <input
                                placeholder="Stripe, Paystack, M-Pesa..."
                                className="w-full h-14 px-5 rounded-xl bg-white/50 border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-bold"
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
