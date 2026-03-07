"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, ShieldCheck, Zap, Save, Loader2, Globe, Mail, MapPin, AlignLeft, Info, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const VERTICAL_OPTIONS = [
    "UNDEFINED",
    "OTHER",
    "AUTO",
    "BEAUTY",
    "APPAREL",
    "EDUCATION",
    "ENTERTAIN",
    "EVENT_PLAN",
    "FINANCE",
    "GROCERY",
    "GOVT",
    "HOTEL",
    "HEALTH",
    "NON_PROFIT",
    "PROF_SERVICES",
    "RETAIL",
    "TRAVEL",
    "RESTAURANT"
];

export default function HQWabaProfile() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [profile, setProfile] = useState({
        about: "",
        address: "",
        description: "",
        email: "",
        vertical: "OTHER",
        websites: [""] as string[],
        display_phone_number: "",
        profile_picture_url: "",
        quality_rating: "",
        status: "",
        business_name: "",
        display_name: ""
    });

    const fetchProfile = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch("/api/hq/wabaprofile");
            const data = await res.json();

            if (data.error) {
                setMessage({ type: "error", text: data.error });
            } else {
                setProfile({
                    about: data.about || "",
                    address: data.address || "",
                    description: data.description || "",
                    email: data.email || "",
                    vertical: data.vertical || "OTHER",
                    websites: data.websites && data.websites.length > 0 ? data.websites : [""],
                    display_phone_number: data.display_phone_number || "",
                    profile_picture_url: data.profile_picture_url || "",
                    quality_rating: data.quality_rating || "UNKNOWN",
                    status: data.status || "UNKNOWN",
                    business_name: data.business_name || "Platform WABA",
                    display_name: data.display_phone_number || ""
                });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to load WABA profile." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            // Filter empty websites
            const cleanedProfile = {
                ...profile,
                websites: profile.websites.filter(w => w.trim() !== "")
            };

            const res = await fetch("/api/hq/wabaprofile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedProfile)
            });

            const data = await res.json();
            if (data.error) {
                setMessage({ type: "error", text: data.error });
            } else {
                setMessage({ type: "success", text: "Profile updated successfully!" });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update profile." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 opacity-50">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="font-bold italic text-neutral-400">Loading Bized WABA Profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-2xl overflow-hidden group">
                            {profile.profile_picture_url ? (
                                <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                                <MessageSquare size={32} />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center shadow-lg">
                            <div className={cn(
                                "w-3 h-3 rounded-full animate-pulse",
                                profile.quality_rating === "GREEN" ? "bg-emerald-500" : "bg-yellow-500"
                            )} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-white">{profile.business_name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">{profile.display_phone_number}</span>
                            <span className="text-neutral-700">•</span>
                            <span className="text-neutral-500 font-bold text-xs uppercase tracking-widest">{profile.quality_rating} QUALITY</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchProfile}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all shadow-inner"
                    title="Refresh profile"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Status Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h5 className="font-black italic text-indigo-400 tracking-tight text-sm uppercase">Cloud API Identity</h5>
                        <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                            This profile is shared across all official "Bized" communications. Updates take immediate effect on Global networks.
                        </p>
                    </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h5 className="font-black italic text-emerald-500 tracking-tight text-sm uppercase">System Authority</h5>
                        <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                            Verified account profile. Ensure Bized branding guidelines are followed to avoid account suspension from Meta.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm",
                            message.type === "success"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                : "bg-red-500/10 border-red-500/30 text-red-500"
                        )}
                    >
                        {message.type === "success" ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </motion.div>
                )}

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Side: Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 ml-1 flex items-center gap-2">
                                    <Info size={12} className="text-indigo-500" /> WhatsApp Status (About)
                                </label>
                                <input
                                    type="text"
                                    maxLength={139}
                                    value={profile.about}
                                    onChange={e => setProfile({ ...profile, about: e.target.value })}
                                    className="w-full h-14 bg-neutral-950 border border-neutral-800 rounded-2xl px-5 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-neutral-700 font-medium"
                                    placeholder="Available, Busy, or a short tagline..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 ml-1 flex items-center gap-2">
                                    <AlignLeft size={12} className="text-indigo-500" /> Business Description
                                </label>
                                <textarea
                                    maxLength={512}
                                    rows={4}
                                    value={profile.description}
                                    onChange={e => setProfile({ ...profile, description: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-neutral-700 font-medium resize-none leading-relaxed"
                                    placeholder="Comprehensive description of the Bized Platform..."
                                />
                            </div>
                        </div>

                        {/* Right Side: Contact & Category */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 ml-1 flex items-center gap-2">
                                    <MapPin size={12} className="text-indigo-500" /> Business Address
                                </label>
                                <input
                                    type="text"
                                    maxLength={256}
                                    value={profile.address}
                                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                                    className="w-full h-14 bg-neutral-950 border border-neutral-800 rounded-2xl px-5 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-neutral-700 font-medium"
                                    placeholder="Physical address..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 ml-1 flex items-center gap-2">
                                    <Mail size={12} className="text-indigo-500" /> Business Email
                                </label>
                                <input
                                    type="email"
                                    maxLength={128}
                                    value={profile.email}
                                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full h-14 bg-neutral-950 border border-neutral-800 rounded-2xl px-5 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-neutral-700 font-medium"
                                    placeholder="support@bized.app"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 ml-1 flex items-center gap-2">
                                    <MessageSquare size={12} className="text-emerald-500" /> Public Business Name
                                </label>
                                <input
                                    type="text"
                                    maxLength={30}
                                    value={profile.display_name}
                                    onChange={e => setProfile({ ...profile, display_name: e.target.value })}
                                    className="w-full h-14 bg-neutral-950 border border-emerald-500/30 rounded-2xl px-5 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-700 font-bold"
                                    placeholder="e.g. Bized App"
                                />
                                <p className="text-[10px] text-neutral-600 font-medium ml-1">
                                    Note: Changes to this name trigger a Meta review process.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 ml-1 flex items-center gap-2">
                                    <ShieldCheck size={12} className="text-indigo-500" /> Business Vertical (Category)
                                </label>
                                <select
                                    value={profile.vertical}
                                    onChange={e => setProfile({ ...profile, vertical: e.target.value })}
                                    className="w-full h-14 bg-neutral-950 border border-neutral-800 rounded-2xl px-5 text-white focus:border-indigo-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                                >
                                    {VERTICAL_OPTIONS.map(v => (
                                        <option key={v} value={v} className="bg-neutral-950 text-white font-bold">{v}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500 ml-1 flex items-center gap-2">
                            <Globe size={12} className="text-indigo-500" /> Official Websites (Max 2)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[0, 1].map((idx) => (
                                <input
                                    key={idx}
                                    type="url"
                                    value={profile.websites[idx] || ""}
                                    onChange={e => {
                                        const newWebsites = [...profile.websites];
                                        newWebsites[idx] = e.target.value;
                                        setProfile({ ...profile, websites: newWebsites });
                                    }}
                                    className="w-full h-14 bg-neutral-950 border border-neutral-800 rounded-2xl px-5 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-neutral-700 font-medium"
                                    placeholder={`https://website-${idx + 1}.com`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={cn(
                                "h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all",
                                isSaving
                                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-600/20"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Update Portal Identity
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Info size={20} />
                </div>
                <div className="text-xs text-neutral-500 leading-relaxed font-medium">
                    Changes made here update the profile visible to customers when they interact with the official Bized WhatsApp Business account.
                    Profile pictures must be managed separately in the Meta Business Manager due to API upload restrictions.
                </div>
            </div>
        </div>
    );
}
