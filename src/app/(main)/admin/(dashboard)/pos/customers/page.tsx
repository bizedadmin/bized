"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Users, Search, RefreshCw, Phone, ShoppingBag, Mail, MapPin, Calendar, ArrowRight, TrendingUp, DollarSign, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { SlidersHorizontal, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Schema.org Types ──────────────────────────────────────────────────────────

interface PostalAddress {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
}

interface Person {
    "@type": "Person";
    name: string;
    telephone?: string;
    email?: string;
    address?: PostalAddress;
}

// ─── POS Customer Interface (Derived) ──────────────────────────────────────────

interface POSCustomer {
    person: Person;
    stats: {
        orderCount: number;
        totalSpend: number;
        currency: string;
        lastOrderDate: string;
    };
}

const POS_CHANNELS = ["Manual", "POS", "Phone", "WhatsApp"];

export default function POSCustomersPage() {
    const { currentBusiness } = useBusiness();
    const router = useRouter();
    const [customers, setCustomers] = useState<POSCustomer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // ── Quick Add States ──
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newCust, setNewCust] = useState({ name: "", phone: "", email: "", address: "" });
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fetchCustomers = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setIsLoading(true);
        try {
            // 1. Fetch from Orders API (for history/legacy)
            const ordersRes = await fetch(`/api/orders?storeId=${currentBusiness._id}&limit=1000`);
            const ordersData = await ordersRes.json();
            const allOrders = (ordersData.orders ?? []).filter((o: any) => POS_CHANNELS.includes(o.orderChannel));

            // 2. Fetch from dedicated Customers API
            const custsRes = await fetch(`/api/customers?storeId=${currentBusiness._id}`);
            const custsData = await custsRes.json();
            const standaloneCusts = custsData.customers ?? [];

            const customerMap = new Map<string, POSCustomer>();

            // Process Standalone Customers first (Source of truth)
            standaloneCusts.forEach((c: any) => {
                const key = c.telephone || c.name;
                customerMap.set(key, {
                    person: {
                        "@type": "Person",
                        name: c.name,
                        telephone: c.telephone,
                        email: c.email,
                        address: c.address,
                    },
                    stats: {
                        orderCount: 0,
                        totalSpend: 0,
                        currency: currentBusiness.currency || "KES",
                        lastOrderDate: c.createdAt || new Date().toISOString(),
                    }
                });
            });

            // Merge with Order History
            allOrders.forEach((order: any) => {
                const customerData = order.customer;
                if (!customerData) return;

                const key = customerData.telephone || customerData.name || "unknown";
                const existing = customerMap.get(key);

                if (existing) {
                    existing.stats.orderCount += 1;
                    existing.stats.totalSpend += (order.totalPayable ?? order.price ?? 0);
                    const currentLast = new Date(existing.stats.lastOrderDate);
                    const orderDate = new Date(order.orderDate || order.createdAt);
                    if (orderDate > currentLast) {
                        existing.stats.lastOrderDate = orderDate.toISOString();
                    }
                } else {
                    customerMap.set(key, {
                        person: {
                            "@type": "Person",
                            name: customerData.name || "Unknown Customer",
                            telephone: customerData.telephone,
                            email: customerData.email,
                            address: customerData.address,
                        },
                        stats: {
                            orderCount: 1,
                            totalSpend: (order.totalPayable ?? order.price ?? 0),
                            currency: order.priceCurrency || "KES",
                            lastOrderDate: (order.orderDate || order.createdAt),
                        }
                    });
                }
            });

            const sorted = Array.from(customerMap.values()).sort((a, b) => b.stats.totalSpend - a.stats.totalSpend);
            setCustomers(sorted);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            setCustomers([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentBusiness?._id, currentBusiness?.currency]);

    const handleSaveCustomer = async (shouldSale = false) => {
        if (!newCust.name || !currentBusiness?._id) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: currentBusiness._id,
                    name: newCust.name,
                    telephone: newCust.phone,
                    email: newCust.email,
                    address: newCust.address ? { "@type": "PostalAddress", streetAddress: newCust.address } : undefined
                })
            });

            if (res.ok) {
                if (shouldSale) {
                    router.push(`/admin/pos?prefill=${encodeURIComponent(JSON.stringify({
                        name: newCust.name,
                        phone: newCust.phone,
                        email: newCust.email
                    }))}`);
                } else {
                    setSaveSuccess(true);
                    setTimeout(() => {
                        setSaveSuccess(false);
                        setIsSheetOpen(false);
                        setNewCust({ name: "", phone: "", email: "", address: "" });
                        fetchCustomers();
                    }, 1500);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const filtered = customers.filter(c =>
        c.person.name.toLowerCase().includes(search.toLowerCase()) ||
        c.person.telephone?.includes(search) ||
        c.person.email?.toLowerCase().includes(search.toLowerCase())
    );

    const formatPrice = (n: number, cur: string) =>
        `${cur} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return "Unknown";
        }
    };

    // ─── JSON-LD Schema ───
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "numberOfItems": filtered.length,
        "itemListElement": filtered.map((c, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
                ...c.person,
                "description": `Customer with ${c.stats.orderCount} orders, total spend ${c.stats.currency} ${c.stats.totalSpend}`
            }
        }))
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 bg-[var(--color-surface)] min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">
                        Customer Directory
                    </h1>
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 mt-1">
                        Managing {customers.length} business relationships across POS & local channels.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchCustomers}
                        className="h-14 w-14 p-0 rounded-2xl border-[var(--color-outline-variant)]/30 hover:bg-[var(--color-surface-container)] transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </Button>
                    <Button
                        onClick={() => setIsSheetOpen(true)}
                        className="h-14 px-8 rounded-2xl gap-2 font-black bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-m3-2)] hover:shadow-[var(--shadow-m3-3)] active:scale-95 transition-all text-base"
                    >
                        <Plus size={20} strokeWidth={3} /> New Customer
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: "Total Profiles", value: customers.length, icon: Users, color: "var(--color-primary)" },
                    { label: "Phone/WhatsApp", value: customers.filter(c => c.person.telephone).length, icon: UserCheck, color: "oklch(0.6 0.15 150)" },
                    { label: "Customer LTV", value: formatPrice(customers.reduce((acc, c) => acc + c.stats.totalSpend, 0), currentBusiness?.currency || "KES"), icon: TrendingUp, color: "oklch(0.55 0.15 285)" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2.5rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex items-center gap-5 group hover:shadow-[var(--shadow-m3-2)] transition-all">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={26} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-[var(--color-on-surface)] tracking-tight">{stat.value}</div>
                            <div className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50 font-black tracking-widest uppercase">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="relative group max-w-xl">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] group-focus-within:opacity-100 transition-all" />
                <input
                    type="text"
                    placeholder="Find customers by name, phone or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold text-[var(--color-on-surface)] placeholder:opacity-30 focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-inner"
                />
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 rounded-[2rem] bg-[var(--color-surface-container-low)] animate-pulse border border-[var(--color-outline-variant)]/10" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-[var(--color-surface-container-low)]/30 rounded-[3rem] border-2 border-dashed border-[var(--color-outline-variant)]/10">
                    <div className="w-20 h-20 rounded-[2rem] bg-[var(--color-surface-container)] flex items-center justify-center mb-6">
                        <Users size={32} className="text-[var(--color-on-surface-variant)] opacity-20" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-on-surface)] opacity-40">No customers found</h3>
                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-30 mt-2 max-w-xs mx-auto">
                        {search ? "Try adjusting your search filters to find what you're looking for." : "Start processing sales in the Register to build your customer list."}
                    </p>
                    {search && (
                        <Button variant="ghost" onClick={() => setSearch("")} className="mt-6 font-bold text-[var(--color-primary)]">
                            Clear Search
                        </Button>
                    )}
                </div>
            ) : (
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
                >
                    <AnimatePresence>
                        {filtered.map((customer) => (
                            <motion.div
                                layout
                                key={customer.person.telephone || customer.person.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => router.push(`/admin/pos?prefill=${encodeURIComponent(JSON.stringify({
                                    name: customer.person.name,
                                    phone: customer.person.telephone,
                                    email: customer.person.email
                                }))}`)}
                                className="group bg-[var(--color-surface)] rounded-[var(--radius-m3-xl)] border border-[var(--color-outline-variant)]/15 p-7 flex flex-col gap-6 hover:border-[var(--color-primary)]/40 shadow-[var(--shadow-m3-1)] hover:shadow-[var(--shadow-m3-3)] hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                            >
                                {/* Visual Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[var(--color-primary)]/10 transition-colors" />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-[var(--radius-m3-l)] bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center font-black text-2xl shadow-lg shadow-[var(--color-primary)]/20 group-hover:scale-110 transition-transform">
                                            {customer.person.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-xl text-[var(--color-on-surface)] truncate pr-4 tracking-tight">
                                                {customer.person.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs font-black text-[var(--color-on-surface-variant)] opacity-40 mt-1 uppercase tracking-widest">
                                                <Calendar size={12} />
                                                Active {formatDate(customer.stats.lastOrderDate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 relative z-10">
                                    {customer.person.telephone && (
                                        <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors">
                                            <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center">
                                                <Phone size={15} className="opacity-60" />
                                            </div>
                                            {customer.person.telephone}
                                        </div>
                                    )}
                                    {customer.person.email && (
                                        <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors">
                                            <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center">
                                                <Mail size={15} className="opacity-60" />
                                            </div>
                                            {customer.person.email}
                                        </div>
                                    )}
                                    {customer.person.address?.streetAddress && (
                                        <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-on-surface-variant)] opacity-70">
                                            <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center">
                                                <MapPin size={15} className="opacity-60" />
                                            </div>
                                            <span className="truncate">{customer.person.address.streetAddress}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-5 border-t border-[var(--color-outline-variant)]/10 flex items-center justify-between mt-auto relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-1">Total LTV</span>
                                        <span className="font-black text-[var(--color-primary)] text-xl tracking-tight">
                                            {formatPrice(customer.stats.totalSpend, customer.stats.currency)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-1">POS Sales</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 px-4 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-black flex items-center gap-2 shadow-sm">
                                                <ShoppingBag size={14} />
                                                {customer.stats.orderCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* ─── Add Customer Sheet ─── */}
            <Sheet
                open={isSheetOpen}
                onClose={() => !isSaving && setIsSheetOpen(false)}
                title="New Customer"
                icon={<Users size={20} />}
                footer={
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <Button
                            disabled={isSaving || !newCust.name}
                            variant="outline"
                            onClick={() => handleSaveCustomer(false)}
                            className="h-14 rounded-[var(--radius-m3-l)] font-black text-sm border-2 border-[var(--color-outline-variant)]/40"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={18} className="text-emerald-500" /> : "Save Profile"}
                        </Button>
                        <Button
                            disabled={isSaving || !newCust.name}
                            onClick={() => handleSaveCustomer(true)}
                            className="h-14 rounded-[var(--radius-m3-l)] font-black text-sm bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary)]/20"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Save and Sale"}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Full Name *</label>
                            <input
                                type="text"
                                placeholder="Alice Johnson"
                                value={newCust.name}
                                onChange={e => setNewCust({ ...newCust, name: e.target.value })}
                                className="w-full h-14 px-5 rounded-[var(--radius-m3-l)] bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+254..."
                                value={newCust.phone}
                                onChange={e => setNewCust({ ...newCust, phone: e.target.value })}
                                className="w-full h-14 px-5 rounded-[var(--radius-m3-l)] bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Email Address</label>
                            <input
                                type="email"
                                placeholder="alice@example.com"
                                value={newCust.email}
                                onChange={e => setNewCust({ ...newCust, email: e.target.value })}
                                className="w-full h-14 px-5 rounded-[var(--radius-m3-l)] bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Physical Address</label>
                            <textarea
                                placeholder="Street, Apartment, City"
                                value={newCust.address}
                                rows={3}
                                onChange={e => setNewCust({ ...newCust, address: e.target.value })}
                                className="w-full px-5 py-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all resize-none shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="p-5 rounded-[var(--radius-m3-xl)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex gap-4">
                        <div className="w-12 h-12 rounded-[var(--radius-m3-l)] bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                            <CheckCircle2 size={20} />
                        </div>
                        <p className="text-xs font-bold text-[var(--color-on-surface-variant)] leading-relaxed">
                            Profiles created here are saved to your CRM. Use <strong className="text-[var(--color-primary)]">Save and Sale</strong> to jump immediately to the register with these details.
                        </p>
                    </div>
                </div>
            </Sheet>
        </div>
    );
}
