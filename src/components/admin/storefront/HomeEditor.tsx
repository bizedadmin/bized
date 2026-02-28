import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Store, Check, Loader2,
    Globe, Briefcase, Phone, Mail, MapPin, MessageSquare,
    Instagram, Facebook, Search, Image as ImageIcon,
    ChevronRight, Camera, UserCircle, Type,
    Clock, Hash, X, Upload, Edit2, ShoppingBag, ExternalLink
} from "lucide-react";
import { ImageEditor } from "@/components/ui/ImageEditor";
import {
    useBusiness,
    type Business,
} from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface FieldConfig {
    key: string;
    label: string;
    icon: React.ReactNode;
    type?: "text" | "color" | "url" | "email" | "tel" | "textarea";
    placeholder?: string;
    helpText?: string;
}

interface SectionConfig {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    /** For simple key-value editing */
    fields: FieldConfig[];
}

/* ═══════════════════════════════════════════════════════════════
   SECTION DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS: SectionConfig[] = [
    {
        id: "cover", title: "Cover Photo", icon: <ImageIcon size={20} />,
        description: "The banner image at the top of your storefront.",
        fields: [
            { key: "coverPhotoUrl", label: "Cover Photo", icon: <ImageIcon size={13} />, type: "url", helpText: "Recommended: 1200×400px" },
        ],
    },
    {
        id: "profilePic", title: "Profile Picture", icon: <Camera size={20} />,
        description: "Your business logo or avatar.",
        fields: [
            { key: "logoUrl", label: "Profile Picture", icon: <UserCircle size={13} />, type: "url", helpText: "Recommended: 512×512px, square" },
        ],
    },
    {
        id: "bio", title: "Bio", icon: <Type size={20} />,
        description: "Your business name, title, and tagline.",
        fields: [
            { key: "name", label: "Name", icon: <Store size={13} />, placeholder: "Your business name" },
            { key: "slug", label: "URL Handle", icon: <Hash size={13} />, placeholder: "your-store-slug", helpText: "bized.app/your-slug" },
            { key: "title", label: "Title", icon: <Type size={13} />, placeholder: "e.g. Award-Winning Coffee Roasters" },
            { key: "subtitle", label: "Subtitle", icon: <Hash size={13} />, placeholder: "e.g. Est. 2015 · Nairobi" },
            { key: "description", label: "Description", icon: <Briefcase size={13} />, type: "textarea", placeholder: "Tell customers about your business..." },
        ],
    },
    {
        id: "featuredProducts", title: "Featured Products", icon: <Store size={20} />,
        description: "Highlight up to 5 products on your home page. Note: Products must be managed in the Catalog tab.",
        fields: [], // We'll handle this conceptually or just as a placeholder since it's driven by Catalog
    },
    {
        id: "openingHours", title: "Opening Hours", icon: <Clock size={20} />,
        description: "When your business is open to customers.",
        fields: [
            { key: "openingHours", label: "Opening Hours", icon: <Clock size={13} />, placeholder: "e.g. Mon-Fri 8am-6pm, Sat 9am-4pm", helpText: "Displayed on your storefront" },
        ],
    },
    {
        id: "contact", title: "Contact Information", icon: <Phone size={20} />,
        description: "How customers can reach you.",
        fields: [
            { key: "phone", label: "Phone", icon: <Phone size={13} />, type: "tel", placeholder: "+254 700 123 456" },
            { key: "email", label: "Email", icon: <Mail size={13} />, type: "email", placeholder: "hello@yourbusiness.com" },
            { key: "website", label: "Website", icon: <Globe size={13} />, type: "url", placeholder: "https://yourbusiness.com" },
        ],
    },
    {
        id: "location", title: "Location", icon: <MapPin size={20} />,
        description: "Your business address.",
        fields: [
            { key: "address", label: "Street Address", icon: <MapPin size={13} />, placeholder: "123 Main Street" },
            { key: "city", label: "City", icon: <MapPin size={13} />, placeholder: "Nairobi" },
            { key: "country", label: "Country", icon: <Globe size={13} />, placeholder: "Kenya" },
        ],
    },
    {
        id: "socialNetworks", title: "Social Networks", icon: <Instagram size={20} />,
        description: "Your social media profiles and messaging.",
        fields: [
            { key: "socialLinks.whatsapp", label: "WhatsApp", icon: <MessageSquare size={13} />, placeholder: "+254700123456", helpText: "Include country code" },
            { key: "socialLinks.instagram", label: "Instagram", icon: <Instagram size={13} />, placeholder: "@yourbusiness" },
            { key: "socialLinks.facebook", label: "Facebook", icon: <Facebook size={13} />, placeholder: "facebook.com/page" },
            { key: "socialLinks.google", label: "Google Business", icon: <Search size={13} />, placeholder: "Google Maps link" },
        ],
    },
];

/* ═══════════════════════════════════════════════════════════════
   PROFILE CARD (READ-ONLY)
   ═══════════════════════════════════════════════════════════════ */

