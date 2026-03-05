"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Sparkles,
    Check,
    Loader2,
    Globe,
    MapPin,
    Clock,
    BarChart3,
    Key,
    MessageSquare,
    ChevronRight,
    Plus,
    Trash2,
    HelpCircle,
    Settings,
    Layout,
    ExternalLink,
    AlertCircle,
    Type,
    Copy,
    Share2,
    Star,
    Reply,
    User,
    ShoppingBag,
    Tag,
    RefreshCw,
    Zap,
    TrendingUp,
    MousePointer2,
    Navigation2,
    Calendar,
    ArrowUpRight,
    SearchCode,
    Smartphone,
    Monitor,
    Heart,
    Info,
    Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

// Google Search Mockup Component
const GoogleSearchPreview = ({ name, url, description }: { name: string, url: string, description: string }) => (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 space-y-3 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative">
        <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[12px] font-black text-blue-600 shadow-inner">
                {name?.charAt(0) || 'B'}
            </div>
            <div className="flex flex-col">
                <span className="text-[11px] text-[#202124] font-medium leading-tight">{name || 'Your Business'}</span>
                <span className="text-[9px] text-[#70757a] leading-tight">https://{url || 'bized.app/shop'}</span>
            </div>
            <div className="ml-auto flex items-center gap-1 opacity-20">
                <div className="w-1 h-1 rounded-full bg-black" />
                <div className="w-1 h-1 rounded-full bg-black" />
                <div className="w-1 h-1 rounded-full bg-black" />
            </div>
        </div>
        <div className="space-y-1">
            <h3 className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer leading-tight line-clamp-2">
                {name || 'Store Name'} — Premium Shop & Online Orders
            </h3>
            <p className="text-[#4d5156] text-[12px] leading-relaxed line-clamp-2">
                {description || 'Manage your Google profile to see how your store appears to customers searching for your products online. Boost your SEO with Bized.'}
            </p>
        </div>
        <div className="pt-2 flex flex-wrap gap-2 border-t border-gray-100 mt-2">
            <div className="px-3 py-1 bg-gray-50 rounded-full text-[9px] font-bold text-gray-500">Directions</div>
            <div className="px-3 py-1 bg-gray-50 rounded-full text-[9px] font-bold text-gray-500">Website</div>
            <div className="px-3 py-1 bg-gray-50 rounded-full text-[9px] font-bold text-gray-500">Call</div>
        </div>
        <div className="pt-3 space-y-2 border-t border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#70757a]">From the owner</p>
            <div className="flex gap-3 items-start bg-blue-50/20 p-2 rounded-xl border border-blue-500/5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 shrink-0 flex items-center justify-center text-blue-500 shadow-inner">
                    <Share2 size={16} />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold leading-tight line-clamp-1">New Spring Collection is out!</p>
                    <p className="text-[8px] font-medium text-gray-400">Published 2 days ago</p>
                </div>
            </div>
        </div>
    </div>
);

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

