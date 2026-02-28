"use client";

import React, { useState, useEffect } from "react";
import {
    MessageSquare,
    ExternalLink,
    Check,
    Loader2,
    Phone,
    Type,
    AlertCircle,
    Copy,
    Sparkles,
    ChevronRight,
    Settings,
    FileText,
    Home,
    ShoppingBag,
    Package,
    ChevronLeft,
    Edit2,
    Clock,
    Building2,
    Globe,
    Bold,
    Italic,
    Strikethrough,
    CornerDownLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/Sheet";

const PHONE_FRAME_CLASS = "w-[300px] h-[600px] rounded-[3rem] border-[8px] border-[var(--color-surface-container-highest)] bg-[#e5ddd5] shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-[var(--color-outline-variant)]/5";

const WhatsAppIcon = ({ className, size = 20, fill = "currentColor" }: { className?: string; size?: number; fill?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        style={{ fill: fill === "currentColor" ? undefined : fill }}
    >
        <path
            fill="currentColor"
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
        />
    </svg>
);

const WhatsappBubble = ({ text, time = "09:41" }: { text: string; time?: string }) => {
    // Basic WhatsApp Markdown Parser
    const renderFormattedText = (rawText: string) => {
        if (!rawText) return "Your message will appear here...";

        let formatted = rawText
            // Bold: *text*
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            // Italic: _text_
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Strikethrough: ~text~
            .replace(/~(.*?)~/g, '<del>$1</del>')
            // New lines
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

export default function WhatsappIntegrationPage() {
    const { currentBusiness, updateBusiness, isLoading: isContextLoading } = useBusiness();
    const [activeTab, setActiveTab] = useState("number");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [templates, setTemplates] = useState({
        home: "",
        shop: "",
        product: ""
    });

    // Advanced Settings State
    const [settings, setSettings] = useState({
        floatingButtonEnabled: false,
        floatingButtonPosition: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'right-middle' | 'left-middle',
        floatingButtonTooltip: 'Chat with us',
        floatingButtonStyle: 'circle-solid' as 'circle-solid' | 'circle-regular' | 'square-solid' | 'square-regular',
        floatingButtonSize: 48,
        floatingButtonLabel: 'WhatsApp Chat',
        useSchedule: false,
        hideWhenClosed: false,
    });

    // Side Sheet & Preview State
    const [editingTemplate, setEditingTemplate] = useState<{ id: 'home' | 'shop' | 'product', label: string, icon: any } | null>(null);
    const [activePreviewTab, setActivePreviewTab] = useState<'home' | 'shop' | 'product'>('home');
    const [tempMessage, setTempMessage] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentBusiness?.socialLinks) {
            setWhatsappNumber(currentBusiness.socialLinks.whatsapp || "");
            setTemplates({
                home: currentBusiness.socialLinks.whatsappTemplates?.home || currentBusiness.socialLinks.whatsappMessage || "",
                shop: currentBusiness.socialLinks.whatsappTemplates?.shop || currentBusiness.socialLinks.whatsappMessage || "",
                product: currentBusiness.socialLinks.whatsappTemplates?.product || currentBusiness.socialLinks.whatsappMessage || ""
            });
            if (currentBusiness.socialLinks.whatsappSettings) {
                setSettings({
                    floatingButtonEnabled: !!currentBusiness.socialLinks.whatsappSettings.floatingButtonEnabled,
                    floatingButtonPosition: (currentBusiness.socialLinks.whatsappSettings.floatingButtonPosition as any) || 'bottom-right',
                    floatingButtonTooltip: currentBusiness.socialLinks.whatsappSettings.floatingButtonTooltip || 'Chat with us',
                    floatingButtonStyle: (currentBusiness.socialLinks.whatsappSettings.floatingButtonStyle as any) || 'solid',
                    floatingButtonSize: currentBusiness.socialLinks.whatsappSettings.floatingButtonSize || 48,
                    floatingButtonLabel: currentBusiness.socialLinks.whatsappSettings.floatingButtonLabel || 'WhatsApp Chat',
                    useSchedule: !!currentBusiness.socialLinks.whatsappSettings.useSchedule,
                    hideWhenClosed: !!currentBusiness.socialLinks.whatsappSettings.hideWhenClosed,
                });
            }
        }
    }, [currentBusiness]);

    const handleSave = async (updatedSettings?: typeof settings, updatedTemplates?: typeof templates) => {
        if (!currentBusiness) return;

        setError(null);
        setIsSaving(true);

        const success = await updateBusiness({
            socialLinks: {
                ...currentBusiness.socialLinks,
                whatsapp: whatsappNumber,
                whatsappTemplates: updatedTemplates || templates,
                whatsappSettings: updatedSettings || settings
            }
        });

        setIsSaving(false);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } else {
            setError("Failed to save changes. Please try again.");
        }
    };

    const handleSaveNumber = async () => {
        if (whatsappNumber && !/^\+?[0-9\s-]{10,}$/.test(whatsappNumber)) {
            setError("Please enter a valid phone number with country code.");
            return;
        }
        handleSave();
    };

    const toggleSetting = (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        handleSave(newSettings);
    };

    const updateSettingField = (key: keyof typeof settings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
    };

    const openEditSheet = (id: 'home' | 'shop' | 'product', label: string, icon: any) => {
        setEditingTemplate({ id, label, icon });
        setTempMessage(templates[id]);
    };

    const insertVariable = (variable: string) => {
        setTempMessage(prev => prev + `{{${variable}}}`);
    };

    const insertFormatting = (marker: string) => {
        if (marker === '\n') {
            setTempMessage(prev => prev + '\n');
            return;
        }
        setTempMessage(prev => prev + marker + "text" + marker);
    };

    const renderPreviewTemplate = (template: string) => {
        if (!template) return "";
        return template
            .replace(/\{\{business_name\}\}/g, currentBusiness?.name || "My Business")
            .replace(/\{\{page_url\}\}/g, `bized.app/${currentBusiness?.slug || 'shop'}`)
            .replace(/\{\{product_name\}\}/g, "Classic Leather Bag");
    };

    const handleApplyTemplate = () => {
        if (!editingTemplate) return;
        const newTemplates = { ...templates, [editingTemplate.id]: tempMessage };
        setTemplates(newTemplates);
        setEditingTemplate(null);
        handleSave(settings, newTemplates);
    };

    const generateQRCodeUrl = (message?: string) => {
        if (!whatsappNumber) return "";
        const cleanNumber = whatsappNumber.replace(/\D/g, "");
        const renderedMessage = renderPreviewTemplate(message || "");
        const url = `https://wa.me/${cleanNumber}${renderedMessage ? `?text=${encodeURIComponent(renderedMessage)}` : ""}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(url)}`;
    };

    const handleDownloadQR = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Failed to download QR code:", err);
            // Fallback to basic link behavior if fetch fails
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            link.click();
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
        { id: "number", label: "WhatsApp Number", icon: Phone, description: "Connection settings" },
        { id: "message", label: "Message Templates", icon: FileText, description: "Page-specific texts & QRs" },
        { id: "button", label: "Floating Button", icon: MessageSquare, description: "Display preferences" },
        { id: "schedule", label: "Availability", icon: Clock, description: "Store hours sync" },
    ];

    const activePage = tabs.find(t => t.id === activeTab) || tabs[0];

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Left Panel - Tabs (Sidebar) */}
            <div className="w-80 border-r border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)] flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10">
                    <h1 className="text-xl font-bold text-[var(--color-on-surface)]">WhatsApp</h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Advanced management</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 scrollbar-none pb-20">
                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group",
                                    activeTab === tab.id
                                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-sm"
                                        : "hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        activeTab === tab.id
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] group-hover:bg-[var(--color-surface-container-highest)]"
                                    )}>
                                        <tab.icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm truncate leading-tight">{tab.label}</div>
                                        <div className={cn("text-[10px] truncate max-w-[140px]", activeTab === tab.id ? "text-[var(--color-on-primary-container)]/70" : "text-[var(--color-on-surface-variant)]/60")}>
                                            {tab.description}
                                        </div>
                                    </div>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={14} className="flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-[var(--color-outline-variant)]/10">
                    <Button variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl">
                        <Settings size={14} />
                        <span className="text-xs">Integration Settings</span>
                    </Button>
                </div>
            </div>

            {/* Center Panel - Editor Content */}
            <div className="flex-1 bg-[var(--color-surface-container-low)] overflow-y-auto scrollbar-thin">
                <div className="max-w-4xl mx-auto p-8 pb-32">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-[var(--color-on-surface)] tracking-tight">{activePage?.label}</h2>
                        <p className="text-[var(--color-on-surface-variant)] opacity-60">{activePage?.description}</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "number" && (
                            <motion.div key="number" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-8 shadow-sm space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50 px-1">Business WhatsApp number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-30 group-focus-within:text-[var(--color-primary)] transition-all" size={20} />
                                            <input
                                                type="tel"
                                                placeholder="e.g. +254 700 123 456"
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none font-bold transition-all"
                                            />
                                        </div>
                                        <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50 italic px-1">Include your country code (e.g. +1 for USA).</p>
                                    </div>
                                    <Button onClick={handleSaveNumber} disabled={isSaving} className={cn("w-full h-14 rounded-2xl font-bold gap-3 transition-all", saved ? "bg-emerald-500 text-white" : "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary-alpha)]")}>
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : saved ? <Check size={20} /> : <Check size={20} />}
                                        {isSaving ? "Saving..." : saved ? "Changes applied" : "Save changes"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "message" && (
                            <motion.div key="message" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'home', label: 'Home Page', icon: Home },
                                        { id: 'shop', label: 'Shop Page', icon: ShoppingBag },
                                        { id: 'product', label: 'Product Page', icon: Package },
                                    ].map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => setActivePreviewTab(template.id as any)}
                                            className={cn(
                                                "group relative bg-[var(--color-surface)] border rounded-[2rem] p-6 transition-all cursor-pointer",
                                                activePreviewTab === template.id
                                                    ? "border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/5 shadow-md"
                                                    : "border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-container-low)]"
                                            )}
                                        >
                                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                                {/* Template Info */}
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                                activePreviewTab === template.id ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                                                            )}>
                                                                <template.icon size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-base">{template.label}</h4>
                                                                <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">Pre-filled message</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                            activePreviewTab === template.id ? "bg-green-500/10 text-green-600" : "bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100"
                                                        )}>
                                                            {activePreviewTab === template.id ? "Previewing" : "Click to Preview"}
                                                        </div>
                                                    </div>

                                                    <div className="p-4 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/10 min-h-[60px]">
                                                        <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed italic">
                                                            {templates[template.id as keyof typeof templates] || "No message configured..."}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="h-10 rounded-xl px-4 gap-2 text-xs font-bold"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditSheet(template.id as any, template.label, template.icon);
                                                            }}
                                                        >
                                                            <Edit2 size={14} />
                                                            Edit Message
                                                        </Button>
                                                        <div className="w-px h-10 bg-[var(--color-outline-variant)]/20 mx-1 hidden sm:block" />
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            className="h-10 rounded-xl px-4 gap-2 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(generateQRCodeUrl(templates[template.id as keyof typeof templates]), '_blank');
                                                            }}
                                                        >
                                                            <ExternalLink size={14} />
                                                            Open QR
                                                        </Button>
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            className="h-10 rounded-xl px-4 gap-2 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadQR(generateQRCodeUrl(templates[template.id as keyof typeof templates]), `whatsapp-qr-${template.id}.png`);
                                                            }}
                                                        >
                                                            <Sparkles size={14} />
                                                            Download QR
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* QR Mini Preview */}
                                                <div className="w-32 h-32 p-2 rounded-2xl bg-white border border-[var(--color-outline-variant)]/10 shadow-sm shrink-0 flex items-center justify-center">
                                                    {whatsappNumber ? (
                                                        <img
                                                            src={generateQRCodeUrl(templates[template.id as keyof typeof templates])}
                                                            alt="QR"
                                                            className="w-full h-full"
                                                        />
                                                    ) : (
                                                        <Phone className="opacity-10" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 flex gap-4 mt-8">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-emerald-900 text-sm">AI Pulse: Conversion tip</h4>
                                        <p className="text-xs text-emerald-800/70 mt-1 leading-relaxed">
                                            Personalized welcome messages increase conversion by 18%.
                                            Try adding a question to start the conversation faster.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "button" && (
                            <motion.div key="button" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-8 shadow-sm space-y-10">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center"><MessageSquare size={20} /></div>
                                            <div>
                                                <h4 className="font-bold text-sm">Floating WhatsApp Button</h4>
                                                <p className="text-[10px] opacity-50">Show a persistent button on your store</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleSetting('floatingButtonEnabled')}
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-colors relative",
                                                settings.floatingButtonEnabled ? "bg-green-500" : "bg-[var(--color-surface-container-highest)]"
                                            )}
                                        >
                                            <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", settings.floatingButtonEnabled ? "translate-x-6" : "translate-x-0")} />
                                        </button>
                                    </div>

                                    {settings.floatingButtonEnabled && (
                                        <div className="space-y-10 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                            {/* Button Style */}
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-[var(--color-on-surface)]">Button Style</label>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {[
                                                        { id: 'circle-solid', icon: <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white"><WhatsAppIcon size={16} fill="white" /></div> },
                                                        { id: 'circle-regular', icon: <div className="w-8 h-8 rounded-full bg-white border border-[#25D366] flex items-center justify-center text-[#25D366]"><WhatsAppIcon size={16} fill="#25D366" /></div> },
                                                        { id: 'square-solid', icon: <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center text-white"><WhatsAppIcon size={16} fill="white" /></div> },
                                                        { id: 'square-regular', icon: <div className="w-8 h-8 rounded-xl bg-white border border-[#25D366] flex items-center justify-center text-[#25D366]"><WhatsAppIcon size={16} fill="#25D366" /></div> },
                                                    ].map((style) => (
                                                        <button
                                                            key={style.id}
                                                            onClick={() => updateSettingField('floatingButtonStyle', style.id)}
                                                            className={cn(
                                                                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-4",
                                                                settings.floatingButtonStyle === style.id
                                                                    ? "border-green-500 bg-green-50"
                                                                    : "border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container-lowest)] hover:border-green-200"
                                                            )}
                                                        >
                                                            <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", settings.floatingButtonStyle === style.id ? "border-blue-600" : "border-gray-300")}>
                                                                {settings.floatingButtonStyle === style.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                                            </div>
                                                            {style.icon}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50">Choose a button style. The selected style will be displayed on your website.</p>
                                            </div>

                                            {/* Button Size */}
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-[var(--color-on-surface)]">Button Size</label>
                                                <div className="flex items-center">
                                                    <div className="flex h-12 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 overflow-hidden group focus-within:border-[var(--color-primary)] transition-all">
                                                        <input
                                                            type="number"
                                                            value={settings.floatingButtonSize}
                                                            onChange={(e) => updateSettingField('floatingButtonSize', parseInt(e.target.value) || 48)}
                                                            className="w-24 px-4 bg-transparent outline-none font-bold text-sm"
                                                        />
                                                        <div className="px-4 flex items-center bg-[var(--color-surface-container-low)] border-l border-[var(--color-outline-variant)]/20 text-xs font-bold opacity-40">px</div>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50">Set the size of the button in pixels.</p>
                                            </div>

                                            {/* Button Position */}
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-[var(--color-on-surface)]">Button Position</label>
                                                <div className="flex flex-wrap gap-6">
                                                    {[
                                                        { id: 'bottom-right', label: 'Bottom Right' },
                                                        { id: 'bottom-left', label: 'Bottom Left' },
                                                        { id: 'right-middle', label: 'Right Middle' },
                                                        { id: 'left-middle', label: 'Left Middle' },
                                                    ].map((pos) => (
                                                        <button
                                                            key={pos.id}
                                                            onClick={() => updateSettingField('floatingButtonPosition', pos.id)}
                                                            className="flex items-center gap-3 group"
                                                        >
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                                settings.floatingButtonPosition === pos.id ? "border-blue-600" : "border-gray-300 group-hover:border-gray-400"
                                                            )}>
                                                                {settings.floatingButtonPosition === pos.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                            </div>
                                                            <span className={cn("text-xs font-medium transition-colors", settings.floatingButtonPosition === pos.id ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)] opacity-60 group-hover:opacity-100")}>{pos.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50">Choose where the button appears on your website.</p>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest px-1">Button Label (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={settings.floatingButtonLabel}
                                                    onChange={(e) => updateSettingField('floatingButtonLabel', e.target.value)}
                                                    className="w-full h-12 px-5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm font-bold"
                                                    placeholder="e.g. WhatsApp Chat"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button onClick={() => handleSave(settings)} disabled={isSaving} className={cn("w-full h-14 rounded-2xl font-bold gap-3 transition-all", saved ? "bg-emerald-500 text-white" : "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary-alpha)]")}>
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : saved ? <Check size={20} /> : <Check size={20} />}
                                        {isSaving ? "Saving..." : saved ? "Settings updated" : "Save preferences"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "schedule" && (
                            <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-[2.5rem] p-8 shadow-sm space-y-8">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><Clock size={20} /></div>
                                            <div>
                                                <h4 className="font-bold text-sm">Availability Sync</h4>
                                                <p className="text-[10px] opacity-50">Link WhatsApp visibility with opening hours</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleSetting('useSchedule')}
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-colors relative",
                                                settings.useSchedule ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-container-highest)]"
                                            )}
                                        >
                                            <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", settings.useSchedule ? "translate-x-6" : "translate-x-0")} />
                                        </button>
                                    </div>

                                    {settings.useSchedule && (
                                        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                                <div>
                                                    <h4 className="text-xs font-bold text-amber-900">Hide Button When Closed</h4>
                                                    <p className="text-[10px] text-amber-800/60 mt-1">Automatically remove the button after hours</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleSetting('hideWhenClosed')}
                                                    className={cn(
                                                        "w-10 h-5 rounded-full p-1 transition-colors relative",
                                                        settings.hideWhenClosed ? "bg-amber-600" : "bg-amber-200"
                                                    )}
                                                >
                                                    <div className={cn("w-3 h-3 rounded-full bg-white transition-transform", settings.hideWhenClosed ? "translate-x-5" : "translate-x-0")} />
                                                </button>
                                            </div>

                                            {!currentBusiness.openingHours && (
                                                <div className="p-4 rounded-xl bg-amber-100 text-amber-800 text-[10px] flex gap-3">
                                                    <AlertCircle size={14} className="shrink-0" />
                                                    <p>You haven't set your **Opening Hours** yet. Go to Store Settings to configure them for this to work correctly.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button onClick={() => handleSave(settings)} disabled={isSaving} className={cn("w-full h-14 rounded-2xl font-bold gap-3 transition-all", saved ? "bg-emerald-500 text-white" : "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary-alpha)]")}>
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : saved ? <Check size={20} /> : <Check size={20} />}
                                        {isSaving ? "Saving..." : saved ? "Schedule applied" : "Save schedule"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* Right Panel - WhatsApp Preview */}
            <div className="w-[380px] border-l border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10">
                    <h2 className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-widest">WhatsApp Preview</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#f0f2f5]/50">
                    <div className={PHONE_FRAME_CLASS}>
                        {/* WhatsApp Header */}
                        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-sm relative z-20">
                            <div className="flex items-center gap-3">
                                <ChevronLeft size={20} className="opacity-50" />
                                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                                    {currentBusiness.logoUrl ? <img src={currentBusiness.logoUrl} alt="" className="w-full h-full object-cover" /> : <div className="text-sm font-black text-white/40">{(currentBusiness.name || 'B').charAt(0)}</div>}
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-bold truncate max-w-[120px]">{currentBusiness.name || 'Business'}</h4>
                                    <p className="text-[8px] opacity-70">
                                        {activeTab === 'message'
                                            ? `Previewing: ${activePreviewTab.charAt(0).toUpperCase() + activePreviewTab.slice(1)} Page`
                                            : 'Online'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-60">
                                <ExternalLink size={16} />
                                <div className="w-1 h-3 rounded-full bg-white/40" />
                            </div>
                        </div>

                        {/* WhatsApp Chat Content */}
                        <div className="flex-1 p-4 overflow-y-auto scrollbar-none relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
                            <div className="bg-amber-50/90 border border-amber-200/50 p-2 rounded-xl text-center mb-6 shadow-sm mx-4">
                                <p className="text-[8px] text-amber-900/60 font-medium">Messages are end-to-end encrypted. No one outside of this chat can read them.</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'message' || activeTab === 'button' ? (
                                    <div className="space-y-4">
                                        {activeTab === 'message' ? (
                                            <WhatsappBubble text={renderPreviewTemplate(templates[activePreviewTab])} />
                                        ) : (
                                            <>
                                                {templates.home && <WhatsappBubble text={renderPreviewTemplate(templates.home)} />}
                                                {!templates.home && !templates.shop && !templates.product && (
                                                    <div className="flex items-center justify-center h-full opacity-20 italic text-[10px] text-center px-4 mt-20">
                                                        Select a template or edit to see preview
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full opacity-20 italic text-xs mt-20">
                                        Configure settings to see preview...
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* WhatsApp Input */}
                        <div className="p-3 bg-gray-100 flex items-center gap-2 border-t border-black/5">
                            <div className="w-8 h-8 rounded-full bg-white/80" />
                            <div className="flex-1 h-9 rounded-full bg-white border border-gray-200" />
                            <div className="w-9 h-9 rounded-full bg-[#075e54] flex items-center justify-center text-white shadow-sm">
                                <MessageSquare size={16} />
                            </div>
                        </div>

                        {/* Floating Button Preview (In-Store Simulator) */}
                        {activeTab === "button" && settings.floatingButtonEnabled && (
                            <div className="absolute inset-0 pointer-events-none z-30">
                                <div className={cn(
                                    "absolute transition-all duration-500 flex items-center justify-center shadow-xl",
                                    {
                                        'bottom-right': "right-4 bottom-16",
                                        'bottom-left': "left-4 bottom-16",
                                        'right-middle': "right-4 top-1/2 -translate-y-1/2",
                                        'left-middle': "left-4 top-1/2 -translate-y-1/2"
                                    }[settings.floatingButtonPosition] || "right-4 bottom-16",
                                    {
                                        'circle-solid': "bg-[#25D366] text-white rounded-full h-auto shadow-green-500/20",
                                        'circle-regular': "bg-white text-[#25D366] border border-[#25D366] rounded-full h-auto",
                                        'square-solid': "bg-[#25D366] text-white rounded-xl h-auto shadow-green-500/20",
                                        'square-regular': "bg-white text-[#25D366] border border-[#25D366] rounded-xl h-auto"
                                    }[settings.floatingButtonStyle] || "bg-[#25D366]"
                                )}
                                    style={{ width: settings.floatingButtonSize / 1.5, height: settings.floatingButtonSize / 1.5 }}
                                >
                                    <WhatsAppIcon
                                        size={(settings.floatingButtonSize / 1.5) * 0.6}
                                        fill={settings.floatingButtonStyle?.includes('solid') ? "white" : "#25D366"}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Template Edit Side Sheet */}
            <Sheet
                open={!!editingTemplate}
                onClose={() => setEditingTemplate(null)}
                title={editingTemplate?.label || 'Edit Template'}
                icon={editingTemplate?.icon && <editingTemplate.icon size={20} />}
                footer={
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                        <Button className="flex-1 h-12 rounded-xl font-bold gap-2" onClick={handleApplyTemplate} disabled={isSaving}>
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            {isSaving ? 'Saving...' : 'Apply Changes'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50 px-1">Welcome message</label>
                        <div className="relative group">
                            <Type className="absolute left-4 top-4 text-[var(--color-on-surface-variant)] opacity-30 group-focus-within:text-[var(--color-primary)] transition-all" size={20} />
                            <textarea
                                rows={6}
                                value={tempMessage}
                                onChange={(e) => setTempMessage(e.target.value)}
                                placeholder="Hi! I'm interested in..."
                                className="w-full pl-12 pr-6 py-4 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm leading-relaxed transition-all resize-none shadow-inner"
                            />
                        </div>
                        <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-40 leading-relaxed px-1">
                            This message will be automatically filled in the user's WhatsApp input field when they contact you from the {editingTemplate?.label.toLowerCase()} page.
                        </p>
                    </div>

                    {/* Formatting & Variables */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50 px-1 uppercase tracking-wider">Formatting</label>
                            <div className="flex flex-wrap gap-2 px-1">
                                {[
                                    { id: '*', label: 'Bold', icon: Bold },
                                    { id: '_', label: 'Italic', icon: Italic },
                                    { id: '~', label: 'Strike', icon: Strikethrough },
                                    { id: '\n', label: 'New Line', icon: CornerDownLeft },
                                ].map((tool) => (
                                    <button
                                        key={tool.label}
                                        onClick={() => insertFormatting(tool.id)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-surface-container-high)] hover:bg-[var(--color-primary)] hover:text-white transition-all border border-[var(--color-outline-variant)]/10"
                                        title={tool.label}
                                    >
                                        <tool.icon size={16} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50 px-1 uppercase tracking-wider">Variables</label>
                            <div className="flex flex-wrap gap-2 px-1">
                                {[
                                    { id: 'business_name', label: 'Business', icon: Building2 },
                                    { id: 'page_url', label: 'Page URL', icon: Globe },
                                ].map((variable) => (
                                    <button
                                        key={variable.id}
                                        onClick={() => insertVariable(variable.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-container-high)] hover:bg-[var(--color-primary)] hover:text-white transition-all text-[10px] font-bold border border-[var(--color-outline-variant)]/10 h-10 w-full"
                                    >
                                        <variable.icon size={12} />
                                        {variable.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[var(--color-primary-container)]/30 border border-[var(--color-primary)]/10">
                        <div className="flex gap-3">
                            <Sparkles size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                            <div>
                                <h5 className="text-[11px] font-bold text-[var(--color-on-primary-container)]">Pro Tip</h5>
                                <p className="text-[10px] text-[var(--color-on-primary-container)] opacity-70 mt-1 leading-relaxed">
                                    Include a call to action like "Can I see more photos?" to encourage immediate customer engagement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Sheet>
        </div>
    );
}
