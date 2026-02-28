"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ArrowLeft,
    Store,
    Link as LinkIcon,
    Layout,
    Check,
    Clock,
    Rocket,
    Shield,
    CreditCard as CardIcon,
    Briefcase,
    Zap,
    Paintbrush,
    ShoppingBag,
    UploadCloud,
    Trash2,
    Loader2,
    CreditCard,
    Globe,
    MessageSquare,
    Truck,
    BarChart3,
    Tractor,
    Hammer,
    BookOpen,
    Coins,
    Utensils,
    Shirt,
    Wrench,
    Gem,
    Stethoscope,
    ShoppingBasket,
    Factory,
    Handshake,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    Scissors,
    Car,
    GraduationCap,
    Dumbbell,
    Home,
    BedDouble,
    Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewBusinessWizard() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        industry: "",
        customIndustry: "",
        businessType: "",
        description: "",
        modules: [] as string[],
        themeColor: "#4F46E5",
        logoUrl: ""
    });
    const [isUploading, setIsUploading] = useState(false);
    const [expandedSection, setExpandedSection] = useState<'category' | 'type'>('category');
    const [showWhatsIncluded, setShowWhatsIncluded] = useState(false);
    const [showSubscription, setShowSubscription] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleNext = async () => {
        if (step === 3) {
            setIsCreating(true);
            setError("");
            try {
                const res = await fetch("/api/stores", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name,
                        slug: formData.slug,
                        industry: formData.industry,
                        customIndustry: formData.customIndustry,
                        businessType: formData.businessType,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || "Failed to create business");
                    return;
                }
                setShowSubscription(true);
            } catch (err) {
                setError("Network error. Please try again.");
            } finally {
                setIsCreating(false);
            }
        } else {
            setStep(prev => Math.min(prev + 1, 3));
        }
    };
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, name, slug }));
    };

    const businessCategories = [
        { name: "Food & Drink", icon: <Utensils size={24} className="text-orange-600" /> },
        { name: "Beauty & Spas", icon: <Scissors size={24} className="text-pink-600" /> },
        { name: "Health & Medical", icon: <Stethoscope size={24} className="text-blue-600" /> },
        { name: "Shopping", icon: <ShoppingBag size={24} className="text-emerald-600" /> },
        { name: "Home Services", icon: <Home size={24} className="text-cyan-600" /> },
        { name: "Automotive", icon: <Car size={24} className="text-red-600" /> },
        { name: "Professional", icon: <Briefcase size={24} className="text-slate-600" /> },
        { name: "Education", icon: <GraduationCap size={24} className="text-yellow-600" /> },
        { name: "Fitness", icon: <Dumbbell size={24} className="text-lime-600" /> },
        { name: "Events", icon: <Sparkles size={24} className="text-purple-600" /> },
        { name: "Transport", icon: <Truck size={24} className="text-indigo-600" /> },
        { name: "Lodging", icon: <BedDouble size={24} className="text-teal-600" /> },
        { name: "Other", icon: <LayoutGrid size={24} className="text-slate-400" /> },
    ];

    const businessTypes = [
        { name: "Retailer", icon: <Store size={24} className="text-blue-500" /> },
        { name: "Distributor", icon: <Truck size={24} className="text-blue-500" /> },
        { name: "Manufacturer", icon: <Factory size={24} className="text-blue-500" /> },
        { name: "Service Provider", icon: <Handshake size={24} className="text-blue-500" /> },
        { name: "Trader", icon: <TrendingUp size={24} className="text-blue-500" /> },
        { name: "Other", icon: <LayoutGrid size={24} className="text-blue-500" /> },
    ];

    const modules = [
        { id: "payments", name: "Online Payments", icon: <CreditCard size={18} />, description: "Stripe, Paystack, PayPal" },
        { id: "storefront", name: "Store & Domain", icon: <Globe size={18} />, description: "Custom .app or .com" },
        { id: "whatsapp", name: "WhatsApp Bot", icon: <MessageSquare size={18} />, description: "Automated sales & alerts" },
        { id: "shop", name: "Online Shop", icon: <ShoppingBag size={18} />, description: "Inventory & products" },
        { id: "booking", name: "Booking Engine", icon: <Zap size={18} />, description: "Reservations & calendar" },
        { id: "services", name: "Service Catalog", icon: <Briefcase size={18} />, description: "Professional lists" },
        { id: "logistics", name: "Deliveries", icon: <Truck size={18} />, description: "Live order tracking" },
        { id: "analytics", name: "Sales Analytics", icon: <BarChart3 size={18} />, description: "Business growth data" },
        { id: "reviews", name: "Review Feed", icon: <Check size={18} />, description: "Customer social proof" }
    ];

    const colors = [
        { name: "Indigo", value: "#4F46E5" },
        { name: "Emerald", value: "#10B981" },
        { name: "Rose", value: "#F43F5E" },
        { name: "Amber", value: "#F59E0B" },
        { name: "Cyan", value: "#06B6D4" },
        { name: "Violet", value: "#8B5CF6" }
    ];

    const toggleModule = (id: string) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.includes(id)
                ? prev.modules.filter(m => m !== id)
                : [...prev.modules, id]
        }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !formData.slug) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("slug", formData.slug);

        try {
            const res = await fetch("/api/upload/logo", {
                method: "POST",
                body: uploadData,
            });
            const data = await res.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, logoUrl: data.url }));
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    // Calculate dynamic dates for the subscription timeline
    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + 21);
    const paidDate = new Date(today);
    paidDate.setDate(today.getDate() + 28);
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            {/* Subscription Offer Screen */}
            {showSubscription ? (
                <AnimatePresence mode="wait">
                    <motion.div
                        key="subscription"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center text-center pt-8"
                    >
                        {/* Success Icon */}
                        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-8">
                            <Rocket size={36} className="text-[var(--color-primary)]" />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-[var(--color-on-surface)] tracking-tight mb-3">
                            Your business is ready! 🎉
                        </h1>
                        <p className="text-base text-[var(--color-on-surface-variant)] opacity-70 mb-10 max-w-md">
                            Start with full access for just $1. Cancel anytime.
                        </p>

                        {/* Timeline Card */}
                        <div className="w-full max-w-lg rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 p-8 mb-8 text-left">
                            <div className="relative">
                                {/* Vertical line */}
                                <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-[var(--color-outline-variant)]/20" />

                                {/* Today */}
                                <div className="flex items-start gap-5 mb-10 relative">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 z-10">
                                        <Shield size={18} className="text-[var(--color-on-primary)]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--color-on-surface)]">Today: Get Instant Access</p>
                                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60 mt-0.5">Unlock all features for just $1. No limits.</p>
                                    </div>
                                </div>

                                {/* Reminder */}
                                <div className="flex items-start gap-5 mb-10 relative">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center flex-shrink-0 z-10">
                                        <Clock size={18} className="text-[var(--color-on-surface-variant)]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--color-on-surface)]">{formatDate(reminderDate)}: We&apos;ll Remind You</p>
                                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60 mt-0.5">Get reminders on WhatsApp &amp; email before trial ends</p>
                                    </div>
                                </div>

                                {/* Paid Plan */}
                                <div className="flex items-start gap-5 relative">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center flex-shrink-0 z-10">
                                        <CreditCard size={18} className="text-[var(--color-on-surface-variant)]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--color-on-surface)]">{formatDate(paidDate)}: Paid Plan Begins</p>
                                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60 mt-0.5">$50/mo. Cancel anytime from settings.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What's Included */}
                        <button
                            onClick={() => setShowWhatsIncluded(!showWhatsIncluded)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/50 text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-all mb-8"
                        >
                            What&apos;s included
                            <ChevronDown size={16} className={`transition-transform ${showWhatsIncluded ? 'rotate-180' : ''}`} />
                        </button>

                        {showWhatsIncluded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="w-full max-w-lg rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 p-6 mb-8 text-left"
                            >
                                <ul className="space-y-4">
                                    {[
                                        "Unlimited products & services",
                                        "Custom domain (.app or .com)",
                                        "WhatsApp & email automations",
                                        "Order management & tracking",
                                        "Sales & customer analytics",
                                        "Priority support"
                                    ].map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-sm text-[var(--color-on-surface)]">
                                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                                <Check size={14} className="text-[var(--color-primary)]" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* CTA Button */}
                        <button
                            onClick={() => router.push('/businesses')}
                            className="w-full max-w-lg h-16 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-lg shadow-xl shadow-[var(--color-primary)]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-4"
                        >
                            Start for $1 <span className="text-[var(--color-on-primary)] opacity-50 line-through">$50/mo</span>
                        </button>

                        {/* Skip */}
                        <button
                            onClick={() => router.push('/businesses')}
                            className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-50 hover:opacity-100 transition-opacity py-4"
                        >
                            Skip for now
                        </button>
                    </motion.div>
                </AnimatePresence>
            ) : (
                <>
                    {/* Header */}
                    <div className="mb-12">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] opacity-60 hover:opacity-100 transition-opacity mb-8 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Selection
                        </button>

                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider">
                                Step {step} of 3
                            </div>
                            <h1 className="text-4xl font-black text-[var(--color-on-surface)] tracking-tight">
                                Launch your digital presence
                            </h1>
                        </div>
                    </div>

                    {/* Steps Progress */}
                    <div className="flex gap-2 mb-12">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step
                                    ? "bg-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/20"
                                    : "bg-[var(--color-surface-container-high)]"
                                    }`}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-8"
                        >
                            {step === 1 && (
                                <div className="space-y-8">
                                    <section className="space-y-6">
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
                                                <Briefcase size={20} className="text-[var(--color-primary)]" />
                                                Identity
                                            </h2>
                                            <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">What is your business called and how will fans find it?</p>
                                        </div>

                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60 ml-1">Business name</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={handleNameChange}
                                                    placeholder="e.g. Blue Bottle Coffee"
                                                    className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all placeholder:opacity-30"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60 ml-1">Business link</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={formData.slug}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                                        className="w-full h-14 pl-5 pr-12 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all"
                                                    />
                                                    <LinkIcon size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-30" />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
                                            <Store size={20} className="text-[var(--color-primary)]" />
                                            Select Business Category
                                        </h2>
                                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">This will help us personalize your business</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {businessCategories.map((cat) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => setFormData(prev => ({ ...prev, industry: cat.name }))}
                                                className={`w-full p-4 rounded-2xl border flex items-center gap-3 text-left transition-all ${formData.industry === cat.name
                                                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10"
                                                    : "bg-white border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]/30"
                                                    }`}
                                            >
                                                <div className={`flex-shrink-0 ${formData.industry === cat.name ? "text-[var(--color-primary)]" : ""}`}>
                                                    {cat.icon}
                                                </div>
                                                <span className={`text-sm font-bold ${formData.industry === cat.name ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)]"}`}>{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {formData.industry === 'Other' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-2 p-6 rounded-2xl bg-slate-50 border border-slate-200"
                                        >
                                            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60 ml-1">Type your category</label>
                                            <input
                                                type="text"
                                                value={formData.customIndustry || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, customIndustry: e.target.value }))}
                                                placeholder="e.g. Photography, Real Estate..."
                                                className="w-full h-14 px-5 rounded-xl bg-white border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:shadow-sm outline-none transition-all"
                                                autoFocus
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
                                            <Briefcase size={20} className="text-[var(--color-primary)]" />
                                            Select Business Type
                                        </h2>
                                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">What kind of {formData.industry !== 'Other' ? formData.industry : 'business'} are you?</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {businessTypes.map((type) => (
                                            <button
                                                key={type.name}
                                                onClick={() => setFormData(prev => ({ ...prev, businessType: type.name }))}
                                                className={`p-4 rounded-2xl border flex items-center gap-3 text-left transition-all ${formData.businessType === type.name
                                                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10"
                                                    : "bg-white border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]/30"
                                                    }`}
                                            >
                                                <div className={`flex-shrink-0 ${formData.businessType === type.name ? "text-[var(--color-primary)]" : ""}`}>
                                                    {type.icon}
                                                </div>
                                                <span className={`text-sm font-bold ${formData.businessType === type.name ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)]"}`}>{type.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>

                    </AnimatePresence>

                    {/* Footer Navigation */}
                    <div className="mt-16 pt-8 border-t border-[var(--color-outline-variant)]/10 flex items-center justify-between">
                        <div>
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="px-6 h-14 rounded-2xl font-bold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft size={18} />
                                    Back
                                </button>
                            )}
                        </div>

                        {error && (
                            <p className="w-full text-center text-sm font-medium text-[var(--color-error)] mb-4">{error}</p>
                        )}

                        <button
                            onClick={handleNext}
                            disabled={
                                isCreating ||
                                (step === 1 && (!formData.name || !formData.slug)) ||
                                (step === 2 && !formData.industry) ||
                                (step === 2 && formData.industry === 'Other' && !formData.customIndustry) ||
                                (step === 3 && !formData.businessType)
                            }
                            className="px-8 h-14 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold shadow-xl shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none group"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    {step === 3 ? "Complete Launch" : "Continue"}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
