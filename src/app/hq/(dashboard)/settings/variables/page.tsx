import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { Globe, Languages, Clock, Coins, Save, Check, Wallet, Percent, Calendar, ToggleLeft, Bot, Lock, Trash2, LayoutGrid, Palette, Mail, Phone, MessageSquare, Search, Ruler, Hash, ShieldAlert, Zap, CreditCard } from "lucide-react";
import { CURRENCIES } from "@/lib/currencies";
import Link from "next/link";
import { getPlatformSettings, PLATFORM_SETTINGS_ID } from "@/lib/platform-settings";
import { VariablesTabs } from "./VariablesTabs";
import { Suspense } from "react";

const COMMON_TIMEZONES = [
    "UTC",
    "Africa/Nairobi",
    "Africa/Lagos",
    "Africa/Johannesburg",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Moscow",
];

const COMMON_LANGUAGES = [
    "English",
    "French",
    "Spanish",
    "German",
    "Swahili",
    "Arabic",
    "Chinese",
    "Japanese",
    "Portuguese",
];

export const dynamic = 'force-dynamic';

export default async function GlobalVariablesPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const { tab } = await searchParams;
    const settings = await getPlatformSettings();
    const activeTab = tab || "currency";

    const updateVariables = async (formData: FormData) => {
        "use server";
        const client = await clientPromise;
        const db = client.db();

        const type = formData.get("type") as string;
        let update = {};

        if (type === "currency") {
            update = { defaultCurrency: formData.get("defaultCurrency") as string };
        } else if (type === "languages") {
            const languages = formData.getAll("languages") as string[];
            update = { supportedLanguages: languages };
        } else if (type === "timezones") {
            const timezones = formData.getAll("timezones") as string[];
            update = { globalTimezones: timezones };
        } else if (type === "financials") {
            update = {
                trialPeriodDays: Number(formData.get("trialPeriodDays")),
                platformCommission: Number(formData.get("platformCommission")),
                defaultTaxRate: Number(formData.get("defaultTaxRate")),
                minWithdrawal: Number(formData.get("minWithdrawal")),
                maxWithdrawal: Number(formData.get("maxWithdrawal")),
            };
        } else if (type === "system") {
            update = {
                enableBetaFeatures: formData.get("enableBetaFeatures") === "true",
                enableAiFeatures: formData.get("enableAiFeatures") === "true",
                deletionGracePeriod: Number(formData.get("deletionGracePeriod")),
            };
        } else if (type === "danger") {
            update = {
                maintenanceMode: formData.get("maintenanceMode") === "true",
                registrationLocked: formData.get("registrationLocked") === "true",
            };
        } else if (type === "branding") {
            update = {
                supportEmail: formData.get("supportEmail") as string,
                supportPhone: formData.get("supportPhone") as string,
                whatsappNumber: formData.get("whatsappNumber") as string,
                primaryColor: formData.get("primaryColor") as string,
                secondaryColor: formData.get("secondaryColor") as string,
            };
        } else if (type === "seo") {
            update = {
                metaTitle: formData.get("metaTitle") as string,
                metaDescription: formData.get("metaDescription") as string,
                dateFormat: formData.get("dateFormat") as string,
                numberFormat: formData.get("numberFormat") as string,
                measurementSystem: formData.get("measurementSystem") as string,
            };
        } else if (type === "gateways") {
            const gateways = formData.getAll("gateways") as string[];
            update = { enabledGateways: gateways };
        }

        await db.collection("platform_settings").updateOne(
            { _id: PLATFORM_SETTINGS_ID as any },
            { $set: update },
            { upsert: true }
        );

        revalidatePath("/hq/settings/variables");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Globe className="w-8 h-8 text-indigo-400" /> Global Variables
                </h1>
                <p className="text-zinc-400">Configure core platform defaults and supported localization options.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
                {/* Vertical Tabs */}
                <Suspense fallback={<div className="w-full md:w-64 h-64 bg-zinc-900/50 rounded-xl animate-pulse" />}>
                    <VariablesTabs />
                </Suspense>

                {/* Tab Content */}
                <main className="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-sm">
                    {activeTab === "currency" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Default Platform Currency</h2>
                                <p className="text-sm text-zinc-400">Set the default currency for new businesses and system calculations.</p>
                            </div>

                            <form action={updateVariables} className="space-y-6 max-w-lg">
                                <input type="hidden" name="type" value="currency" />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Select Default Currency</label>
                                    <select
                                        name="defaultCurrency"
                                        defaultValue={settings.defaultCurrency}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    >
                                        {CURRENCIES.map(curr => (
                                            <option key={curr.code} value={curr.code}>
                                                {curr.flag} {curr.name} ({curr.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95">
                                    <Save className="w-4 h-4" /> Save Default Currency
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "financials" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Financial & Subscription Defaults</h2>
                                <p className="text-sm text-zinc-400">Manage trial periods, commission rates, and withdrawal limits.</p>
                            </div>

                            <form action={updateVariables} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                <input type="hidden" name="type" value="financials" />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-400" /> Trial Period (Days)
                                    </label>
                                    <input
                                        type="number"
                                        name="trialPeriodDays"
                                        defaultValue={settings.trialPeriodDays || 14}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <Percent className="w-4 h-4 text-indigo-400" /> Platform Commission (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="platformCommission"
                                        defaultValue={settings.platformCommission || 5}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <Percent className="w-4 h-4 text-indigo-400" /> Default Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="defaultTaxRate"
                                        defaultValue={settings.defaultTaxRate || 16}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Min Withdrawal ({settings.defaultCurrency})</label>
                                    <input
                                        type="number"
                                        name="minWithdrawal"
                                        defaultValue={settings.minWithdrawal || 10}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Max Withdrawal ({settings.defaultCurrency})</label>
                                    <input
                                        type="number"
                                        name="maxWithdrawal"
                                        defaultValue={settings.maxWithdrawal || 10000}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95">
                                        <Save className="w-4 h-4" /> Save Financial Settings
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "gateways" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Global Payment Gateways</h2>
                                <p className="text-sm text-zinc-400">Control which payment providers are available to businesses across the platform.</p>
                            </div>

                            <form action={updateVariables} className="space-y-6">
                                <input type="hidden" name="type" value="gateways" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                    {[
                                        { id: "stripe", name: "Stripe", description: "Global payments (Cards, Apple Pay, Google Pay)", logo: "💳" },
                                        { id: "mpesa", name: "M-Pesa", description: "Mobile money for East Africa (STK Push)", logo: "📱" },
                                        { id: "paystack", name: "Paystack", description: "Modern payments for Africa", logo: "⚡" },
                                        { id: "dpo", name: "DPO Group", description: "Pan-African payment service provider", logo: "🌍" },
                                    ].map(gateway => (
                                        <label
                                            key={gateway.id}
                                            className={`
                                                flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all group
                                                ${(settings.enabledGateways || []).includes(gateway.id)
                                                    ? "bg-indigo-500/10 border-indigo-500/50"
                                                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"}
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                name="gateways"
                                                value={gateway.id}
                                                defaultChecked={(settings.enabledGateways || []).includes(gateway.id)}
                                                className="hidden peer"
                                            />
                                            <div className="p-3 bg-zinc-900 rounded-xl text-2xl">
                                                {gateway.logo}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-white">{gateway.name}</h3>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${(settings.enabledGateways || []).includes(gateway.id) ? "bg-indigo-500 border-indigo-400" : "bg-zinc-900 border-zinc-700"}`}>
                                                        {(settings.enabledGateways || []).includes(gateway.id) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">{gateway.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95">
                                    <CreditCard className="w-4 h-4" /> Update Global Gateway Access
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "system" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">System & Feature Toggles</h2>
                                <p className="text-sm text-zinc-400">Control global accessibility of platform features and operational states.</p>
                            </div>

                            <form action={updateVariables} className="space-y-6 max-w-3xl">
                                <input type="hidden" name="type" value="system" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-6">
                                        <ToggleCard
                                            name="enableAiFeatures"
                                            label="AI Assistant Features"
                                            description="Enable AI-powered product descriptions and support."
                                            icon={<Bot className="w-5 h-5 text-indigo-500" />}
                                            checked={settings.enableAiFeatures}
                                        />
                                        <ToggleCard
                                            name="enableBetaFeatures"
                                            label="Early Access / Beta"
                                            description="Roll out experimental features to a subset of users."
                                            icon={<Zap className="w-5 h-5 text-cyan-500" />}
                                            checked={settings.enableBetaFeatures}
                                        />
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                                    <Trash2 size={20} />
                                                </div>
                                                <h3 className="font-bold text-white">Data Retention</h3>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500 uppercase">Deletion Grace Period (Days)</label>
                                                <input
                                                    type="number"
                                                    name="deletionGracePeriod"
                                                    defaultValue={settings.deletionGracePeriod}
                                                    className="w-full h-12 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-indigo-500 outline-none transition-all text-white"
                                                />
                                                <p className="text-[10px] text-zinc-600 italic">Number of days a business remains in 'Pending Deletion' before absolute wipe.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95">
                                    <Save className="w-4 h-4" /> Update System Settings
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "branding" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Branding & Support</h2>
                                <p className="text-sm text-zinc-400">Configure global support contacts and platform brand identity.</p>
                            </div>

                            <form action={updateVariables} className="space-y-8 max-w-4xl">
                                <input type="hidden" name="type" value="branding" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Support Contacts */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Support Contacts
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                                                    <Mail className="w-3 h-3" /> Support Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="supportEmail"
                                                    defaultValue={settings.supportEmail}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                                                    <Phone className="w-3 h-3" /> Support Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    name="supportPhone"
                                                    defaultValue={settings.supportPhone}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                                                    <MessageSquare className="w-3 h-3" /> WhatsApp Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name="whatsappNumber"
                                                    defaultValue={settings.whatsappNumber}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brand Colors */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <Palette className="w-4 h-4" /> Brand Identity
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-white">Primary Color</h4>
                                                    <p className="text-xs text-zinc-500">Main action & brand color</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono text-zinc-400">{settings.primaryColor}</span>
                                                    <input
                                                        type="color"
                                                        name="primaryColor"
                                                        defaultValue={settings.primaryColor}
                                                        className="w-10 h-10 rounded-full border-none bg-transparent cursor-pointer overflow-hidden p-0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-white">Secondary Color</h4>
                                                    <p className="text-xs text-zinc-500">Accent & highlight color</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono text-zinc-400">{settings.secondaryColor}</span>
                                                    <input
                                                        type="color"
                                                        name="secondaryColor"
                                                        defaultValue={settings.secondaryColor}
                                                        className="w-10 h-10 rounded-full border-none bg-transparent cursor-pointer overflow-hidden p-0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95">
                                    <Save className="w-4 h-4" /> Update Branding & Support
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "seo" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">SEO & Localization</h2>
                                <p className="text-sm text-zinc-400">Manage platform-wide metadata and formatting defaults.</p>
                            </div>

                            <form action={updateVariables} className="space-y-8 max-w-4xl">
                                <input type="hidden" name="type" value="seo" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* SEO Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <Search className="w-4 h-4" /> Global SEO
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400">Meta Title</label>
                                                <input
                                                    type="text"
                                                    name="metaTitle"
                                                    defaultValue={settings.metaTitle}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400">Meta Description</label>
                                                <textarea
                                                    name="metaDescription"
                                                    defaultValue={settings.metaDescription}
                                                    rows={4}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Localization Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> Formatting Defaults
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" /> Date Format
                                                </label>
                                                <select
                                                    name="dateFormat"
                                                    defaultValue={settings.dateFormat}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                >
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                                                    <option value="MMM DD, YYYY">MMM DD, YYYY (Dec 31, 2024)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                                                    <Hash className="w-3 h-3" /> Number Format
                                                </label>
                                                <select
                                                    name="numberFormat"
                                                    defaultValue={settings.numberFormat}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                >
                                                    <option value="commas">1,234.56 (Commas)</option>
                                                    <option value="dots">1.234,56 (Dots)</option>
                                                    <option value="spaces">1 234,56 (Spaces)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                                                    <Ruler className="w-3 h-3" /> Measurement System
                                                </label>
                                                <select
                                                    name="measurementSystem"
                                                    defaultValue={settings.measurementSystem}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                >
                                                    <option value="metric">Metric (kg, cm, m)</option>
                                                    <option value="imperial">Imperial (lb, in, ft)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95">
                                    <Save className="w-4 h-4" /> Save SEO & Localization
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "languages" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Supported Languages</h2>
                                <p className="text-sm text-zinc-400">Enable languages that are available globally across the platform.</p>
                            </div>

                            <form action={updateVariables} className="space-y-6">
                                <input type="hidden" name="type" value="languages" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {COMMON_LANGUAGES.map(lang => (
                                        <label
                                            key={lang}
                                            className={`
                                                flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                                                ${(settings.supportedLanguages || []).includes(lang)
                                                    ? "bg-indigo-500/10 border-indigo-500/50 text-white"
                                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"}
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                name="languages"
                                                value={lang}
                                                defaultChecked={(settings.supportedLanguages || []).includes(lang)}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${(settings.supportedLanguages || []).includes(lang) ? "bg-indigo-500 border-indigo-400" : "bg-zinc-900 border-zinc-700"}`}>
                                                {(settings.supportedLanguages || []).includes(lang) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="font-medium text-sm">{lang}</span>
                                        </label>
                                    ))}
                                </div>
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95">
                                    <Save className="w-4 h-4" /> Update Supported Languages
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "timezones" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Global Timezones</h2>
                                <p className="text-sm text-zinc-400">Select which timezones are supported for business operations and scheduling.</p>
                            </div>

                            <form action={updateVariables} className="space-y-6">
                                <input type="hidden" name="type" value="timezones" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {COMMON_TIMEZONES.map(tz => (
                                        <label
                                            key={tz}
                                            className={`
                                                flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                                                ${(settings.globalTimezones || []).includes(tz)
                                                    ? "bg-indigo-500/10 border-indigo-500/50 text-white"
                                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"}
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                name="timezones"
                                                value={tz}
                                                defaultChecked={(settings.globalTimezones || []).includes(tz)}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${(settings.globalTimezones || []).includes(tz) ? "bg-indigo-500 border-indigo-400" : "bg-zinc-900 border-zinc-700"}`}>
                                                {(settings.globalTimezones || []).includes(tz) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="font-medium text-xs break-all">{tz}</span>
                                        </label>
                                    ))}
                                </div>
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all active:scale-95">
                                    <Save className="w-4 h-4" /> Update Supported Timezones
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "danger" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2 text-red-500">Danger Zone</h2>
                                <p className="text-sm text-zinc-400">Manage sensitive platform-wide overrides and locking mechanisms.</p>
                            </div>

                            <form action={updateVariables} className="space-y-6 max-w-3xl">
                                <input type="hidden" name="type" value="danger" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-6">
                                        <ToggleCard
                                            name="maintenanceMode"
                                            label="Maintenance Mode"
                                            description="Block all non-super-admin access to businesses and storefronts."
                                            icon={<ShieldAlert className="w-5 h-5 text-red-500" />}
                                            checked={settings.maintenanceMode}
                                        />
                                        <ToggleCard
                                            name="registrationLocked"
                                            label="Lock Registration"
                                            description="Prevent new users from signing up on the platform."
                                            icon={<Lock className="w-5 h-5 text-amber-500" />}
                                            checked={settings.registrationLocked}
                                        />
                                    </div>

                                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
                                        <div className="flex items-center gap-2 text-red-500">
                                            <ShieldAlert size={20} />
                                            <h3 className="font-bold">Caution</h3>
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            Actions in this section can disrupt platform operations. Maintenance mode will immediately kick all users out of their dashboards.
                                        </p>
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all active:scale-95 shadow-lg shadow-red-500/20">
                                    <Save className="w-4 h-4" /> Save Danger Zone Settings
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function ToggleCard({ name, label, description, icon, checked }: { name: string, label: string, description: string, icon: React.ReactNode, checked: boolean }) {
    return (
        <label className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4 cursor-pointer hover:border-zinc-700 transition-all select-none group">
            <div className="p-2.5 bg-zinc-900 rounded-xl">
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">{label}</h3>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name={name} value="true" defaultChecked={checked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    </div>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{description}</p>
            </div>
        </label>
    );
}

