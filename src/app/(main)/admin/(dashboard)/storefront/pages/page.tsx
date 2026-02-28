"use client";

import React, { useState } from "react";
import {
    Home,
    Image,
    ShoppingBag,
    Briefcase,
    MessageSquare,
    ChevronRight,
    Settings,
    FileText,
    Palette,
    ExternalLink,
    Camera,
    UserCircle,
    Calendar,
    Phone,
    Layout,
    Star,
    ChevronDown,
    User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { HomeEditor } from "@/components/admin/storefront/HomeEditor";
import { ThemesEditor } from "@/components/admin/storefront/ThemesEditor";
import { ProductsEditor } from "@/components/admin/storefront/ProductsEditor";
import { ServicesEditor } from "@/components/admin/storefront/ServicesEditor";
import { BookingEditor } from "@/components/admin/storefront/BookingEditor";
import { OrderEditor } from "@/components/admin/storefront/OrderEditor";
import { StorefrontPreview } from "@/components/admin/storefront/StorefrontPreview";
import { useBusiness } from "@/contexts/BusinessContext";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

type PageTab =
    | "themes" | "cover" | "profile"
    | "home" | "shop" | "services" | "inbox"
    | "contact" | "booking" | "order" | "photos" | "posts" | "reviews";

const GROUPS = [
    {
        title: "Style",
        items: [
            { id: "themes", label: "Theme", icon: Palette, description: "Brand colors & identity" },
            { id: "cover", label: "Cover", icon: Image, description: "Storefront banner" },
            { id: "profile", label: "Profile", icon: UserCircle, description: "Business logo & avi" },
        ]
    },
    {
        title: "Main",
        items: [
            { id: "home", label: "Home", icon: Home, description: "Main landing page" },
            { id: "shop", label: "Shop", icon: ShoppingBag, description: "Product listings" },
            { id: "inbox", label: "Inbox", icon: MessageSquare, description: "Unified messaging" },
            { id: "you", label: "You", icon: User, description: "Customer account & history" },
        ]
    },
    {
        title: "Others",
        items: [
            { id: "contact", label: "Contact", icon: Phone, description: "Info & links" },
            { id: "booking", label: "Booking", icon: Calendar, description: "Appointments" },
            { id: "order", label: "Order", icon: ShoppingBag, description: "Fulfillment" },
            { id: "photos", label: "Photos", icon: Image, description: "Gallery/Portfolio" },
            { id: "posts", label: "Posts", icon: Layout, description: "Updates & news" },
            { id: "reviews", label: "Reviews", icon: Star, description: "Social proof" },
        ]
    }
];

function PagesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = (searchParams.get("tab") as PageTab) || "home";

    const setActiveTab = (tab: PageTab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const { currentBusiness, isLoading } = useBusiness();

    // Track which group is expanded (only one at a time)
    const [expandedGroup, setExpandedGroup] = useState<string | null>("Main");

    const toggleGroup = (title: string) => {
        setExpandedGroup(prev => prev === title ? null : title);
    };

    const activePage = GROUPS.flatMap(g => g.items).find(p => p.id === activeTab);

    // Auto-expand group when tab is selected externally or on mount
    React.useEffect(() => {
        const group = GROUPS.find(g => g.items.some(p => p.id === activeTab));
        if (group && expandedGroup !== group.title) {
            setExpandedGroup(group.title);
        }
    }, [activeTab]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Left Panel - Page List (Tabs) */}
            <div className="w-80 border-r border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)] flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-[var(--color-outline-variant)]/10">
                    <h1 className="text-xl font-bold text-[var(--color-on-surface)]">Pages</h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Manage your storefront content</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 scrollbar-none pb-20">
                    {GROUPS.map((group) => (
                        <div key={group.title} className="mb-2 last:mb-0">
                            <button
                                onClick={() => toggleGroup(group.title)}
                                className="w-full h-10 px-3 flex items-center justify-between group transition-colors hover:bg-[var(--color-surface-container-low)] rounded-lg"
                            >
                                <h3 className="text-sm font-medium text-[var(--color-on-surface-variant)]">
                                    {group.title}
                                </h3>
                                <ChevronDown
                                    size={14}
                                    className={cn(
                                        "text-[var(--color-on-surface-variant)] opacity-30 transition-transform duration-300",
                                        expandedGroup === group.title ? "rotate-0" : "-rotate-90"
                                    )}
                                />
                            </button>

                            <AnimatePresence initial={false}>
                                {expandedGroup === group.title && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-1 mt-1 pb-4">
                                            {group.items.map((page) => (
                                                <button
                                                    key={page.id}
                                                    onClick={() => setActiveTab(page.id as PageTab)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group",
                                                        activeTab === page.id
                                                            ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-sm"
                                                            : "hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            activeTab === page.id
                                                                ? "bg-[var(--color-primary)] text-white"
                                                                : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] group-hover:bg-[var(--color-surface-container-highest)]"
                                                        )}>
                                                            <page.icon size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-sm truncate leading-tight">{page.label}</div>
                                                            <div className={cn(
                                                                "text-[10px] truncate max-w-[140px]",
                                                                activeTab === page.id
                                                                    ? "text-[var(--color-on-primary-container)]/70"
                                                                    : "text-[var(--color-on-surface-variant)]/60"
                                                            )}>
                                                                {page.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {activeTab === page.id && <ChevronRight size={14} className="flex-shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-[var(--color-outline-variant)]/10">
                    <Button variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl">
                        <Settings size={14} />
                        <span className="text-xs">Store Settings</span>
                    </Button>
                </div>
            </div>

            {/* Center Panel - Editor Content */}
            <div className="flex-1 bg-[var(--color-surface-container-low)] overflow-y-auto scrollbar-thin">
                <div className="max-w-4xl mx-auto p-8 pb-32">
                    {/* Header for the content area */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--color-on-surface)] tracking-tight">
                                {activePage?.label}
                            </h2>
                            <p className="text-[var(--color-on-surface-variant)] opacity-60">
                                {activePage?.description}
                            </p>
                        </div>
                    </div>

                    {/* Content Area Mapping */}
                    {activeTab === 'home' || activeTab === 'cover' || activeTab === 'profile' || activeTab === 'contact' ? (
                        <HomeEditor />
                    ) : activeTab === 'themes' ? (
                        <ThemesEditor />
                    ) : activeTab === 'shop' ? (
                        <div className="max-w-md mx-auto">
                            <ProductsEditor />
                        </div>
                    ) : activeTab === 'services' ? (
                        <ServicesEditor />
                    ) : activeTab === 'booking' ? (
                        <BookingEditor />
                    ) : activeTab === 'order' ? (
                        <OrderEditor />
                    ) : (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-3xl p-10 min-h-[500px] flex items-center justify-center text-[var(--color-on-surface-variant)]">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center mx-auto mb-6 opacity-20">
                                    <FileText size={40} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Configure {activePage?.label}</h3>
                                <p className="max-w-sm mx-auto opacity-70 text-sm leading-relaxed">
                                    The management interface for {activePage?.label.toLowerCase()} is coming soon. You'll be able to customize every detail for your storefront here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Persistent Preview */}
            <div className="w-[380px] border-l border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] flex flex-col flex-shrink-0">
                <div className="p-4 flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-[var(--color-on-surface-variant)] opacity-40">Storefront</h2>
                    <div className="flex items-center gap-2">
                        <Link
                            href={currentBusiness ? `/${currentBusiness.slug}` : "#"}
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)] text-[10px] font-bold hover:bg-[var(--color-surface-container-high)] transition-all shadow-sm"
                        >
                            Visit Page <ExternalLink size={10} />
                        </Link>
                        <button
                            onClick={() => {
                                if (currentBusiness) {
                                    const url = `${window.location.origin}/${currentBusiness.slug}`;
                                    navigator.clipboard.writeText(url);
                                    alert("Link copied!");
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface)] text-[10px] font-bold hover:bg-[var(--color-surface-container-high)] transition-all shadow-sm"
                        >
                            Copy Link <ExternalLink size={10} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-surface-container-low)]/30">
                    {isLoading ? (
                        <div className="w-full h-full rounded-[2.5rem] bg-[var(--color-surface-container)] animate-pulse" />
                    ) : currentBusiness ? (
                        <div className="flex justify-center">
                            <StorefrontPreview business={currentBusiness} activeTab={activeTab === 'shop' ? 'shop' : activeTab === 'services' ? 'services' : 'home'} />
                        </div>
                    ) : (
                        <div className="text-center text-[var(--color-on-surface-variant)] opacity-40 mt-20">
                            <p className="text-sm italic">No business data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PagesManagementPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[var(--color-surface)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        }>
            <PagesContent />
        </Suspense>
    );
}