export default function GoogleIntegrationPage() {
    const { currentBusiness, updateBusiness, isLoading: isContextLoading } = useBusiness();
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("sync");
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showAutoSyncModal, setShowAutoSyncModal] = useState(false);
    const [showGuideSheet, setShowGuideSheet] = useState(false);
    const [gbpProfiles, setGbpProfiles] = useState<any[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [gbpQuotaWarning, setGbpQuotaWarning] = useState(false);
    const [gbpCachedAt, setGbpCachedAt] = useState<number | null>(null);
    const [gbpUrl, setGbpUrl] = useState("");
    const [extractedLocationId, setExtractedLocationId] = useState("");
    const [extractedAccountId, setExtractedAccountId] = useState("");
    const [urlError, setUrlError] = useState<string | null>(null);

    // Helper inputs for the guide sheet
    const [helperProfileId, setHelperProfileId] = useState("");
    const [helperAccountId, setHelperAccountId] = useState("");
    const [guideType, setGuideType] = useState<"profile" | "account">("profile");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        address: "",
        phone: "",
        website: "",
        googleApiKey: "",
        googleLocationName: "",
        googleAccountId: "",
        googleMerchantId: "",
        hours: {
            monday: { open: "09:00", close: "18:00", closed: false },
            tuesday: { open: "09:00", close: "18:00", closed: false },
            wednesday: { open: "09:00", close: "18:00", closed: false },
            thursday: { open: "09:00", close: "18:00", closed: false },
            friday: { open: "09:00", close: "18:00", closed: false },
            saturday: { open: "10:00", close: "16:00", closed: false },
            sunday: { open: "00:00", close: "00:00", closed: true },
        }
    });

    useEffect(() => {
        if (currentBusiness) {
            setFormData({
                name: currentBusiness.name || "",
                description: currentBusiness.description || currentBusiness.about || "",
                address: currentBusiness.address || "",
                phone: currentBusiness.phone || "",
                website: currentBusiness.website || "",
                googleApiKey: currentBusiness.aiConfig?.googleApiKey || "",
                googleLocationName: currentBusiness.socialLinks?.googleLocationName || "",
                googleAccountId: currentBusiness.socialLinks?.googleAccountId || "",
                googleMerchantId: currentBusiness.socialLinks?.googleMerchantId || "",
                hours: (currentBusiness as any).openingHours ? JSON.parse((currentBusiness as any).openingHours) : formData.hours
            });
        }
    }, [currentBusiness]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        // Handle tab switching from external links (like sidebar)
        const tabParam = params.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }

        if (params.get('success') === 'connected') {
            setSuccessMessage("Google Account connected successfully!");
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
        } else if (params.get('error') === 'auth_failed') {
            setError("Google authorization failed. Please try again.");
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleSave = async () => {
        if (!currentBusiness) return;
        setIsSaving(true);
        await performSync();
        setIsSaving(false);
    };

    const performSync = async () => {
        if (!currentBusiness) return;

        const success = await updateBusiness({
            name: formData.name,
            description: formData.description,
            address: formData.address,
            phone: formData.phone,
            website: formData.website,
            socialLinks: {
                ...currentBusiness.socialLinks,
                googleLocationName: formData.googleLocationName,
                googleAccountId: formData.googleAccountId,
                googleMerchantId: formData.googleMerchantId
            },
            aiConfig: {
                ...currentBusiness.aiConfig,
                googleApiKey: formData.googleApiKey,
                provider: formData.googleApiKey ? "google" : currentBusiness.aiConfig?.provider
            },
            openingHours: JSON.stringify(formData.hours)
        });

        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
        return success;
    };

    const handleManualSync = async () => {
        if (!currentBusiness) return;

        // 1. Save local state first
        const savedLocally = await performSync();
        if (!savedLocally) return;

        setIsSyncing(true);

        try {
            // 2. Trigger the ACTUAL synchronization API
            const res = await fetch(`/api/stores/${currentBusiness._id}/google/sync`, {
                method: 'POST'
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to sync with Google');
            } else {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error("Sync process failed:", error);
            setError("A network error occurred during sync.");
        } finally {
            setIsSyncing(false);
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

    const fetchGBPProfiles = async (forceRefresh = false) => {
        if (!currentBusiness) return;
        setIsLoadingProfiles(true);
        setGbpQuotaWarning(false);
        setShowAutoSyncModal(true);
        try {
            const url = `/api/stores/${currentBusiness._id}/google/profiles${forceRefresh ? '?refresh=1' : ''}`;
            const res = await fetch(url);
            const data = await res.json();

            if (res.status === 429 || data.error === 'quota_exceeded') {
                if (data.accounts) {
                    // Stale cache available
                    setGbpProfiles(data.accounts || []);
                    setGbpQuotaWarning(true);
                    setGbpCachedAt(data.cachedAt || null);
                } else {
                    // No cache, show error in modal
                    setGbpProfiles([]);
                    setGbpQuotaWarning(true);
                }
            } else if (res.ok) {
                setGbpProfiles(data.accounts || []);
                setGbpQuotaWarning(data.warning === 'quota_exceeded');
                setGbpCachedAt(data.cachedAt || null);
            } else {
                setError(data.message || data.error || "Failed to load Google profiles.");
                setShowAutoSyncModal(false);
            }
        } catch {
            setError("Network error loading profiles.");
            setShowAutoSyncModal(false);
        } finally {
            setIsLoadingProfiles(false);
        }
    };


    const handleSelectProfile = (accountId: string, locationId: string) => {
        setFormData(prev => ({ ...prev, googleAccountId: accountId, googleLocationName: locationId }));
        setShowAutoSyncModal(false);
        setSuccessMessage("Profile selected! Review the credentials below and hit Push Global Store Sync.");
    };

    /** Parse a GBP management URL and extract location / account IDs */
    const parseGBPUrl = (url: string) => {
        setUrlError(null);
        if (!url) {
            setExtractedLocationId("");
            setExtractedAccountId("");
            return;
        }

        // Check if it's a search URL instead of management URL
        if (url.includes("google.com/search")) {
            setUrlError("This is a Search Results URL. Please click 'Edit Profile' or 'Business Settings' inside the Google panel to find your Management IDs.");
            setExtractedLocationId("");
            setExtractedAccountId("");
            return;
        }

        // Location ID: after /l/ in URLs like business.google.com/u/0/edit/l/123456
        const locMatch = url.match(/\/l\/([\d]+)/);
        // Account ID: after /accounts/ in URLs like business.google.com/u/0/manage/accounts/123456
        const accMatch = url.match(/\/accounts\/([\d]+)/);

        const loc = locMatch ? `locations/${locMatch[1]}` : "";
        const acc = accMatch ? `accounts/${accMatch[1]}` : "";

        setExtractedLocationId(loc);
        setExtractedAccountId(acc);

        if (!loc && !acc && url.length > 20) {
            setUrlError("No IDs found. Ensure you've clicked into the Profile Editor and copied the full URL.");
        }
    };

    /** Apply the extracted IDs to the main form and close the guide sheet */
    const applyExtractedIds = () => {
        setFormData(prev => ({
            ...prev,
            ...(extractedLocationId && { googleLocationName: extractedLocationId }),
            ...(extractedAccountId && { googleAccountId: extractedAccountId }),
        }));
        setShowGuideSheet(false);
        setGbpUrl("");
        setExtractedLocationId("");
        setExtractedAccountId("");
        setSuccessMessage("IDs applied to form!");
    };

    /** Apply helper data to main form without syncing */
    const applyHelperData = () => {
        if (guideType === "profile" && !helperProfileId) {
            setError("Please enter a Business Profile ID");
            return;
        }
        if (guideType === "account" && !helperAccountId) {
            setError("Please enter a Business Account ID");
            return;
        }

        let newFormData = { ...formData };

        if (guideType === "profile") {
            let formattedLoc = helperProfileId.trim();
            if (formattedLoc && !formattedLoc.replace(/\D/g, '')) {
                setError("Invalid Profile ID format");
                return;
            }
            if (formattedLoc && !formattedLoc.startsWith("locations/")) {
                formattedLoc = `locations/${formattedLoc}`;
            }
            newFormData.googleLocationName = formattedLoc;
            setHelperProfileId(""); // reset helper
        } else {
            let formattedAcc = helperAccountId.trim();
            if (formattedAcc && !formattedAcc.startsWith("accounts/") && formattedAcc.length > 5) {
                formattedAcc = `accounts/${formattedAcc}`;
            }
            newFormData.googleAccountId = formattedAcc;
            setHelperAccountId(""); // reset helper
        }

        setFormData(newFormData);
        setShowGuideSheet(false);
        setSuccessMessage("ID applied to form. You can now sync on the main page.");
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
        { id: "sync", label: "Google Sync", icon: RefreshCw, description: "Live cloud synchronization" },
        { id: "profile", label: "Store Identity", icon: Layout, description: "Manage Search & Maps profile" },
        { id: "updates", label: "Updates & Posts", icon: Share2, description: "Publish to Google Knowledge Panel" },
        { id: "reviews", label: "Reviews", icon: Star, description: "Manage Google customer feedback" },
        { id: "qa", label: "Q&A Management", icon: HelpCircle, description: "Answer customer inquiries" },
        { id: "ai", label: "AI Configuration", icon: Sparkles, description: "Gemini & Vertex AI settings" },
        { id: "hours", label: "Business Hours", icon: Clock, description: "Sync with Google Maps" },
        { id: "insights", label: "Performance", icon: BarChart3, description: "Search Console insights" },
    ];

    const activePage = tabs.find(t => t.id === activeTab) || tabs[0];

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--color-surface-container-lowest)]">
            {/* Left Panel - Tabs (Sidebar) */}
            <div className="w-80 border-r border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)] flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-[var(--color-outline-variant)]/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Search size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[var(--color-on-surface)] leading-none italic tracking-tight">Google</h1>
                            <p className="text-[10px] uppercase font-black text-[var(--color-on-surface-variant)] opacity-40 mt-1 tracking-widest">Storefront Module</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                }}
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
                        {activeTab === "sync" && (
                            <motion.div
                                key="sync"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                    {!currentBusiness.socialLinks?.googleConnected ? (
                                        /* STEP 1: UNAUTHORIZED STATE */
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                                                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                                                    <Zap size={150} />
                                                </div>
                                                <div className="relative z-10 space-y-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                        <Key size={32} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-3xl font-black italic tracking-tighter mb-2">Authorize Bized</h4>
                                                        <p className="text-blue-100 font-medium leading-relaxed max-w-md">
                                                            To begin syncing your store with Google, you must authorize access. Select an option below to proceed.
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

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                                <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Globe size={20} /></div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Search SEO</p>
                                                    <p className="text-[10px] font-medium text-gray-500">Auto-update your business details across Global Google Search.</p>
                                                </div>
                                                <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><MapPin size={20} /></div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Maps Visibility</p>
                                                    <p className="text-[10px] font-medium text-gray-500">Ensure your location is verified and active on Google Maps.</p>
                                                </div>
                                                <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><ShoppingBag size={20} /></div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Merchant Center</p>
                                                    <p className="text-[10px] font-medium text-gray-500">Sync your product catalog directly to Google Shopping.</p>
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
                                                    Disconnect Account
                                                </Button>
                                            </div>

                                            <div className="bg-blue-50/50 border border-blue-500/10 rounded-[2rem] p-8 space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                        <Key size={14} />
                                                    </div>
                                                    <h5 className="font-black italic tracking-tighter text-blue-900">Google API Credentials</h5>
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    {/* Business Profile ID */}
                                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-blue-200">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                            <MapPin size={18} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Business Profile ID</label>
                                                                <button
                                                                    onClick={() => { setGuideType("profile"); setShowGuideSheet(true); }}
                                                                    className="text-[9px] font-black text-blue-500 hover:underline"
                                                                >
                                                                    How to find?
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={formData.googleLocationName}
                                                                onChange={(e) => setFormData({ ...formData, googleLocationName: e.target.value })}
                                                                placeholder="locations/123456789"
                                                                className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:ring-0"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Business Account ID */}
                                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-blue-200">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                            <User size={18} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Business Account ID</label>
                                                                <button
                                                                    onClick={() => { setGuideType("account"); setShowGuideSheet(true); }}
                                                                    className="text-[9px] font-black text-blue-500 hover:underline"
                                                                >
                                                                    How to find?
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={formData.googleAccountId}
                                                                onChange={(e) => setFormData({ ...formData, googleAccountId: e.target.value })}
                                                                placeholder="accounts/123456789"
                                                                className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:ring-0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hidden helper buttons replaced by specific 'How to find?' triggers above */}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 px-2">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                                                        <Zap size={14} />
                                                    </div>
                                                    <h5 className="font-black italic tracking-tighter text-gray-900">Execute Operations</h5>
                                                </div>

                                                {/* Auto Sync - always visible when connected */}
                                                <Button
                                                    onClick={() => fetchGBPProfiles()}
                                                    disabled={isLoadingProfiles}
                                                    className="w-full h-14 rounded-[1.25rem] font-black text-sm gap-3 transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                                                >
                                                    {isLoadingProfiles ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                                                    {isLoadingProfiles ? "Loading Profiles..." : "Auto Sync — Browse My Google Profiles"}
                                                </Button>

                                                {/* Push Global Sync — only if Location ID & Account ID filled */}
                                                {formData.googleLocationName && formData.googleAccountId && (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-px flex-1 bg-gray-100" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">or manual</span>
                                                            <div className="h-px flex-1 bg-gray-100" />
                                                        </div>
                                                        <Button
                                                            onClick={handleManualSync}
                                                            disabled={isSyncing}
                                                            className={cn(
                                                                "w-full h-20 rounded-[1.5rem] font-black text-xl gap-4 transition-all shadow-2xl",
                                                                isSyncing ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-black text-white shadow-blue-500/20 active:scale-[0.98] border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                                                            )}
                                                        >
                                                            {isSyncing ? <Loader2 className="animate-spin" size={28} /> : <RefreshCw size={28} />}
                                                            {isSyncing ? "Communicating with Google..." : "Push Global Store Sync"}
                                                        </Button>
                                                        <p className="text-center text-[10px] font-bold text-gray-400 italic">This will update your profile across the global Google registry.</p>
                                                    </>
                                                )}

                                                {!formData.googleLocationName && !formData.googleAccountId && (
                                                    <p className="text-center text-[10px] font-bold text-gray-400 italic">Use Auto Sync above to select a profile, or manually enter your IDs.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40 px-1 uppercase tracking-widest">Business Name</label>
                                            <div className="relative group">
                                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-20 group-focus-within:text-blue-500 transition-all" size={18} />
                                                <input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full h-14 pl-12 pr-6 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold transition-all"
                                                    placeholder="Enter Official Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40 px-1 uppercase tracking-widest">Public Phone</label>
                                            <div className="relative group">
                                                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-20 group-focus-within:text-blue-500 transition-all" size={18} />
                                                <input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full h-14 pl-12 pr-6 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold transition-all"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40 px-1 uppercase tracking-widest">Store Snippet (Meta Description)</label>
                                        <textarea
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-6 rounded-[2rem] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none text-sm leading-relaxed"
                                            placeholder="Write a compelling summary for your Google Search result..."
                                        />
                                        <div className="flex justify-between px-2">
                                            <p className="text-[9px] text-[var(--color-on-surface-variant)] opacity-40">Recommended: 150-160 characters</p>
                                            <p className={cn("text-[9px] font-bold", formData.description.length > 160 ? "text-red-500" : "text-emerald-500")}>
                                                {formData.description.length} chars
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40 px-1 uppercase tracking-widest">Store Address</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-20 group-focus-within:text-blue-500 transition-all" size={20} />
                                            <input
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-medium transition-all"
                                                placeholder="Enter full physical address for Google Maps"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className={cn("w-full h-16 rounded-[1.25rem] font-black text-lg gap-3 transition-all transform active:scale-95", saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700")}
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" size={24} /> : saved ? <Check size={24} /> : <Check size={24} />}
                                            {isSaving ? "Syncing Workspace..." : saved ? "Identity Data Saved" : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-sm">Pro Tip: Local SEO</h4>
                                        <p className="text-xs text-amber-800/60 mt-1 leading-relaxed">
                                            Ensure your physical address matches exactly what's on your utility bills. Google verifies this information to rank you higher on Maps.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === "updates" && (
                            <motion.div
                                key="updates"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-black italic tracking-tighter">Google Updates</h4>
                                            <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50">Publish news, offers, and events directly to Google</p>
                                        </div>
                                        <Button className="h-12 rounded-2xl bg-blue-600 text-white font-black text-[10px] gap-2 px-6 shadow-xl shadow-blue-500/20">
                                            <Plus size={16} /> Create New Update
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { title: 'New Spring Collection!', date: '2 days ago', views: '240', status: 'Live' },
                                            { title: '20% Weekend Flash Sale', date: 'Last week', views: '1.1K', status: 'Expired' }
                                        ].map((post, i) => (
                                            <div key={i} className="group relative overflow-hidden rounded-[2rem] border border-black/5 bg-gray-50 p-6 hover:bg-white hover:shadow-xl transition-all h-64 flex flex-col justify-between">
                                                <div className="flex items-start justify-between">
                                                    <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", post.status === 'Live' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400')}>
                                                        {post.status}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black opacity-30 italic">
                                                        <BarChart3 size={14} /> {post.views} views
                                                    </div>
                                                </div>

                                                <div>
                                                    <h5 className="text-lg font-black tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h5>
                                                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-4">Posted {post.date}</p>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-bold bg-white">Edit</Button>
                                                        <Button variant="text" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-bold text-gray-400"><Trash2 size={14} /></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "reviews" && (
                            <motion.div
                                key="reviews"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-black italic tracking-tight">Customer Feedback</h4>
                                            <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50">Manage your Google Business reviews</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                                            <Sparkles className="text-blue-600" size={14} />
                                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">AI Replies Active</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(currentBusiness.reviews?.length || 0) > 0 ? (
                                            currentBusiness.reviews?.map((review) => (
                                                <div key={review.id} className="p-6 rounded-[2rem] bg-[var(--color-surface-container-low)]/50 border border-[var(--color-outline-variant)]/10 space-y-4 group hover:border-blue-500/20 transition-all">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">
                                                                {review.author?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-sm">{review.author}</h5>
                                                                <div className="flex gap-0.5 mt-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} size={10} className={cn(i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] opacity-40 font-medium">{review.datePublished || 'Recently'}</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed opacity-70 italic">"{review.body}"</p>

                                                    <div className="bg-blue-50/30 rounded-2xl p-6 border border-blue-500/5 space-y-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles size={14} className="text-blue-500" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">AI Suggested Reply</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 leading-relaxed italic">
                                                            "Thank you for the review! We are so glad you enjoyed our service. Looking forward to welcoming you back to {currentBusiness.name}!"
                                                        </p>
                                                        <div className="flex gap-2 pt-2">
                                                            <Button className="h-9 rounded-xl bg-blue-600 text-white font-black text-[10px] px-6">Post Response</Button>
                                                            <Button variant="outline" className="h-9 rounded-xl font-bold text-[10px] px-6 bg-white">Edit Draft</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 flex flex-col items-center text-center space-y-4 grayscale opacity-40">
                                                <MessageSquare size={48} />
                                                <div>
                                                    <h5 className="font-bold">No Google Reviews yet</h5>
                                                    <p className="text-xs max-w-[240px] mt-1">Customers who find you on Search and Maps will appear here.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xl shadow-blue-500/10">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black italic tracking-tighter">AI-Powered Response Engine</h4>
                                            <p className="text-xs text-white/70 mt-1 leading-relaxed">
                                                Our Google integration uses Gemini to analyze sentiment and draft professional replies for you,
                                                helping you maintain a high response rate on Maps.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === "qa" && (
                            <motion.div
                                key="qa"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-black italic tracking-tighter">Customer Q&A</h4>
                                            <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50">Manage questions from the Google Knowledge Panel</p>
                                        </div>
                                        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                            3 New Pending
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { q: "Do you have wheelchair access at the main entrance?", user: "Sarah J.", date: "2 hours ago" },
                                            { q: "What is the best time to visit to avoid crowds?", user: "Mike D.", date: "1 day ago" },
                                            { q: "Is there parking available nearby?", user: "Elena R.", date: "3 days ago" }
                                        ].map((item, i) => (
                                            <div key={i} className="p-8 rounded-[2rem] bg-gray-50 border border-transparent hover:border-blue-500/10 transition-all space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                            {item.user[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{item.user} • {item.date}</p>
                                                            <p className="text-sm font-bold text-gray-800 leading-relaxed italic">"{item.q}"</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles size={14} className="text-blue-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">AI Suggested Answer</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                        Yes, we have a fully accessible ramp at the main entrance and our staff is always happy to assist with any special requirements.
                                                    </p>
                                                    <div className="flex gap-3 pt-2">
                                                        <Button className="h-10 rounded-xl bg-blue-600 text-white font-black text-[10px] px-6">Post Answer</Button>
                                                        <Button variant="outline" className="h-10 rounded-xl font-bold text-[10px] px-6 bg-white">Edit Draft</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}


                        {activeTab === "ai" && (
                            <motion.div
                                key="ai"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                    <div className="relative z-10 flex items-start gap-8">
                                        <div className="w-16 h-16 rounded-[2rem] bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                                            <Sparkles size={32} />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-2xl font-black italic tracking-tight">Gemini Vision & Intelligence</h4>
                                            <p className="text-white/70 text-sm leading-relaxed max-w-lg">
                                                Enabling Google AI (Gemini) allows your store to automatically draft product tags, generate AI-optimized descriptions, and answer customer queries with hyper-local context.
                                            </p>
                                            <div className="pt-2">
                                                <Button className="bg-white text-blue-700 h-10 px-6 rounded-full font-black text-xs hover:bg-white/90">Get AI Key</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-widest">Google Gemini API Key</label>
                                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md font-bold">Encrypted</span>
                                        </div>
                                        <div className="relative group">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-20 group-focus-within:text-blue-500 transition-all" size={20} />
                                            <input
                                                type="password"
                                                value={formData.googleApiKey}
                                                onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
                                                className="w-full h-16 pl-14 pr-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-mono text-sm tracking-widest transition-all"
                                                placeholder="••••••••••••••••••••••••••••••••"
                                            />
                                        </div>
                                        <p className="text-[10px] opacity-40 px-1 italic">Keys are never stored in plain text and are used only for backend AI calls.</p>
                                    </div>

                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full h-16 rounded-[1.25rem] bg-[var(--color-primary)] font-black text-lg shadow-xl shadow-[var(--color-primary-alpha)]"
                                    >
                                        Update Intelligence Bridge
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "hours" && (
                            <motion.div
                                key="hours"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                                        <div>
                                            <h4 className="text-xl font-black italic tracking-tighter">Availability Schedule</h4>
                                            <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50">Set your public hours for Google Maps & Search</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Live on Maps</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {Object.entries(formData.hours).map(([day, schedule]: [string, any]) => (
                                            <div key={day} className={cn(
                                                "flex items-center p-2.5 sm:p-4 rounded-3xl transition-all border gap-3",
                                                schedule.closed ? "bg-gray-50 border-transparent opacity-60" : "bg-white border-gray-100 hover:border-blue-500/10 shadow-sm"
                                            )}>
                                                {/* Day Badge */}
                                                <div className={cn(
                                                    "shrink-0 w-12 h-10 rounded-xl flex items-center justify-center font-black text-[11px] uppercase tracking-tighter",
                                                    schedule.closed ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                                                )}>
                                                    {day.slice(0, 3)}
                                                </div>

                                                {/* Time Inputs Section */}
                                                <div className="flex-1 min-w-0">
                                                    {!schedule.closed ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="relative flex-1 max-w-[95px]">
                                                                <input
                                                                    type="time"
                                                                    value={schedule.open}
                                                                    onChange={(e) => setFormData({
                                                                        ...formData,
                                                                        hours: { ...formData.hours, [day]: { ...schedule, open: e.target.value } }
                                                                    })}
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-[11px] font-bold outline-none focus:border-blue-500 transition-all text-center"
                                                                />
                                                            </div>
                                                            <div className="w-3 h-px bg-gray-300 opacity-40 shrink-0" />
                                                            <div className="relative flex-1 max-w-[95px]">
                                                                <input
                                                                    type="time"
                                                                    value={schedule.close}
                                                                    onChange={(e) => setFormData({
                                                                        ...formData,
                                                                        hours: { ...formData.hours, [day]: { ...schedule, close: e.target.value } }
                                                                    })}
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-[11px] font-bold outline-none focus:border-blue-500 transition-all text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Closed</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        hours: { ...formData.hours, [day]: { ...schedule, closed: !schedule.closed } }
                                                    })}
                                                    className={cn(
                                                        "shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        schedule.closed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600 hover:bg-red-100"
                                                    )}
                                                >
                                                    {schedule.closed ? "Open" : "Close"}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-10 flex gap-4">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 h-14 rounded-2xl bg-black text-white font-black text-sm gap-2 hover:bg-neutral-800"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                            Update Master Schedule
                                        </Button>
                                        <Button
                                            onClick={handleManualSync}
                                            disabled={isSyncing}
                                            className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-10 gap-2 shadow-xl shadow-blue-500/20"
                                        >
                                            {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
                                            Push to Maps
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-neutral-50 to-white border border-neutral-100 rounded-[2.5rem] p-8 flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                                        <Clock className="text-blue-500" size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-black italic text-neutral-800">Smart Holiday Sync</h5>
                                        <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                                            Your business hours are automatically adjusted during public holidays. We use the **Google Business Information API** to ensure your local customers always see accurate data.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "insights" && (
                            <motion.div
                                key="insights"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Metric Header */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Search Impressions', value: '12.4K', change: '+14%', icon: TrendingUp, color: 'blue' },
                                        { label: 'Search Clicks', value: '842', change: '+8%', icon: MousePointer2, color: 'emerald' },
                                        { label: 'Map Directions', value: '156', change: '+22%', icon: Navigation2, color: 'indigo' },
                                    ].map((metric, i) => (
                                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[var(--color-outline-variant)]/10 shadow-sm relative overflow-hidden group hover:border-blue-500/20 transition-all">
                                            <div className={cn("absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform", metric.color === 'blue' ? 'text-blue-600' : metric.color === 'emerald' ? 'text-emerald-600' : 'text-indigo-600')}>
                                                <metric.icon size={80} />
                                            </div>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{metric.label}</p>
                                                <div className={cn("flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full", metric.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
                                                    <ArrowUpRight size={10} /> {metric.change}
                                                </div>
                                            </div>
                                            <h4 className="text-4xl font-black tracking-tighter italic">{metric.value}</h4>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Chart Area */}
                                <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[3rem] p-10 shadow-sm space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-black italic tracking-tighter">Visibility Trend</h4>
                                            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-1">Google Search Console • Last 30 Days</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-[10px] font-black uppercase bg-white">Web</Button>
                                            <Button variant="outline" size="sm" className="rounded-full h-9 px-4 text-[10px] font-black uppercase opacity-40 bg-white">Images</Button>
                                        </div>
                                    </div>

                                    <div className="h-64 w-full relative group">
                                        {/* Mock SVG Chart */}
                                        <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d="M0,150 Q100,120 200,140 T400,100 T600,80 T800,110 T1000,60 L1000,200 L0,200 Z"
                                                fill="url(#chartGradient)"
                                            />
                                            <path
                                                d="M0,150 Q100,120 200,140 T400,100 T600,80 T800,110 T1000,60"
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                            />
                                            {/* Data Points */}
                                            {[200, 400, 600, 800].map((x, i) => (
                                                <circle key={i} cx={x} cy={x === 200 ? 140 : x === 400 ? 100 : x === 600 ? 80 : 110} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
                                            ))}
                                        </svg>
                                        <div className="absolute inset-0 flex items-end justify-between px-2 pt-10 pointer-events-none opacity-20">
                                            {['Feb 01', 'Feb 10', 'Feb 20', 'Mar 01'].map((date, i) => (
                                                <span key={i} className="text-[10px] font-black italic">{date}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Keyword Rankings */}
                                    <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                                <SearchCode size={20} />
                                            </div>
                                            <h5 className="font-black italic tracking-tighter">Top Search Queries</h5>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { term: 'best stores near me', rank: '#2', vol: '1.2K' },
                                                { term: formData.name || currentBusiness.name, rank: '#1', vol: '840' },
                                                { term: 'online shopping apps', rank: '#8', vol: '2.4K' },
                                                { term: 'premium gifts', rank: '#4', vol: '420' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-black/5 hover:bg-white hover:shadow-md transition-all cursor-default">
                                                    <span className="text-xs font-bold">{item.term}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-blue-600">{item.rank}</span>
                                                        <span className="text-[10px] font-bold opacity-30">{item.vol} /mo</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Device Distribution */}
                                    <div className="bg-white border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Smartphone size={20} />
                                            </div>
                                            <h5 className="font-black italic tracking-tighter">Device Performance</h5>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic opacity-40">
                                                    <div className="flex items-center gap-1">
                                                        <Smartphone size={10} /> Mobile
                                                    </div>
                                                    <span>82%</span>
                                                </div>
                                                <div className="h-2 w-full bg-purple-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '82%' }} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic opacity-40">
                                                    <div className="flex items-center gap-1">
                                                        <Monitor size={10} /> Desktop
                                                    </div>
                                                    <span>15%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gray-400 rounded-full" style={{ width: '15%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Connect Search Console Action */}
                                <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white flex flex-col items-center text-center space-y-6">
                                    <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center border border-white/10">
                                        <SearchCode size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-xl font-black italic tracking-tight">Unlock Search Console Data</h5>
                                        <p className="text-sm text-white/50 max-w-sm">
                                            Connect your domain to Bized to see exactly what keywords customers use to find your store.
                                        </p>
                                    </div>
                                    <Button className="h-14 rounded-2xl bg-white text-black font-black text-sm px-10 hover:bg-neutral-100">
                                        Connect Search Console
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Panel - Google Preview (Simulator) */}
            <div className="w-[440px] border-l border-[var(--color-outline-variant)]/20 bg-gray-50 flex flex-col flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="p-6 border-b border-[var(--color-outline-variant)]/10 bg-white/80 backdrop-blur-md relative z-10 flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-[var(--color-on-surface-variant)] opacity-50 uppercase tracking-[0.2em]">Google Simulator</h2>
                    <div className="flex gap-1.5 font-bold text-[9px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 italic">
                        <Check size={10} /> Live Preview
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center gap-10 relative z-10 scrollbar-none">
                    {/* Header Controls for Preview */}
                    <div className="w-full flex justify-center gap-6 mb-2">
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Globe size={20} />
                            </div>
                            <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Web</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100/50 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                                <MapPin size={20} />
                            </div>
                            <span className="text-[9px] font-black opacity-10 uppercase tracking-widest">Maps</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-pointer opacity-20">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100/50 flex items-center justify-center">
                                <Search size={20} />
                            </div>
                            <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Ads</span>
                        </div>
                    </div>

                    <div className="w-full space-y-6">
                        <div className="px-2">
                            <p className="text-[10px] font-black italic text-gray-400 mb-4 opacity-70 flex items-center gap-2">
                                <ExternalLink size={12} /> SEARCH RESULT SIMULATION
                            </p>
                            <GoogleSearchPreview
                                name={formData.name || currentBusiness?.name || ""}
                                url={`${currentBusiness?.slug || 'shop'}.bized.app`}
                                description={formData.description || currentBusiness?.description || 'Welcome to our premium storefront.'}
                            />
                        </div>

                        <div className="w-full bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-black/5 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                                <MapPin size={100} />
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <h5 className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Maps Visualizer</h5>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-40" />
                                </div>
                            </div>
                            <div className="aspect-[4/3] bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center overflow-hidden relative group-hover:shadow-inner transition-all">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                                <MapPin size={40} className="text-blue-500 drop-shadow-2xl animate-bounce duration-1000" />
                                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-black/5 shadow-lg flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-[10px] italic">B</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-bold truncate">{formData.name || currentBusiness?.name || ""}</p>
                                        <p className="text-[8px] opacity-50 truncate">{formData.address || 'Location pending'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center justify-between">
                                    <h6 className="font-black text-sm italic tracking-tight">{formData.name || currentBusiness?.name || ""}</h6>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} className="text-yellow-400 fill-yellow-400" />)}
                                    </div>
                                </div>
                                <p className="text-[10px] opacity-40 leading-tight block truncate">{formData.address || 'Define store location to see on Local Search'}</p>
                                <div className="flex items-center gap-2 pt-1 font-bold">
                                    <span className="text-[9px] text-emerald-600">Open now</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span className="text-[9px] text-gray-500">{currentBusiness?.reviews?.length || 12} Reviews</span>
                                </div>
                            </div>
                        </div>

                        {/* Google Review Cards Preview */}
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black italic text-gray-400 opacity-70 uppercase tracking-widest">Recent Feedback</p>
                                <Button variant="text" size="sm" className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 p-0 h-auto">View all</Button>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                                {((currentBusiness?.reviews?.length || 0) > 0 ? currentBusiness?.reviews : [
                                    { author: 'James K.', body: 'Amazing service and very fast delivery. Highly recommended!', rating: 5 },
                                    { author: 'Sarah L.', body: 'The storefront looks beautiful. Love the experience.', rating: 4 }
                                ])?.map((rev, i) => (
                                    <div key={i} className="min-w-[280px] bg-white rounded-3xl p-5 shadow-sm border border-black/5 snap-center space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">{rev?.author?.charAt(0)}</div>
                                            <div>
                                                <p className="text-[10px] font-bold leading-none">{rev.author}</p>
                                                <div className="flex gap-0.5 mt-1">
                                                    {[...Array(5)].map((_, j) => <Star key={j} size={7} className={j < (rev.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />)}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] leading-relaxed italic opacity-60 line-clamp-2">"{rev.body}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Google Shopping Product Preview */}
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black italic text-gray-400 opacity-70 uppercase tracking-widest">Shopping Preview</p>
                                <div className="text-[10px] font-black text-blue-600 flex items-center gap-1">
                                    <Tag size={10} /> Local Inventory
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5 space-y-5 group overflow-hidden">
                                <div className="aspect-square bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden relative">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 font-black text-4xl rotate-12">{formData.name?.charAt(0) || 'B'}</div>
                                    <div className="absolute top-4 right-4 h-6 px-3 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-lg shadow-blue-500/20">Google Choice</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h6 className="font-bold text-[13px] tracking-tight group-hover:text-blue-600 transition-colors">Premium Business Package</h6>
                                        <p className="font-black text-sm">$49.00</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} className="text-yellow-400 fill-yellow-400" />)}
                                        </div>
                                        <span className="text-[9px] opacity-40 font-bold">(48)</span>
                                    </div>
                                    <div className="pt-4 flex gap-4">
                                        <Button className="flex-1 h-12 rounded-xl bg-black text-white font-black text-xs gap-2">
                                            Add to Cart
                                        </Button>
                                        <Button variant="outline" className="h-12 w-12 rounded-xl border-black/5 bg-gray-50 flex items-center justify-center">
                                            <Heart size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-br from-gray-900 to-black text-white w-full shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/30 transition-colors" />
                        <div className="relative z-10 flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-400 shadow-inner border border-white/5">
                                <BarChart3 size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black italic tracking-widest text-white/40 uppercase">Visibility Pulse</p>
                                <p className="text-xs font-bold mt-0.5">Profile Intensity: <span className="text-blue-400">Superior</span></p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-1.5 relative z-10">
                            <div className="flex justify-between text-[9px] font-black opacity-30 italic">
                                <span>Optimization Level</span>
                                <span>94%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "94%" }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SuccessModal message={successMessage || ""} onClose={() => setSuccessMessage(null)} />
            <ErrorModal message={error || ""} onClose={() => setError(null)} />

            {/* ── Auto Sync Modal ── */}
            <AnimatePresence>
                {showAutoSyncModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAutoSyncModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Auto Sync</p>
                                    <h3 className="text-xl font-black italic text-white tracking-tight">Select Google Profile</h3>
                                </div>
                                <button onClick={() => setShowAutoSyncModal(false)} className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3}><path d="M18 6 6 18M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                                {/* Quota Warning Banner */}
                                {gbpQuotaWarning && (
                                    <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-amber-800">API Rate Limit Hit</p>
                                            <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                                                {gbpProfiles.length > 0 ? "Showing cached results. " : ""}Google limits how often you can fetch profiles. Wait ~1 minute then try again, or <a href="https://console.cloud.google.com/iam-admin/quotas" target="_blank" rel="noopener" className="font-bold underline">increase your quota</a> in Cloud Console.
                                            </p>
                                            <button onClick={() => fetchGBPProfiles(true)} className="mt-2 text-[10px] font-black text-amber-700 hover:text-amber-900 underline flex items-center gap-1">
                                                <RefreshCw size={10} /> Force Refresh Now
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isLoadingProfiles ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                                        <Loader2 size={40} className="animate-spin text-emerald-500" />
                                        <p className="text-sm font-bold text-gray-400">Fetching your Google Business Profiles...</p>
                                    </div>
                                ) : gbpProfiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
                                            <MapPin size={32} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-700">No Profiles Found</p>
                                            <p className="text-xs text-gray-400 mt-1">No Google Business Profiles are linked to this account. Enter your IDs manually below.</p>
                                        </div>
                                    </div>
                                ) : (
                                    gbpProfiles.map((account) => (
                                        <div key={account.accountId} className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <User size={10} />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{account.accountName}</p>
                                                <span className="text-[8px] font-mono text-gray-300">{account.accountId}</span>
                                            </div>

                                            {account.locations.length === 0 ? (
                                                <p className="text-[10px] text-gray-400 px-2 italic">No locations found for this account.</p>
                                            ) : (
                                                account.locations.map((loc: any) => (
                                                    <button
                                                        key={loc.name}
                                                        onClick={() => handleSelectProfile(account.accountId, loc.name)}
                                                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                                                            <MapPin size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm truncate">{loc.title || loc.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-mono truncate">{loc.name}</p>
                                                            {loc.storefrontAddress?.addressLines?.[0] && (
                                                                <p className="text-[10px] text-gray-400 truncate">{loc.storefrontAddress.addressLines[0]}</p>
                                                            )}
                                                        </div>
                                                        <Check size={16} className="text-gray-200 group-hover:text-emerald-500 transition-colors shrink-0" />
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Guide Side Sheet ── */}
            <AnimatePresence>
                {showGuideSheet && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGuideSheet(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Helper Guide</p>
                                    <h3 className="text-xl font-black italic tracking-tight">
                                        Find {guideType === "profile" ? "Profile ID" : "Account ID"}
                                    </h3>
                                </div>
                                <button onClick={() => setShowGuideSheet(false)} className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">

                                {guideType === "profile" ? (
                                    <>
                                        {/* Profile ID Guide */}
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                                                <Info size={16} />
                                            </div>
                                            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                                This guide helps you find the <strong>Business Profile ID</strong> in the current Google management interface.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { step: 1, title: "Go to Dashboard", text: "Open business.google.com/locations", link: "https://business.google.com/locations" },
                                                {
                                                    step: 2,
                                                    title: "Select Profile",
                                                    text: "Click 'See my profile' for the business you want.",
                                                    node: (
                                                        <div className="mt-4 mb-2 flex justify-start">
                                                            <div className="bg-white border border-[#dadce0] rounded-lg px-4 py-2.5 flex items-center gap-2.5 shadow-sm opacity-90 cursor-default select-none">
                                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                                                                </svg>
                                                                <span className="text-[#1a73e8] font-medium text-[13px] tracking-tight">See your profile</span>
                                                            </div>
                                                        </div>
                                                    )
                                                },
                                                { step: 3, title: "Open Settings", text: "Click the Three Dots Menu (⋮) in the management row." },
                                                { step: 4, title: "Advanced Settings", text: "Go to Business Profile settings → Advanced settings." },
                                                { step: 5, title: "Copy ID", text: "Copy the Profile ID number at the top." }
                                            ].map((s: any) => (
                                                <div key={s.step} className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-[10px] shrink-0">{s.step}</div>
                                                        <h4 className="font-black tracking-tight text-xs">{s.title}</h4>
                                                    </div>
                                                    <div className="ml-9">
                                                        <p className="text-[11px] text-gray-500">{s.text}</p>
                                                        {s.link && (
                                                            <a href={s.link} target="_blank" className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-black text-blue-600 hover:underline">
                                                                Open Google <ExternalLink size={10} />
                                                            </a>
                                                        )}
                                                        {s.node}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Auto-Sync Recommendation Block */}
                                        <div className="bg-emerald-900 border border-black/20 rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-2xl shadow-emerald-900/40 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                            <div className="flex gap-5 relative z-10">
                                                <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-md">
                                                    <Zap size={24} fill="currentColor" strokeWidth={0} />
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    <h4 className="text-[15px] text-white font-black tracking-tight leading-tight italic uppercase">Wait! Use Auto-Find</h4>
                                                    <p className="text-[12px] text-emerald-50/60 font-medium leading-relaxed">
                                                        You're right—finding this ID manually is very difficult. We can fetch it for you automatically.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setShowGuideSheet(false);
                                                    setTimeout(() => fetchGBPProfiles(), 300);
                                                }}
                                                className="w-full h-14 rounded-3xl bg-white hover:bg-emerald-50 text-emerald-900 font-black text-sm transition-all flex items-center justify-center gap-3 relative z-10 shadow-xl shadow-black/20 active:scale-[0.98]"
                                            >
                                                <Search size={18} />
                                                Browse My Google Profiles
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 px-2 py-4">
                                            <div className="h-px flex-1 bg-gray-100" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Choose manual path</span>
                                            <div className="h-px flex-1 bg-gray-100" />
                                        </div>

                                        <div className="space-y-6">
                                            {/* Choice Card 1: URL Extraction (Manual) */}
                                            <div className="p-5 rounded-3xl bg-zinc-50 border border-zinc-200 hover:border-blue-200 transition-all group">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-black/10">1</div>
                                                    <h4 className="font-black text-xs uppercase tracking-tight text-gray-900">Manual Lookup (From URL)</h4>
                                                </div>
                                                <p className="text-[12px] text-gray-500 ml-11 leading-relaxed font-medium">
                                                    Open your dashboard. Look at the URL in your address bar:
                                                </p>
                                                <div className="ml-11 mt-3 p-3 bg-zinc-900 rounded-2xl font-mono text-[10px] text-zinc-400 select-all border border-white/5 relative overflow-hidden group/url">
                                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/url:opacity-100 transition-opacity" />
                                                    ...manage/<strong>accounts/<span className="text-blue-400 font-bold">1023160...</span></strong>
                                                </div>
                                                <p className="text-[10px] text-amber-600 ml-11 mt-3 font-bold italic">
                                                    Note: Merchant IDs are different and will not work here.
                                                </p>
                                            </div>

                                            {/* Choice Card 2: Organization Settings */}
                                            <div className="p-5 rounded-3xl bg-zinc-50 border border-zinc-200 hover:border-emerald-200 transition-all">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-black/10">2</div>
                                                    <h4 className="font-black text-xs uppercase tracking-tight text-gray-900">Organization Settings</h4>
                                                </div>
                                                <p className="text-[12px] text-gray-500 ml-11 leading-relaxed font-medium">
                                                    If you have a <strong>Business Account</strong> (Organization), the ID is listed under your account name on the dashboard home.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Shared Input Section */}
                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2.5rem] space-y-5">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-1">
                                                {guideType === "profile" ? "Paste Profile ID (locations/...)" : "Paste Account ID (accounts/...)"}
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-4 flex items-center text-zinc-300 group-focus-within:text-blue-500 transition-colors">
                                                    <Hash size={14} />
                                                </div>
                                                <input
                                                    value={guideType === "profile" ? helperProfileId : helperAccountId}
                                                    onChange={e => guideType === "profile" ? setHelperProfileId(e.target.value) : setHelperAccountId(e.target.value)}
                                                    placeholder={guideType === "profile" ? "locations/123..." : "accounts/123..."}
                                                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-zinc-100 outline-none text-[13px] font-mono bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={applyHelperData}
                                            disabled={guideType === "profile" ? !helperProfileId : !helperAccountId}
                                            className="w-full h-14 rounded-3xl bg-gray-900 hover:bg-black text-white font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-30 group/btn relative overflow-hidden shadow-xl shadow-black/10 active:scale-[0.98]"
                                        >
                                            <Check size={18} strokeWidth={3} />
                                            Apply to Form
                                        </button>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                                        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-amber-700 leading-relaxed">
                                            Note: You must be a <strong>Manager or Owner</strong> of this profile to sync data.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => setShowGuideSheet(false)}
                                        className="w-full h-12 rounded-2xl bg-gray-100 text-gray-900 border-none font-black text-sm hover:bg-gray-200 transition-all"
                                    >
                                        Got it
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
