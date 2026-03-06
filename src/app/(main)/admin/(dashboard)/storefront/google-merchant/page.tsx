"use client";

import React, { useState, useEffect } from "react";
import {
    ShoppingBag,
    Check,
    Loader2,
    Hash,
    ExternalLink,
    AlertCircle,
    Trash2,
    Sparkles,
    Zap,
    RefreshCw,
    Settings,
    ChevronRight,
    Globe,
    Copy,
    Share2,
    Star,
    Layout,
    Key,
    User,
    Plus,
    Truck,
    Undo2,
    HelpCircle,
    ArrowRight,
    Lightbulb,
    Search,
    X,
    ShieldAlert,
    Info,
    Terminal,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const SyncIndicator = ({ lastSynced, isSyncing, onSync }: { lastSynced?: string, isSyncing: boolean, onSync: () => void }) => (
    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md border border-[var(--color-outline-variant)]/10 px-4 py-2 rounded-2xl shadow-sm">
        <div className="flex flex-col">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Google Cloud Sync</div>
            <div className="text-[10px] font-bold text-[var(--color-on-surface)]">
                {isSyncing ? (
                    <span className="flex items-center gap-1.5 text-blue-600">
                        <Loader2 size={10} className="animate-spin" /> Synchronizing...
                    </span>
                ) : lastSynced ? (
                    <span className="text-emerald-600">Last synced: {lastSynced}</span>
                ) : (
                    <span className="text-amber-600">Never synced</span>
                )}
            </div>
        </div>
        <div className="h-4 w-px bg-[var(--color-outline-variant)]/20 mx-1" />
        <Button
            onClick={onSync}
            disabled={isSyncing}
            variant="text"
            size="sm"
            className="h-8 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] transition-all transform active:scale-95"
        >
            {isSyncing ? "Wait" : "Sync Now"}
        </Button>
    </div>
);

const ErrorModal = ({ message, onClose, onHelp }: { message: string, onClose: () => void, onHelp?: (section: string) => void }) => {
    const [expanded, setExpanded] = React.useState(false);

    // Detect if this is an API enablement error
    const isApiError = message.toLowerCase().includes("content api") || message.toLowerCase().includes("disabled") || message.toLowerCase().includes("not been used");

    return (
        <AnimatePresence>
            {message && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/40"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden border border-zinc-100"
                    >
                        {/* Status Bar */}
                        <div className="h-1.5 w-full bg-red-500/20">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-red-500"
                            />
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full scale-150" />
                                    <div className="relative w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                                        <ShieldAlert size={40} strokeWidth={2} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black tracking-tight text-zinc-900 italic uppercase underline decoration-red-500/30 decoration-8 underline-offset-[-2px]">
                                        {isApiError ? "API Needs Enabling" : "Action Required"}
                                    </h3>
                                    <p className="text-zinc-500 font-medium text-sm px-4">
                                        {isApiError
                                            ? "Your Google Cloud Project needs permission to talk to the Merchant Center."
                                            : "We encountered a configuration hurdle while connecting to Google."}
                                    </p>
                                </div>
                            </div>

                            {/* Error Content */}
                            <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <Terminal size={14} className="text-zinc-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-xs font-mono font-medium text-zinc-600 leading-relaxed overflow-hidden",
                                            !expanded && "line-clamp-3"
                                        )}>
                                            {message}
                                        </p>
                                        {message.length > 100 && (
                                            <button
                                                onClick={() => setExpanded(!expanded)}
                                                className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                                            >
                                                {expanded ? "Show Less" : "Read Full Log"}
                                                <ChevronDown size={10} className={cn("transition-transform", expanded && "rotate-180")} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {isApiError && onHelp && (
                                    <Button
                                        onClick={() => {
                                            onHelp("api-enable");
                                            onClose();
                                        }}
                                        variant="outline"
                                        className="flex-1 h-14 rounded-2xl border-emerald-200 text-emerald-600 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 gap-2"
                                    >
                                        <Lightbulb size={14} /> Guide Me
                                    </Button>
                                )}
                                <Button
                                    onClick={onClose}
                                    className={cn("h-14 rounded-2xl bg-zinc-900 text-white font-black text-sm hover:bg-black transition-all shadow-xl shadow-zinc-950/20", isApiError ? "flex-1" : "w-full")}
                                >
                                    Dismiss
                                </Button>
                            </div>

                            {!isApiError && (
                                <p className="text-center text-[10px] text-zinc-400 font-medium italic">
                                    Tip: Ensure the <span className="text-zinc-600 font-bold">Content API for Shopping</span> is active in your Google Cloud Console.
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <AnimatePresence>
        {message && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-emerald-950/20"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl shadow-emerald-500/10 overflow-hidden border border-emerald-50"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                            <div className="relative w-24 h-24 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                                <Check size={48} strokeWidth={3} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic tracking-tighter text-zinc-900">Synchronized!</h3>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed px-4">
                                {message}
                            </p>
                        </div>

                        <Button
                            onClick={onClose}
                            className="w-full h-16 rounded-[1.5rem] bg-zinc-900 text-white font-black text-base hover:bg-black transition-all shadow-xl shadow-zinc-950/20 group"
                        >
                            Continue <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default function MerchantCenterPage() {
    const { currentBusiness, updateBusiness, isLoading: isContextLoading } = useBusiness();
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("identity");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Merchant Module State
    const [merchantStats, setMerchantStats] = useState({ total: 0, approved: 0, issues: 0 });
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isSyncingMerchant, setIsSyncingMerchant] = useState(false);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [discoveredAccounts, setDiscoveredAccounts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        googleMerchantId: "",
    });

    const [settings, setSettings] = useState({
        autoSyncInventory: true,
        autoPushProducts: true,
        syncReviews: false,
        remarketingPixel: true,
    });

    const [showHelp, setShowHelp] = useState(false);
    const [helpSection, setHelpSection] = useState<string>("general");

    const [policies, setPolicies] = useState({
        shipping: {
            handlingTime: 1, transitTime: 3, flatRate: 0, freeShippingOver: 1000, provider: ""
        },
        returns: {
            days: 30, policyUrl: "", restockingFee: 0
        }
    });

    const [gmcProducts, setGmcProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        if (currentBusiness) {
            setFormData({
                googleMerchantId: currentBusiness.socialLinks?.googleMerchantId || "",
            });

            if (currentBusiness.socialLinks?.googleMerchantSettings) {
                setSettings({
                    autoSyncInventory: currentBusiness.socialLinks.googleMerchantSettings.autoSyncInventory ?? true,
                    autoPushProducts: currentBusiness.socialLinks.googleMerchantSettings.autoPushProducts ?? true,
                    syncReviews: currentBusiness.socialLinks.googleMerchantSettings.syncReviews ?? false,
                    remarketingPixel: currentBusiness.socialLinks.googleMerchantSettings.remarketingPixel ?? true,
                });
            }

            if (currentBusiness.socialLinks?.googleMerchantPolicies) {
                setPolicies(prev => ({
                    ...prev,
                    shipping: { ...prev.shipping, ...currentBusiness.socialLinks?.googleMerchantPolicies?.shipping },
                    returns: { ...prev.returns, ...currentBusiness.socialLinks?.googleMerchantPolicies?.returns },
                }));
            }

            if (currentBusiness.socialLinks?.googleMerchantId) {
                fetchMerchantStats();
                fetchGmcProducts();
            }
        }
    }, [currentBusiness]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, []);

    const handleSave = async () => {
        if (!currentBusiness) return;
        setIsSaving(true);
        const success = await updateBusiness({
            socialLinks: {
                ...currentBusiness.socialLinks,
                googleMerchantId: formData.googleMerchantId
            }
        });

        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            fetchMerchantStats();
        }
        setIsSaving(false);
    };

    const handleDiscoverAccounts = async () => {
        if (!currentBusiness) return;
        setIsDiscovering(true);
        try {
            const res = await fetch(`/api/stores/${currentBusiness._id}/google/merchant/accounts`);
            const data = await res.json();
            if (data.success) {
                setDiscoveredAccounts(data.accounts || []);
                if (data.accounts?.length === 1) {
                    setFormData({ ...formData, googleMerchantId: data.accounts[0].id });
                    setSuccessMessage(`Auto-detected: ${data.accounts[0].name}`);
                } else if (data.accounts?.length === 0) {
                    setDiscoveredAccounts([]);
                    setError("No Merchant Center accounts found. Please create one at merchants.google.com first.");
                }
            } else {
                setError(data.error || "Failed to discover accounts");
            }
        } catch (error) {
            setError("Something went wrong during account discovery.");
        } finally {
            setIsDiscovering(false);
        }
    };

    const fetchMerchantStats = async () => {
        if (!currentBusiness || !formData.googleMerchantId) return;
        setIsLoadingStats(true);
        try {
            const res = await fetch(`/api/stores/${currentBusiness._id}/google/merchant/status`);
            const data = await res.json();
            if (res.ok && data.stats) {
                setMerchantStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to fetch merchant stats:", err);
        } finally {
            setIsLoadingStats(false);
        }
    };

    const fetchGmcProducts = async () => {
        if (!currentBusiness || !formData.googleMerchantId) return;
        setIsLoadingProducts(true);
        try {
            const res = await fetch(`/api/stores/${currentBusiness._id}/google/merchant/products`);
            const data = await res.json();
            if (res.ok && data.products) {
                setGmcProducts(data.products);
            }
        } catch (err) {
            console.error("Failed to fetch GMC products:", err);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleSavePoliciesAndSettings = async () => {
        if (!currentBusiness) return;
        setIsSaving(true);
        const success = await updateBusiness({
            socialLinks: {
                ...currentBusiness.socialLinks,
                googleMerchantSettings: settings,
                googleMerchantPolicies: policies
            }
        });

        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            setSuccessMessage("Configuration saved successfully!");
        } else {
            setError("Failed to save configuration.");
        }
        setIsSaving(false);
    };

    const handleSaveMerchantId = async () => {
        if (!currentBusiness) return;
        setIsSaving(true);
        const success = await updateBusiness({
            socialLinks: {
                ...currentBusiness.socialLinks,
                googleMerchantId: formData.googleMerchantId
            }
        });

        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            fetchMerchantStats();
            fetchGmcProducts();
        } else {
            setError("Failed to save Merchant ID.");
        }
        setIsSaving(false);
    };

    const handleMerchantSync = async () => {
        if (!currentBusiness) return;
        if (!formData.googleMerchantId) {
            setError("Please save your Merchant ID before syncing.");
            return;
        }

        setIsSyncingMerchant(true);
        try {
            const res = await fetch(`/api/stores/${currentBusiness._id}/google/merchant/sync`, {
                method: 'POST'
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to sync with Merchant Center');
            } else {
                setSuccessMessage(data.message || "Merchant sync successful!");
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                fetchMerchantStats();
            }
        } catch (error) {
            console.error("Merchant sync failed:", error);
            setError("A network error occurred during merchant sync.");
        } finally {
            setIsSyncingMerchant(false);
        }
    };

    const handleConnectGoogle = async (loginHint?: string) => {
        if (!currentBusiness) return;

        try {
            const url = loginHint
                ? `/api/stores/${currentBusiness._id}/google/auth?login_hint=${encodeURIComponent(loginHint)}`
                : `/api/stores/${currentBusiness._id}/google/auth`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError("Failed to initiate Google connection.");
            }
        } catch (error) {
            console.error("Auth initiation failed:", error);
            setError("Connection error.");
        }
    };

    if (isContextLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
            </div>
        );
    }

    if (!currentBusiness) return null;

    const tabs = [
        { id: "identity", label: "Connection & Setup", icon: Layout, description: "Link accounts & automation" },
        { id: "sync", label: "Sync & Feed", icon: RefreshCw, description: "Manage catalogs and schedules" },
        { id: "products", label: "Product Catalog", icon: ShoppingBag, description: "View live GMC statuses" },
        { id: "shipping", label: "Shipping", icon: Truck, description: "Configure regional policies" },
        { id: "returns", label: "Returns", icon: Undo2, description: "Manage return policies" },
        { id: "analytics", label: "Ads Analytics", icon: Star, description: "Track Shopping performance" },
    ];

    const activePage = tabs.find(t => t.id === activeTab) || tabs[0];

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--color-surface-container-lowest)]">
            {/* Left Panel - Tabs (Sidebar) */}
            <div className="w-80 border-r border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)] flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-[var(--color-outline-variant)]/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <ShoppingBag size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[var(--color-on-surface)] leading-none italic tracking-tight">Google Merchant</h1>
                            <p className="text-[10px] uppercase font-black text-[var(--color-on-surface-variant)] opacity-40 mt-1 tracking-widest">Shopping Module</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group",
                                    activeTab === tab.id
                                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-sm"
                                        : "hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors shadow-sm",
                                        activeTab === tab.id
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] group-hover:bg-[var(--color-surface-container-highest)]"
                                    )}>
                                        <tab.icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-[13px] truncate leading-tight tracking-tight">{tab.label}</div>
                                        <div className={cn("text-[10px] truncate max-w-[140px]", activeTab === tab.id ? "opacity-70" : "opacity-40")}>{tab.description}</div>
                                    </div>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={14} className="flex-shrink-0 animate-in slide-in-from-left-2" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-[var(--color-outline-variant)]/10">
                    <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-low)]">
                        <Settings size={14} className="opacity-50" />
                        <span className="text-xs font-bold">Advanced Settings</span>
                    </Button>
                </div>
            </div>

            {/* Center Panel - Content Editor */}
            <div className="flex-1 overflow-y-auto bg-[var(--color-surface-container-low)]/50 scrollbar-thin">
                <ErrorModal
                    message={error || ""}
                    onClose={() => setError(null)}
                    onHelp={(section) => {
                        setHelpSection(section);
                        setShowHelp(true);
                    }}
                />
                <SuccessModal message={successMessage || ""} onClose={() => setSuccessMessage(null)} />

                {/* HELP SHEET (Side for Web / Bottom for Mobile) */}
                <AnimatePresence>
                    {showHelp && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowHelp(false)}
                                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
                            />
                            <motion.div
                                initial={{ x: '100%', y: 0 }}
                                animate={{ x: 0, y: 0 }}
                                exit={{ x: '100%', y: 0 }}
                                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                className={cn(
                                    "fixed z-[101] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col",
                                    "bottom-0 right-0 w-full h-[85vh] rounded-t-[3rem]", // Mobile
                                    "md:top-0 md:h-full md:w-[450px] md:rounded-l-[3rem] md:rounded-tr-none" // Desktop
                                )}
                            >
                                <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-100/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                            <Lightbulb size={24} />
                                        </div>
                                        <div>
                                            <h5 className="text-xl font-black italic tracking-tight text-emerald-900 leading-none">
                                                {helpSection === "api-enable" ? "API Setup Guide" : "Setup Guide"}
                                            </h5>
                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">
                                                {helpSection === "api-enable" ? "Permissions & APIs" : "Merchant Center ID"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowHelp(false)}
                                        className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-none">
                                    {helpSection === "api-enable" ? (
                                        <div className="space-y-10">
                                            <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 space-y-3">
                                                <div className="flex items-center gap-2 text-amber-900 font-black italic">
                                                    <ShieldAlert size={18} /> Why this is needed
                                                </div>
                                                <p className="text-xs text-amber-900/60 leading-relaxed">
                                                    Bized uses Google's official <strong>Content API for Shopping</strong> to sync your products. By default, this API is disabled in new Google Cloud projects.
                                                </p>
                                            </div>

                                            <div className="space-y-8">
                                                {[
                                                    {
                                                        step: '01',
                                                        title: 'Access Google Cloud Console',
                                                        desc: 'Open the Google Cloud Console for the project used in Bized settings.',
                                                        link: 'https://console.cloud.google.com/apis/library/shoppingcontent.googleapis.com'
                                                    },
                                                    {
                                                        step: '02',
                                                        title: 'Enable the Content API',
                                                        desc: 'Click the "ENABLE" button on the Content API for Shopping library page. This allows Bized to send product data to your Merchant Center.'
                                                    },
                                                    {
                                                        step: '03',
                                                        title: 'Wait & Retry',
                                                        desc: 'Google takes about 1-2 minutes to propagate this change. Once enabled, return to Bized and click "Sync Now".'
                                                    }
                                                ].map((item, idx) => (
                                                    <div key={item.step} className="flex gap-6 group">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                                                {item.step}
                                                            </div>
                                                            {idx !== 2 && <div className="w-0.5 flex-1 bg-emerald-50 my-2" />}
                                                        </div>
                                                        <div className="space-y-2 pb-4 text-left">
                                                            <h6 className="font-bold text-gray-900 leading-none">{item.title}</h6>
                                                            <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                                                            {item.link && (
                                                                <a href={item.link} target="_blank" className="inline-flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                                                                    Enable API Now <ExternalLink size={10} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                onClick={() => setHelpSection("general")}
                                                variant="outline"
                                                className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                                            >
                                                <ArrowRight size={14} className="rotate-180" /> Back to ID Guide
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {[
                                                {
                                                    step: '01',
                                                    title: 'Open Merchant Center',
                                                    desc: 'Go to merchants.google.com and sign in with the account you used for authorization.',
                                                    icon: Globe,
                                                    link: 'https://merchants.google.com'
                                                },
                                                {
                                                    step: '02',
                                                    title: 'Locate Your Account ID',
                                                    desc: 'Look at the top-right corner of your screen. Your Merchant Center ID is the 9-10 digit number next to your business name.',
                                                    icon: Search
                                                },
                                                {
                                                    step: '03',
                                                    title: 'Enter ID in Bized',
                                                    desc: 'Copy that number and paste it into the field on the left. This allows Bized to push your products automatically.',
                                                    icon: Hash
                                                }
                                            ].map((item, idx) => (
                                                <div key={item.step} className="flex gap-6 group">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                                            {item.step}
                                                        </div>
                                                        {idx !== 2 && <div className="w-0.5 flex-1 bg-emerald-50 my-2" />}
                                                    </div>
                                                    <div className="space-y-2 pb-4 text-left">
                                                        <h6 className="font-bold text-gray-900 leading-none">{item.title}</h6>
                                                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                                                        {item.link && (
                                                            <a href={item.link} target="_blank" className="inline-flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                                                                Go to GMC <ExternalLink size={10} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="p-6 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-emerald-900 text-sm">Need help?</h4>
                                            <p className="text-xs text-emerald-800/60 mt-1 leading-relaxed">
                                                Our team can walk you through the setup. Click the chat icon in the bottom right for live support.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 pt-4">
                                    <a
                                        href="https://support.google.com/merchants/answer/188484"
                                        target="_blank"
                                        className="flex items-center justify-between p-4 px-6 rounded-2xl bg-black text-white font-black text-xs hover:bg-neutral-800 transition-all uppercase tracking-widest shadow-xl shadow-black/10"
                                    >
                                        Help Center <ArrowRight size={16} />
                                    </a>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="max-w-3xl mx-auto p-12 pb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <h2 className="text-3xl font-black tracking-tighter text-[var(--color-on-surface)] mb-2 italic">{activePage?.label}</h2>
                        <p className="text-[var(--color-on-surface-variant)] opacity-60 font-medium">{activePage?.description}</p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {activeTab === "identity" && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-8">
                                    <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                        {!currentBusiness.socialLinks?.googleConnected ? (
                                            /* STEP 1: UNAUTHORIZED STATE */
                                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20">
                                                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                                                        <ShoppingBag size={150} />
                                                    </div>
                                                    <div className="relative z-10 space-y-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                            <Key size={32} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-3xl font-black italic tracking-tighter mb-2">Authorize GMC Access</h4>
                                                            <p className="text-emerald-50 font-medium leading-relaxed max-w-md">
                                                                To sync store inventory automatically with Google Merchant Center, you need to authorize Bized.
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col gap-6 w-full">
                                                            {session?.user?.email && (
                                                                <div className="space-y-4">
                                                                    <button
                                                                        onClick={() => handleConnectGoogle(session.user?.email as string)}
                                                                        className="flex items-center w-full bg-[#1a73e8] rounded-xl overflow-hidden border border-[#1a73e8] hover:bg-[#185abc] transition-all shadow-xl group active:scale-[0.98] text-left"
                                                                    >
                                                                        <div className="p-3">
                                                                            <div className="w-10 h-10 rounded-full bg-[#004e89] flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 border border-white/10">
                                                                                {session.user.image ? (
                                                                                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    session.user.name?.charAt(0)
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex-1 text-left py-2 px-1">
                                                                            <p className="text-white font-bold text-[13px] leading-tight">Sign in as {session.user.name?.split(' ')[0] || 'User'}</p>
                                                                            <p className="text-white/70 text-[11px] leading-tight truncate max-w-[200px]">{session.user.email}</p>
                                                                        </div>

                                                                        <div className="bg-white p-3 h-14 w-14 flex items-center justify-center border-l border-[#1a73e8]">
                                                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                                                                            </svg>
                                                                        </div>
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <Button
                                                                onClick={() => handleConnectGoogle()}
                                                                variant="outline"
                                                                className="h-14 w-full rounded-2xl bg-white/10 backdrop-blur-md text-white border-white/20 font-black text-xs gap-3 shadow-xl hover:bg-white/20 transition-all active:scale-95"
                                                            >
                                                                <User size={16} className="text-white/60" /> Use another Google Account
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* STEP 2: AUTHORIZED STATE */
                                            <div className="flex gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                <div className="flex-1 space-y-10">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
                                                                <Check size={28} strokeWidth={3} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xl font-black italic tracking-tight text-left">Access Authorized</h4>
                                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest text-left">Account Connected</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={() => setShowHelp(!showHelp)}
                                                            variant="outline"
                                                            className={cn("h-10 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest transition-all", showHelp ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "text-gray-400")}
                                                        >
                                                            <HelpCircle size={14} /> Need Help?
                                                        </Button>
                                                    </div>

                                                    {/* MERCHANT ID INPUT */}
                                                    <div className="space-y-4 text-left">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between px-1">
                                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] opacity-40">Google Merchant ID</label>
                                                                <a href="https://merchants.google.com" target="_blank" className="text-[9px] font-black uppercase text-blue-600 hover:opacity-70 transition-all flex items-center gap-1">
                                                                    Open Dashboard <ExternalLink size={8} />
                                                                </a>
                                                            </div>
                                                            <div className="relative group/field">
                                                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within/field:text-emerald-500 transition-colors" size={18} />
                                                                <input
                                                                    value={formData.googleMerchantId}
                                                                    onChange={(e) => setFormData({ ...formData, googleMerchantId: e.target.value })}
                                                                    placeholder="e.g. 123456789"
                                                                    className="w-full h-14 pl-12 pr-40 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-mono text-sm tracking-widest font-bold transition-all"
                                                                />
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                                    <Button
                                                                        onClick={handleDiscoverAccounts}
                                                                        disabled={isDiscovering}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-10 rounded-xl bg-white border-emerald-500/20 text-emerald-600 font-black text-[9px] gap-2 px-4 shadow-sm hover:bg-emerald-50"
                                                                    >
                                                                        {isDiscovering ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                                        Auto-Detect
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {discoveredAccounts.length > 1 && (
                                                                <div className="animate-in fade-in slide-in-from-top-2 duration-500 space-y-2">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Multiple Accounts Found</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {discoveredAccounts.map((acc) => (
                                                                            <button
                                                                                key={acc.id}
                                                                                onClick={() => {
                                                                                    setFormData({ ...formData, googleMerchantId: acc.id });
                                                                                    setDiscoveredAccounts([]);
                                                                                }}
                                                                                className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition-all"
                                                                            >
                                                                                {acc.name} ({acc.id})
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Automation Toggles */}
                                                        <div className="space-y-6 !mt-10">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-widest leading-none">Automation</label>
                                                                <p className="text-[9px] text-gray-400 font-medium italic">Control how Bized keeps your catalog up to date</p>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                {[
                                                                    { id: 'autoSyncInventory', label: 'Inventory Sync', sub: 'Real-time stock' },
                                                                    { id: 'autoPushProducts', label: 'Push Products', sub: 'Instant updates' },
                                                                    { id: 'syncReviews', label: 'Review Sync', sub: 'Star ratings' },
                                                                    { id: 'remarketingPixel', label: 'Ads Pixel', sub: 'Dynamic tracking' }
                                                                ].map((toggle) => (
                                                                    <div
                                                                        key={toggle.id}
                                                                        onClick={() => setSettings(prev => ({ ...prev, [toggle.id]: !prev[toggle.id as keyof typeof prev] }))}
                                                                        className="flex items-center justify-between p-4 px-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 hover:border-emerald-500/20 transition-all cursor-pointer group"
                                                                    >
                                                                        <div className="space-y-0.5">
                                                                            <span className="text-[11px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">{toggle.label}</span>
                                                                            <p className="text-[9px] text-gray-400 font-medium">{toggle.sub}</p>
                                                                        </div>
                                                                        <div className={cn("w-10 h-5 rounded-full relative transition-all duration-300 shrink-0", settings[toggle.id as keyof typeof settings] ? "bg-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-gray-200")}>
                                                                            <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300", settings[toggle.id as keyof typeof settings] ? "left-6" : "left-1")} />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="pt-4">
                                                            <Button
                                                                onClick={handleSavePoliciesAndSettings}
                                                                disabled={isSaving}
                                                                className={cn("w-full h-16 rounded-[1.25rem] font-black text-lg gap-3 transition-all shadow-xl shadow-black/5", saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-black text-white hover:bg-neutral-800")}
                                                            >
                                                                {isSaving ? <Loader2 className="animate-spin" size={24} /> : saved ? <Check size={24} /> : <Zap size={20} className="text-yellow-400 fill-yellow-400" />}
                                                                {isSaving ? "Saving..." : saved ? "Changes Saved" : "Save"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-500/10 flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-emerald-900 text-sm">Automated Feed Management</h4>
                                            <p className="text-xs text-emerald-800/60 mt-1 leading-relaxed text-left">
                                                Bized automatically maintains your Google Shopping feed. Changes are synchronized in real-time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "sync" && (
                            <motion.div
                                key="sync"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-8">
                                    {/* Stats & Sync Trigger */}
                                    <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
                                                    <RefreshCw size={28} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black italic tracking-tight">Cloud Catalog Sync</h4>
                                                    <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50 font-medium">Bized → Google Content API for Shopping</p>
                                                </div>
                                            </div>
                                            <SyncIndicator
                                                lastSynced={currentBusiness.socialLinks?.googleMerchantSync}
                                                isSyncing={isSyncingMerchant}
                                                onSync={handleMerchantSync}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                                            {isLoadingStats && (
                                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                                                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                                                </div>
                                            )}
                                            {[
                                                { label: 'Total Products', value: merchantStats.total, sub: 'In catalog' },
                                                { label: 'Approved', value: merchantStats.approved, sub: 'Active in ads' },
                                                { label: 'Issues', value: merchantStats.issues, sub: 'Needs attention', color: 'text-amber-500' }
                                            ].map((stat, i) => (
                                                <div key={i} className="p-6 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-center space-y-1">
                                                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">{stat.label}</p>
                                                    <h5 className={cn("text-3xl font-black tracking-tighter italic", stat.color || "text-[var(--color-on-surface)]")}>{stat.value}</h5>
                                                    <p className="text-[9px] opacity-40 font-bold">{stat.sub}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            onClick={handleMerchantSync}
                                            disabled={isSyncingMerchant}
                                            className="w-full h-16 rounded-[1.25rem] bg-black text-white font-black text-lg gap-3 hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
                                        >
                                            {isSyncingMerchant ? <Loader2 className="animate-spin" /> : <Zap size={20} className="text-yellow-400 fill-yellow-400" />}
                                            {isSyncingMerchant ? "Synchronizing Feed..." : "Manually Trigger Full Sync"}
                                        </Button>
                                    </div>

                                    {/* Feed URL */}
                                    <div className="p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-500/10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                    <Globe size={14} />
                                                </div>
                                                <h5 className="font-black italic tracking-tighter text-emerald-900">Google Merchant Feed URL</h5>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-lg bg-white border-emerald-500/20 text-emerald-600 font-bold text-[10px] gap-2 px-4 shadow-sm"
                                                onClick={() => {
                                                    const url = `${window.location.origin}/api/stores/${currentBusiness._id}/google/shopping/feed`;
                                                    navigator.clipboard.writeText(url);
                                                    setSuccessMessage("Feed URL copied to clipboard!");
                                                }}
                                            >
                                                <Copy size={12} /> Copy URL
                                            </Button>
                                        </div>
                                        <div className="bg-white/80 border border-emerald-500/5 rounded-xl p-4 font-mono text-[9px] text-emerald-700 break-all shadow-inner">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/api/stores/${currentBusiness._id}/google/shopping/feed` : '/api/stores/.../google/shopping/feed'}
                                        </div>
                                        <p className="text-[10px] text-emerald-600/70 font-medium leading-relaxed">
                                            Paste this URL into GMC &gt; Feeds &gt; Scheduled Fetch for a permanent fallback.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "products" && (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-8">
                                    {/* Catalog Preview */}
                                    <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black italic tracking-tight">Product Catalog</h4>
                                                <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50 font-medium">Verify your items as they appear on Google Shopping</p>
                                            </div>
                                            <Button
                                                onClick={fetchGmcProducts}
                                                disabled={isLoadingProducts}
                                                variant="outline"
                                                size="sm"
                                                className="h-10 rounded-xl gap-2 text-xs font-bold"
                                            >
                                                <RefreshCw size={14} className={isLoadingProducts ? "animate-spin" : ""} /> Refresh Status
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {isLoadingProducts ? (
                                                Array.from({ length: 6 }).map((_, i) => (
                                                    <div key={i} className="h-24 rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
                                                ))
                                            ) : gmcProducts.length > 0 ? (
                                                gmcProducts.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-emerald-500/30 transition-all text-left group"
                                                    >
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                                            <img src={product.image || "/placeholder-product.png"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h5 className="font-bold text-[10px] truncate leading-tight mb-1">{product.name}</h5>
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest",
                                                                    product.gmcStatus === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                                                        product.gmcStatus === 'disapproved' ? 'bg-red-100 text-red-600' :
                                                                            'bg-amber-100 text-amber-600'
                                                                )}>
                                                                    {product.gmcStatus}
                                                                </div>
                                                                <span className="text-[9px] font-mono opacity-30">#{product.offerId}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="col-span-2 py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 opacity-30">
                                                        <ShoppingBag size={32} />
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium italic">No products matched in your GMC account.<br />Try syncing your feed first.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "shipping" && (
                            <motion.div
                                key="shipping"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <Truck size={24} />
                                                </div>
                                                <h4 className="text-xl font-black italic tracking-tight">Shipping Information</h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Handling Time (Days)</label>
                                                    <input
                                                        type="number"
                                                        value={policies.shipping.handlingTime}
                                                        onChange={(e) => setPolicies({ ...policies, shipping: { ...policies.shipping, handlingTime: parseInt(e.target.value) } })}
                                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 font-bold text-base outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Transit Time (Days)</label>
                                                    <input
                                                        type="number"
                                                        value={policies.shipping.transitTime}
                                                        onChange={(e) => setPolicies({ ...policies, shipping: { ...policies.shipping, transitTime: parseInt(e.target.value) } })}
                                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 font-bold text-base outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Flat Rate Shipping</label>
                                                    <input
                                                        type="number"
                                                        value={policies.shipping.flatRate}
                                                        onChange={(e) => setPolicies({ ...policies, shipping: { ...policies.shipping, flatRate: parseInt(e.target.value) } })}
                                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 font-bold text-base outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Free Shipping Over</label>
                                                    <input
                                                        type="number"
                                                        value={policies.shipping.freeShippingOver}
                                                        onChange={(e) => setPolicies({ ...policies, shipping: { ...policies.shipping, freeShippingOver: parseInt(e.target.value) } })}
                                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 font-bold text-base outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <Button
                                                onClick={handleSavePoliciesAndSettings}
                                                disabled={isSaving}
                                                className={cn("w-full h-16 rounded-[1.25rem] font-black text-lg gap-3 transition-all shadow-xl shadow-black/5", saved ? "bg-emerald-500 text-white shadow-emerald-500/20 scale-[0.98]" : "bg-black text-white hover:bg-neutral-800")}
                                            >
                                                {isSaving ? <Loader2 className="animate-spin" size={24} /> : saved ? <Check size={24} /> : <Zap size={20} className="text-yellow-400 fill-yellow-400" />}
                                                {isSaving ? "Syncing..." : saved ? "Shipping Updated" : "Save Shipping Policy"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "returns" && (
                            <motion.div
                                key="returns"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                    <Undo2 size={24} />
                                                </div>
                                                <h4 className="text-xl font-black italic tracking-tight">Return Policy Settings</h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Return Period (Days)</label>
                                                    <input
                                                        type="number"
                                                        value={policies.returns.days}
                                                        onChange={(e) => setPolicies({ ...policies, returns: { ...policies.returns, days: parseInt(e.target.value) } })}
                                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-purple-500 font-bold text-base outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Restocking Fee (%)</label>
                                                    <input
                                                        type="number"
                                                        value={policies.returns.restockingFee}
                                                        onChange={(e) => setPolicies({ ...policies, returns: { ...policies.returns, restockingFee: parseInt(e.target.value) } })}
                                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-purple-500 font-bold text-base outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Full Policy URL</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://yourstore.com/returns"
                                                    value={policies.returns.policyUrl}
                                                    onChange={(e) => setPolicies({ ...policies, returns: { ...policies.returns, policyUrl: e.target.value } })}
                                                    className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-purple-500 font-bold text-base outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <Button
                                                onClick={handleSavePoliciesAndSettings}
                                                disabled={isSaving}
                                                className={cn("w-full h-16 rounded-[1.25rem] font-black text-lg gap-3 transition-all shadow-xl shadow-black/5", saved ? "bg-emerald-500 text-white shadow-emerald-500/20 scale-[0.98]" : "bg-black text-white hover:bg-neutral-800")}
                                            >
                                                {isSaving ? <Loader2 className="animate-spin" size={24} /> : saved ? <Check size={24} /> : <Zap size={20} className="text-yellow-400 fill-yellow-400" />}
                                                {isSaving ? "Updating..." : saved ? "Returns Updated" : "Keep Return Policy Active"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "analytics" && (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                    <div className="flex flex-col items-center text-center space-y-6 py-10 opacity-40">
                                        <div className="w-24 h-24 rounded-[2rem] bg-gray-100 flex items-center justify-center">
                                            <Star size={48} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-black italic tracking-tight">Shopping Performance</h4>
                                            <p className="text-sm font-medium max-w-md">Bized is tracking clicks and impressions from Google Shopping. Full visual analytics will be available once your catalog reaches 100+ daily impressions.</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-8 w-full max-w-sm pt-6">
                                            {['Impressions', 'Clicks', 'CTR'].map(stat => (
                                                <div key={stat} className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">{stat}</p>
                                                    <h6 className="text-2xl font-black italic">--</h6>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}


                    </AnimatePresence>

                    {/* Product Preview Modal */}
                    <AnimatePresence>
                        {selectedProduct && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedProduct(null)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-sm bg-gray-100 rounded-[3rem] overflow-hidden shadow-2xl"
                                >
                                    <div className="p-8 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Google Shopping</span>
                                            </div>
                                            <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 rounded-full bg-white/50 text-gray-600 flex items-center justify-center border border-gray-200"><X size={16} /></button>
                                        </div>

                                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-white/50 group/card">
                                            <div className="aspect-square relative overflow-hidden bg-gray-50">
                                                <img src={selectedProduct.image || "/placeholder.png"} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" alt="" />
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Ad</span>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-md uppercase tracking-tighter italic">Bized Selection</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 leading-tight">{selectedProduct.name}</h3>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{currentBusiness.name}</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black tracking-tighter italic text-gray-900">{(selectedProduct.price || 0).toLocaleString()} {currentBusiness.currency || 'KES'}</span>
                                                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-[9px]">
                                                            {policies.shipping.flatRate === 0 ? "Free Shipping" : `+${policies.shipping.flatRate} ${currentBusiness.currency || 'KES'} shipping`}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} size={8} className="fill-amber-400 text-amber-400" />
                                                        ))}
                                                        <span className="text-[9px] text-gray-400 font-bold ml-1">(4.8)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                                                    <p className={cn("text-[10px] font-black uppercase", selectedProduct.gmcStatus === 'approved' ? 'text-emerald-500' : 'text-amber-500')}>{selectedProduct.gmcStatus}</p>
                                                </div>
                                                <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Visibility</p>
                                                    <p className="text-[10px] font-black uppercase text-blue-500">Shopping Ads</p>
                                                </div>
                                            </div>

                                            {selectedProduct.issues?.length > 0 && (
                                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-red-600">Merchant Center Issues</p>
                                                    <ul className="space-y-1">
                                                        {selectedProduct.issues.map((issue: any, i: number) => (
                                                            <li key={i} className="text-[10px] text-red-900/60 font-medium leading-tight">• {issue.detail || issue.attributeName}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <Button
                                                className="w-full h-14 rounded-2xl bg-black text-white hover:bg-neutral-800"
                                                onClick={() => window.open(`http://${currentBusiness.slug}.bized.app/product/${selectedProduct.id}`, '_blank')}
                                            >
                                                <ExternalLink size={16} className="mr-2" /> View on Store
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