function ProfileCard({ section, business, onEdit }: { section: SectionConfig; business: Business; onEdit: () => void }) {
    const previews = section.fields.slice(0, 3).map((f) => {
        const keys = f.key.split(".");
        let val: any = business;
        for (const k of keys) val = val?.[k];
        return { label: f.label, value: val || null, type: f.type };
    });

    const filledCount = section.fields.filter((f) => {
        const keys = f.key.split(".");
        let val: any = business;
        for (const k of keys) val = val?.[k];
        return !!val;
    }).length;
    const totalFields = section.fields.length;

    return (
        <button onClick={onEdit} className="group text-left w-full rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/5 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] flex items-center justify-center transition-colors shadow-sm">
                            {section.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--color-on-surface)] text-base">{section.title}</h3>
                            {totalFields > 0 && (
                                <p className="text-[11px] text-[var(--color-on-surface-variant)] opacity-60 mt-0.5">
                                    {filledCount}/{totalFields} fields completed
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-primary)] bg-[var(--color-primary)]/5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                        <ChevronRight size={18} />
                    </div>
                </div>

                {previews.length > 0 && (
                    <div className="space-y-2 mt-4 pl-16">
                        {previews.map((p) => {
                            const isImage = p.label === "Cover Photo" || p.label === "Profile Picture";
                            if (isImage && p.value) return null;

                            return (
                                <div key={p.label} className="flex items-center gap-2">
                                    {p.type === "color" && p.value && <span className="w-3 h-3 rounded-full border border-[var(--color-outline-variant)]/20 flex-shrink-0 shadow-sm" style={{ backgroundColor: p.value }} />}
                                    <span className={`text-xs truncate ${p.value ? "text-[var(--color-on-surface-variant)]" : "text-[var(--color-on-surface-variant)] opacity-30 italic"}`}>
                                        {p.value || p.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {totalFields > 0 && (
                <div className="h-1 bg-[var(--color-surface-container-high)]">
                    <div className="h-full bg-[var(--color-primary)] transition-all duration-700" style={{ width: `${(filledCount / totalFields) * 100}%` }} />
                </div>
            )}
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SHEET COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FieldSheetContent({ section, business, onSave, onClose }: {
    section: SectionConfig; business: Business;
    onSave: (fields: Partial<Business>) => Promise<boolean>; onClose: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [values, setValues] = useState<Record<string, string>>({});
    const [editingImage, setEditingImage] = useState<{ key: string, url: string } | null>(null);
    const [uploadingImageKey, setUploadingImageKey] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const v: Record<string, string> = {};
        section.fields.forEach((f) => {
            const keys = f.key.split(".");
            let val: any = business;
            for (const k of keys) val = val?.[k];
            v[f.key] = val || "";
        });
        setValues(v);
    }, [section, business]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
        const file = e.target.files?.[0];
        if (!file || !business.slug) return;

        setUploading(fieldKey);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", business.slug);

        try {
            const endpoint = fieldKey === "logoUrl" ? "/api/upload/logo" : "/api/upload/cover";
            const res = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const { url } = await res.json();
            setValues(v => ({ ...v, [fieldKey]: url }));
            // Auto-save the new URL to the business
            await onSave({ [fieldKey]: url });
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(null);
        }
    };

    const handleUploadEditedImage = async (dataUrl: string, key: string) => {
        if (!business.slug) return;
        setUploadingImageKey(key);
        setUploading(key); // Use existing uploading state for UI blocking

        try {
            const blob = await (await fetch(dataUrl)).blob();
            const formData = new FormData();
            formData.append("file", blob, "edited-image.webp");
            formData.append("slug", business.slug);

            const endpoint = key === "logoUrl" ? "/api/upload/logo" : "/api/upload/cover";
            const res = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const { url } = await res.json();

            // Update local state and save to DB
            const nextValues = { ...values, [key]: url };
            setValues(nextValues);
            await onSave({ [key]: url });

        } catch (err) {
            console.error("Upload edited image error:", err);
            alert("Failed to save edited image. Please try again.");
        } finally {
            setUploadingImageKey(null);
            setUploading(null);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const update: Record<string, any> = {};
        for (const [key, value] of Object.entries(values)) {
            const keys = key.split(".");
            if (keys.length === 1) { update[key] = value; }
            else {
                if (!update[keys[0]]) update[keys[0]] = { ...((business as any)[keys[0]] || {}) };
                update[keys[0]][keys[1]] = value;
            }
        }
        const ok = await onSave(update);
        setSaving(false);
        if (ok) {
            setSaved(true);
            setTimeout(() => { setSaved(false); onClose(); }, 800);
        } else {
            console.error("Failed to save bio changes");
            alert("Failed to save changes. Please check your internet connection or try a different store link.");
        }
    };

    if (section.id === "featuredProducts") {
        return (
            <div className="space-y-6 text-center py-10">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
                    <Store size={32} />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Featured Products</h3>
                <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70 max-w-sm mx-auto">
                    Manually select products as "Featured" in your catalog to show them here. If none are selected, your latest 5 products will be shown automatically.
                </p>
                <div className="pt-6 flex flex-col gap-3">
                    <Link
                        href="/admin/products"
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={18} /> Manage Products
                    </Link>
                    <Link
                        href={business.slug ? `/${business.slug}/shop` : "#"}
                        target="_blank"
                        className="w-full py-4 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-bold hover:bg-[var(--color-surface-container-highest)] transition-all flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={18} /> View Shop Page
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {section.fields.map(f => {
                const isImage = f.key === "coverPhotoUrl" || f.key === "logoUrl";
                const isUploading = uploading === f.key;

                return (
                    <div key={f.key} className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50 flex items-center gap-2">{f.icon}{f.label}</label>

                        {isImage ? (
                            <div className="space-y-3">
                                <div className={cn(
                                    "relative w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden bg-[var(--color-surface-container-low)]",
                                    values[f.key] ? "aspect-[3/1] border-transparent" : "aspect-[3/1] border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary)]/50"
                                )}>
                                    {values[f.key] ? (
                                        <>
                                            <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${values[f.key]})` }} />
                                            <div className="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-2">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-4 py-2 rounded-xl bg-white text-black font-bold text-sm flex items-center gap-2 shadow-lg"
                                                >
                                                    <Upload size={16} /> Replace
                                                </button>
                                                <button
                                                    onClick={() => setEditingImage({ key: f.key, url: values[f.key] })}
                                                    className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm flex items-center gap-2 shadow-lg"
                                                >
                                                    <Edit2 size={16} /> Edit
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex flex-col items-center gap-2 text-[var(--color-on-surface-variant)] opacity-60 hover:opacity-100 transition-all font-medium"
                                        >
                                            {isUploading ? (
                                                <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container-highest)] flex items-center justify-center mb-1">
                                                    <Upload size={24} />
                                                </div>
                                            )}
                                            <span className="text-sm">{isUploading ? "Uploading..." : "Click to upload"}</span>
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, f.key)}
                                    />
                                </div>
                            </div>
                        ) : f.type === "textarea" ? (
                            <textarea value={values[f.key] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} rows={4} className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 focus:border-[var(--color-primary)] outline-none text-sm resize-none" />
                        ) : (
                            <input type={f.type || "text"} value={values[f.key] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 focus:border-[var(--color-primary)] outline-none text-sm" />
                        )}
                    </div>
                );
            })}
            <div className="mt-10 pt-6 border-t border-[var(--color-outline-variant)]/15 flex items-center gap-3">
                <button onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving || !!uploading} className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${saved ? "bg-emerald-500 text-white" : "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary)]/20"} disabled:opacity-50`}>
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : saved ? <><Check size={16} /> Saved!</> : <><Check size={16} /> Save changes</>}
                </button>
            </div>

            {
                editingImage && (
                    <ImageEditor
                        imageUrl={editingImage.url}
                        onClose={() => setEditingImage(null)}
                        onSave={async (newUrl) => {
                            await handleUploadEditedImage(newUrl, editingImage.key);
                            setEditingImage(null);
                        }}
                        targetLayout={editingImage.key === "logoUrl" ? "profile" : editingImage.key === "coverPhotoUrl" ? "cover" : "free"}
                    />
                )
            }
        </div >
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function HomeEditor() {
    const { currentBusiness, isLoading, updateBusiness } = useBusiness();
    const [activeSection, setActiveSection] = useState<SectionConfig | null>(null);

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const tabUrl = searchParams?.get("tab");

    // Auto-open section if tab matches
    React.useEffect(() => {
        if (tabUrl && !activeSection) {
            const section = SECTIONS.find(s => s.id === tabUrl || (tabUrl === 'profile' && s.id === 'profilePic'));
            if (section) setActiveSection(section);
        }
    }, [tabUrl, activeSection]);

    if (isLoading) return <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" />)}</div>;

    if (!currentBusiness) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
                {SECTIONS.map((section) => (
                    <ProfileCard
                        key={section.id}
                        section={section}
                        business={currentBusiness}
                        onEdit={() => setActiveSection(section)}
                    />
                ))}
            </div>

            <AnimatePresence>
                {activeSection && (
                    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center sm:justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/15 backdrop-blur-sm" onClick={() => setActiveSection(null)} />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full sm:w-[500px] h-full bg-[var(--color-surface)] shadow-2xl flex flex-col">
                            <div className="p-8 border-b border-[var(--color-outline-variant)]/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3 text-[var(--color-primary)]">
                                        {activeSection.icon}
                                        <h2 className="text-xl font-bold">{activeSection.title}</h2>
                                    </div>
                                    <button onClick={() => setActiveSection(null)} className="p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors"><X size={20} /></button>
                                </div>
                                <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70">{activeSection.description}</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                                <FieldSheetContent section={activeSection} business={currentBusiness} onSave={updateBusiness} onClose={() => setActiveSection(null)} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

