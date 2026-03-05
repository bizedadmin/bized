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
    Search
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

const ErrorModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <AnimatePresence>
        {message && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500">
                            <AlertCircle size={40} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black italic tracking-tight text-gray-900">Sync Error</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                {message}
                            </p>
                        </div>
                        <Button
                            onClick={onClose}
                            className="w-full h-14 rounded-2xl bg-gray-900 text-white font-black text-sm hover:bg-black transition-all"
                        >
                            Got it, thanks
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <AnimatePresence>
        {message && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <Check size={40} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black italic tracking-tight text-gray-900">Success</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                {message}
                            </p>
                        </div>
                        <Button
                            onClick={onClose}
                            className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            Excellent
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

    const [formData, setFormData] = useState({
        googleMerchantId: "",
    });

    useEffect(() => {
        if (currentBusiness) {
            setFormData({
                googleMerchantId: currentBusiness.socialLinks?.googleMerchantId || "",
            });
            if (currentBusiness.socialLinks?.googleMerchantId) {
                fetchMerchantStats();
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
        { id: "identity", label: "Merchant Account", icon: Layout, description: "Connect to Merchant Center" },
        { id: "sync", label: "Product Feed", icon: RefreshCw, description: "Sync catalog to Shopping Ads" },
        { id: "settings", label: "Feed Settings", icon: Settings, description: "Configure field mappings" },
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
                <ErrorModal message={error || ""} onClose={() => setError(null)} />
                <SuccessModal message={successMessage || ""} onClose={() => setSuccessMessage(null)} />

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
                                                                To sync your store inventory automatically with Google Merchant Center, you need to authorize Bized. If you have already done this under Google Profile, it might be connected already.
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col gap-6 w-full">
                                                            {session?.user?.email && (
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="h-px bg-white/20 flex-1" />
                                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">or</span>
                                                                        <div className="h-px bg-white/20 flex-1" />
                                                                    </div>

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
                                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
                                                            <Check size={28} strokeWidth={3} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black italic tracking-tight">Access Authorized</h4>
                                                            <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50 font-medium">Your Google Account is securely connected.</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleConnectGoogle()}
                                                        variant="text"
                                                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500"
                                                    >
                                                        Change Account
                                                    </Button>
                                                </div>

                                                {/* MERCHANT ID INPUT */}
                                                <div className="space-y-4 max-w-xl">
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
                                                                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-mono text-sm tracking-widest font-bold transition-all"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-medium pl-1 italic">
                                                            Found in the top-right corner of your Google Merchant Center dashboard.
                                                        </p>
                                                    </div>

                                                    <div className="pt-4">
                                                        <Button
                                                            onClick={handleSave}
                                                            disabled={isSaving}
                                                            className={cn("w-full h-16 rounded-[1.25rem] font-black text-lg gap-3 transition-all", saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-700")}
                                                        >
                                                            {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                                                            {isSaving ? "Syncing..." : saved ? "Merchant Data Saved" : "Save Merchant ID"}
                                                        </Button>
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
                                            <p className="text-xs text-emerald-800/60 mt-1 leading-relaxed">
                                                Bized automatically maintains your Google Shopping feed. Changes to products, pricing, or stock levels are synchronized in real-time to your Merchant Center account.
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
                                    <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
                                                    <RefreshCw size={28} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black italic tracking-tight">Active Product Feed</h4>
                                                    <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50 font-medium">Cloud catalog sync via the Shopping Content API</p>
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

                                        <div className="pt-4">
                                            <Button
                                                onClick={handleMerchantSync}
                                                disabled={isSyncingMerchant}
                                                className="w-full h-16 rounded-[1.25rem] bg-black text-white font-black text-lg gap-3 hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
                                            >
                                                {isSyncingMerchant ? <Loader2 className="animate-spin" /> : <Zap size={20} className="text-yellow-400 fill-yellow-400" />}
                                                {isSyncingMerchant ? "Synchronizing Feed..." : "Trigger Full Merchant Sync"}
                                            </Button>
                                        </div>
                                    </div>

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
                                        <div className="bg-white/80 border border-emerald-500/5 rounded-xl p-4 font-mono text-[10px] text-emerald-700 break-all shadow-inner">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/api/stores/${currentBusiness._id}/google/shopping/feed` : '/api/stores/.../google/shopping/feed'}
                                        </div>
                                        <p className="text-[10px] text-emerald-600/70 font-medium leading-relaxed">
                                            Paste this URL into **Google Merchant Center &gt; Feeds &gt; Add Feed &gt; Scheduled Fetch**. Google will automatically pull your Bized catalog every 24 hours. (For manual XML syncing)
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-widest">Feed Synchronization Settings</label>
                                            <Button variant="text" size="sm" className="text-[10px] font-bold text-blue-600 h-auto p-0 hover:bg-transparent">Configure Field Mapping</Button>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { label: 'Auto-sync inventory levels', active: true },
                                                { label: 'Push new products to Merchant Center', active: true },
                                                { label: 'Sync product reviews to shopping ads', active: false },
                                                { label: 'Dynamic Remarketing Pixel', active: true }
                                            ].map((toggle, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 px-6 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/10 hover:border-blue-500/20 transition-all cursor-pointer group">
                                                    <span className="text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity">{toggle.label}</span>
                                                    <div className={cn("w-10 h-5 rounded-full relative transition-all duration-300", toggle.active ? "bg-blue-600" : "bg-gray-200")}>
                                                        <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300", toggle.active ? "left-6" : "left-1")} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
