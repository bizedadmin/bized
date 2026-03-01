"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import {
    ArrowLeft, User, Phone, Search, Plus, Trash2, Package,
    ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, X,
    Loader2, ShoppingCart, Tag, Percent, CreditCard, Banknote,
    Smartphone, Building2, StickyNote, Receipt, UserSearch,
    Hash, ChevronRight, Edit2, Info, Mail, Slash, Calculator, Settings2, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
    id: string;
    productId?: string;
    name: string;
    image?: string;
    qty: number;
    unitPrice: number;
    note?: string;
}

interface ExistingCustomer {
    _id: string;
    name: string;
    telephone?: string;
    email?: string;
    orderCount?: number;
}

const CHANNELS = ["Manual", "POS", "Phone", "WhatsApp"] as const;
const PAYMENT_METHODS = [
    { key: "Cash", label: "Cash", icon: Banknote },
    { key: "Card", label: "Card", icon: CreditCard },
    { key: "M-Pesa", label: "M-Pesa", icon: Smartphone },
    { key: "Bank Transfer", label: "Bank", icon: Building2 },
] as const;

const COUNTRY_CODES = [
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
    { code: "+255", flag: "🇹🇿", name: "Tanzania" },
    { code: "+256", flag: "🇺🇬", name: "Uganda" },
    { code: "+250", flag: "🇷🇼", name: "Rwanda" },
    { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+1", flag: "🇺🇸", name: "USA" },
    { code: "+44", flag: "🇬🇧", name: "UK" },
    { code: "+91", flag: "🇮🇳", name: "India" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
];

// ─── Micro-components ───────────────────────────────────────────────────────────

const inputCls =
    "w-full h-12 px-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 " +
    "font-bold text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] " +
    "placeholder:opacity-40 focus:outline-none focus:border-[var(--color-primary)]/60 " +
    "focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all";

function FieldLabel({ children, required, subtle }: { children: React.ReactNode; required?: boolean; subtle?: string }) {
    return (
        <div className="mb-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">
                {children}{required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
            </label>
            {subtle && <p className="text-[10px] font-medium text-[var(--color-on-surface-variant)] opacity-35 mt-0.5">{subtle}</p>}
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NewOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentBusiness } = useBusiness();

    // ── Customer ──
    const [custName, setCustName] = useState("");
    const [countryCode, setCountryCode] = useState("+254");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [showCodes, setShowCodes] = useState(false);
    const [custSearch, setCustSearch] = useState("");
    const [custResults, setCustResults] = useState<ExistingCustomer[]>([]);
    const [showCustDrop, setShowCustDrop] = useState(false);
    const codesRef = useRef<HTMLDivElement>(null);
    const custRef = useRef<HTMLDivElement>(null);

    // ── Items ──
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");
    const [showCustom, setShowCustom] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customPrice, setCustomPrice] = useState("");
    const [noteTarget, setNoteTarget] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // ── Order details ──
    const [channel, setChannel] = useState("POS");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [remark, setRemark] = useState("");
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
    const [adjustment, setAdjustment] = useState(0);

    // ── Submit ──
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ── Customer Expand/Edit ──
    const [isCustExpanded, setIsCustExpanded] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [detailItem, setDetailItem] = useState<any>(null);
    const [detailQty, setDetailQty] = useState(1);
    const [detailNote, setDetailNote] = useState("");
    const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);
    const [editingLineId, setEditingLineId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'entry' | 'summary'>('entry');

    // ── Add New Customer ──
    const [isAddCustSheetOpen, setIsAddCustSheetOpen] = useState(false);
    const [newQuickCust, setNewQuickCust] = useState({ name: "", phone: "", email: "", address: "" });
    const [isAddCustSaving, setIsAddCustSaving] = useState(false);
    const [addCustSuccess, setAddCustSuccess] = useState(false);

    const currency = currentBusiness?.currency ?? "KES";
    const products = currentBusiness?.products ?? [];

    const filteredProducts = query
        ? products.filter((p: any) => p.name?.toLowerCase().includes(query.toLowerCase()))
        : products.slice(0, 40);

    // ── Totals ──
    const subtotal = lineItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const discountAmt = discountType === "percent" ? subtotal * (discount / 100) : discount;
    const afterDiscount = Math.max(0, subtotal - discountAmt);
    const totalPayable = Math.max(0, afterDiscount + adjustment);
    const itemCount = lineItems.reduce((s, i) => s + i.qty, 0);
    const fmt = (n: number) => `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    // ── Prefill from query params ──
    useEffect(() => {
        const p = searchParams.get("prefill");
        if (p) {
            try {
                const data = JSON.parse(decodeURIComponent(p));
                if (data.name) setCustName(data.name);
                if (data.phone) {
                    const raw = data.phone;
                    const cc = COUNTRY_CODES.find(x => raw.startsWith(x.code));
                    if (cc) {
                        setCountryCode(cc.code);
                        setPhone(raw.slice(cc.code.length));
                    } else {
                        setPhone(raw);
                    }
                }
                if (data.email) setEmail(data.email);
            } catch (e) {
                console.error("Failed to parse prefill data", e);
            }
        }
    }, [searchParams]);

    // ── Click-outside handlers ──
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (codesRef.current && !codesRef.current.contains(e.target as Node)) setShowCodes(false);
            if (custRef.current && !custRef.current.contains(e.target as Node)) setShowCustDrop(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    useEffect(() => {
        if (showSearch) setTimeout(() => searchRef.current?.focus(), 50);
    }, [showSearch]);

    // ── Customer search (history & directory) ──
    useEffect(() => {
        if (!custSearch.trim() || !currentBusiness?._id) { setCustResults([]); return; }
        const t = setTimeout(async () => {
            try {
                const [ordersRes, custsRes] = await Promise.all([
                    fetch(`/api/orders?storeId=${currentBusiness._id}&limit=50`),
                    fetch(`/api/customers?storeId=${currentBusiness._id}`)
                ]);
                const [ordersData, custsData] = await Promise.all([
                    ordersRes.json(),
                    custsRes.json()
                ]);

                const seen = new Map<string, ExistingCustomer>();

                // Merge Standalone
                (custsData.customers ?? []).forEach((c: any) => {
                    const key = c.telephone || c.name;
                    seen.set(key, { _id: c._id, name: c.name, telephone: c.telephone, email: c.email });
                });

                // Merge History
                (ordersData.orders ?? []).forEach((o: any) => {
                    const key = o.customer?.telephone || o.customer?.name;
                    if (key && !seen.has(key)) {
                        seen.set(key, { _id: key, name: o.customer.name, telephone: o.customer.telephone, email: o.customer.email });
                    }
                });

                const term = custSearch.toLowerCase();
                const filtered = Array.from(seen.values()).filter(c =>
                    c.name.toLowerCase().includes(term) ||
                    c.telephone?.includes(custSearch) ||
                    c.email?.toLowerCase().includes(term)
                ).slice(0, 10);

                setCustResults(filtered);
                setShowCustDrop(filtered.length > 0);
            } catch { setCustResults([]); }
        }, 300);
        return () => clearTimeout(t);
    }, [custSearch, currentBusiness?._id]);

    // ── Item helpers ──
    const addProduct = (p: any) => {
        setDetailItem(p);
        setDetailQty(1);
        setDetailNote("");
        setSelectedModifiers([]);
        setEditingLineId(null);
        setShowSearch(false);
        setQuery("");
    };

    const editLineItem = (item: LineItem) => {
        // Find the original product to get modifiers list
        const product = products.find((p: any) => p.id === item.productId);
        setDetailItem(product || { id: item.productId, name: item.name, price: item.unitPrice, image: item.image });
        setDetailQty(item.qty);
        setDetailNote(item.note || "");
        setEditingLineId(item.id);
        // Note: selectedModifiers mapping back from string notes might be complex, 
        // for now we populate the note field which contains them.
        setSelectedModifiers([]);
    };

    const toggleModifier = (mod: any) => {
        setSelectedModifiers(prev =>
            prev.find(m => m.id === mod.id)
                ? prev.filter(m => m.id !== mod.id)
                : [...prev, mod]
        );
    };

    const totalDetailPrice = (detailItem?.price ?? 0) + selectedModifiers.reduce((acc, m) => acc + (m.price ?? 0), 0);

    const confirmAddToCart = () => {
        if (!detailItem) return;
        const modNames = selectedModifiers.length > 0 ? selectedModifiers.map(m => m.name).join(", ") : "";
        const finalNote = detailNote ? `${detailNote}${modNames ? ` (${modNames})` : ""}` : modNames;

        setLineItems(prev => {
            if (editingLineId) {
                return prev.map(i => i.id === editingLineId ? {
                    ...i,
                    qty: detailQty,
                    unitPrice: totalDetailPrice,
                    note: finalNote
                } : i);
            }
            return [...prev, {
                id: crypto.randomUUID(),
                productId: detailItem.id,
                name: detailItem.name,
                image: detailItem.image,
                qty: detailQty,
                unitPrice: totalDetailPrice,
                note: finalNote
            }];
        });
        setDetailItem(null);
        setEditingLineId(null);
    };

    const addCustomItem = () => {
        if (!customName || !customPrice) return;
        setLineItems(prev => [...prev, { id: crypto.randomUUID(), name: customName, qty: 1, unitPrice: parseFloat(customPrice) || 0 }]);
        setCustomName(""); setCustomPrice(""); setShowCustom(false);
    };

    const updateQty = (id: string, d: number) => setLineItems(p => p.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i));
    const setQty = (id: string, v: string) => setLineItems(p => p.map(i => i.id === id ? { ...i, qty: Math.max(1, parseInt(v) || 1) } : i));
    const updatePrice = (id: string, v: string) => setLineItems(p => p.map(i => i.id === id ? { ...i, unitPrice: parseFloat(v) || 0 } : i));
    const setNote = (id: string, note: string) => setLineItems(p => p.map(i => i.id === id ? { ...i, note } : i));
    const removeItem = (id: string) => setLineItems(p => p.filter(i => i.id !== id));

    const fillCustomer = (c: ExistingCustomer) => {
        setCustName(c.name);
        setCustSearch("");
        setIsSearchModalOpen(false);
        if (c.telephone) {
            const raw = c.telephone;
            const cc = COUNTRY_CODES.find(x => raw.startsWith(x.code));
            if (cc) {
                setCountryCode(cc.code);
                setPhone(raw.slice(cc.code.length));
            } else {
                setPhone(raw);
            }
        }
        if (c.email) setEmail(c.email);
        setCustSearch("");
        setShowCustDrop(false);
        setIsCustExpanded(false); // Make it compact after selection
    };

    const handleSaveNewCustomer = async (andSale = false) => {
        if (!newQuickCust.name || !currentBusiness?._id) return;
        setIsAddCustSaving(true);
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: currentBusiness._id,
                    name: newQuickCust.name,
                    telephone: newQuickCust.phone,
                    email: newQuickCust.email,
                    address: newQuickCust.address ? { "@type": "PostalAddress", streetAddress: newQuickCust.address } : undefined
                })
            });
            if (res.ok) {
                // Pre-fill the POS customer fields
                setCustName(newQuickCust.name);
                if (newQuickCust.phone) {
                    const raw = newQuickCust.phone;
                    const cc = COUNTRY_CODES.find(x => raw.startsWith(x.code));
                    if (cc) { setCountryCode(cc.code); setPhone(raw.slice(cc.code.length)); }
                    else setPhone(raw);
                }
                if (newQuickCust.email) setEmail(newQuickCust.email);
                setAddCustSuccess(true);
                setTimeout(() => {
                    setAddCustSuccess(false);
                    setIsAddCustSheetOpen(false);
                    setNewQuickCust({ name: "", phone: "", email: "", address: "" });
                }, 1200);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsAddCustSaving(false);
        }
    };

    const resetForm = () => {
        setCustName(""); setPhone(""); setEmail(""); setAddress(""); setCustSearch("");
        setLineItems([]); setRemark(""); setDiscount(0); setAdjustment(0);
        setChannel("Manual"); setPaymentMethod("Cash"); setOrderNumber(null); setOrderId(null);
        setIsCustExpanded(false);
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!custName || !phone) { setError("Customer name and phone are required."); return; }
        if (lineItems.length === 0) { setError("Add at least one item."); return; }
        if (!currentBusiness?._id) return;
        setIsSubmitting(true); setError(null);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: currentBusiness._id,
                    customer: {
                        "@type": "Person", name: custName,
                        telephone: `${countryCode}${phone}`,
                        email: email || undefined,
                        address: address ? { "@type": "PostalAddress", streetAddress: address } : undefined,
                    },
                    orderedItem: lineItems.map(i => ({
                        "@type": "OrderItem", productId: i.productId, name: i.name, image: i.image,
                        orderQuantity: i.qty, unitPrice: i.unitPrice, lineTotal: i.unitPrice * i.qty,
                        note: i.note || undefined, orderItemStatus: "OrderProcessing",
                    })),
                    price: subtotal, priceCurrency: currency,
                    discountTotal: discountAmt,
                    taxTotal: 0, shippingCost: 0,
                    totalPayable, adjustment,
                    orderChannel: channel,
                    paymentMethod,
                    notes: remark || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to create order");
            setOrderNumber(data.orderNumber);
            setOrderId(data.id);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Success ──
    if (orderNumber) {
        const now = new Date();
        const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

        return (
            <div className="min-h-screen bg-[var(--color-surface-container-low)] py-8 px-4">
                <div className="max-w-2xl mx-auto space-y-4">

                    {/* ── Success Hero ── */}
                    <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-2)] p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-[1.75rem] bg-[var(--color-tertiary-container)] text-[var(--color-tertiary)] flex items-center justify-center shadow-[var(--shadow-m3-3)] animate-in zoom-in duration-300">
                                <CheckCircle2 size={40} strokeWidth={2} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center shadow-md text-xs font-black">✓</div>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-[var(--color-on-surface)] mb-1">Order Created!</h1>
                        <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-50">{dateStr} · {timeStr}</p>
                        <div className="mt-5 px-8 py-4 rounded-2xl bg-[var(--color-primary-container)] border border-[var(--color-primary)]/15 shadow-[var(--shadow-m3-1)] w-full max-w-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-primary-container)] opacity-50 mb-1">Order Reference</p>
                            <p className="font-mono font-black text-2xl text-[var(--color-primary)] tracking-wider">{orderNumber}</p>
                        </div>
                    </div>

                    {/* ── Customer & Payment ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[var(--color-surface)] rounded-[1.75rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-4">Customer</p>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center font-black text-lg shadow-lg shadow-[var(--color-primary)]/20">
                                    {custName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-base text-[var(--color-on-surface)] leading-tight">{custName}</p>
                                    <p className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-50">{countryCode}{phone}</p>
                                </div>
                            </div>
                            {email && (
                                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60 mb-2">
                                    <Mail size={12} /> {email}
                                </div>
                            )}
                            {address && (
                                <div className="flex items-start gap-2 text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60">
                                    <Hash size={12} className="mt-0.5 shrink-0" /> {address}
                                </div>
                            )}
                        </div>

                        <div className="bg-[var(--color-surface)] rounded-[1.75rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Payment & Channel</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[var(--color-on-surface-variant)] opacity-50 uppercase tracking-widest">Method</span>
                                <span className="font-black text-sm text-[var(--color-on-surface)] flex items-center gap-2">
                                    {paymentMethod === "Cash" && <Banknote size={14} className="text-[var(--color-primary)]" />}
                                    {paymentMethod === "Card" && <CreditCard size={14} className="text-[var(--color-primary)]" />}
                                    {paymentMethod === "M-Pesa" && <Smartphone size={14} className="text-[var(--color-primary)]" />}
                                    {paymentMethod === "Bank Transfer" && <Building2 size={14} className="text-[var(--color-primary)]" />}
                                    {paymentMethod}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[var(--color-on-surface-variant)] opacity-50 uppercase tracking-widest">Channel</span>
                                <span className="font-black text-sm text-[var(--color-on-surface)]">{channel}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[var(--color-on-surface-variant)] opacity-50 uppercase tracking-widest">Status</span>
                                <span className="px-3 py-1 rounded-full bg-[oklch(0.6_0.15_150)]/15 text-[oklch(0.45_0.15_150)] text-[10px] font-black uppercase tracking-widest">Processing</span>
                            </div>
                            {remark && (
                                <div className="pt-2 border-t border-[var(--color-outline-variant)]/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-1">Note</p>
                                    <p className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-70 leading-relaxed">{remark}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Order Items ── */}
                    <div className="bg-[var(--color-surface)] rounded-[1.75rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] overflow-hidden">
                        <div className="px-6 pt-5 pb-3 border-b border-[var(--color-outline-variant)]/10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <Package size={15} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">Order Items</p>
                            <span className="ml-auto text-[10px] font-black bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full px-3 py-1">
                                {lineItems.reduce((s, i) => s + i.qty, 0)} items
                            </span>
                        </div>
                        <div className="divide-y divide-[var(--color-outline-variant)]/8">
                            {lineItems.map((item, idx) => (
                                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-center shrink-0 text-xs font-black text-[var(--color-on-surface-variant)] opacity-40">
                                        {idx + 1}
                                    </div>
                                    {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm text-[var(--color-on-surface)] truncate">{item.name}</p>
                                        {item.note && <p className="text-[10px] font-medium text-[var(--color-primary)] opacity-60 truncate mt-0.5">{item.note}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-sm text-[var(--color-on-surface)]">{fmt(item.unitPrice * item.qty)}</p>
                                        <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-40">{item.qty} × {fmt(item.unitPrice)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-6 pt-3 border-t border-[var(--color-outline-variant)]/10 space-y-2.5">
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-[var(--color-on-surface-variant)] opacity-60">Subtotal</span>
                                <span className="font-black text-[var(--color-on-surface)]">{fmt(subtotal)}</span>
                            </div>
                            {discountAmt > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-[var(--color-error)] opacity-80">Discount {discountType === "percent" ? `(${discount}%)` : ""}</span>
                                    <span className="font-black text-[var(--color-error)]">− {fmt(discountAmt)}</span>
                                </div>
                            )}
                            {adjustment !== 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-[var(--color-on-surface-variant)] opacity-60">Adjustment</span>
                                    <span className="font-black text-[var(--color-on-surface)]">{adjustment > 0 ? "+ " : "− "}{fmt(Math.abs(adjustment))}</span>
                                </div>
                            )}
                            <div className="h-px bg-[var(--color-outline-variant)]/15 my-1" />
                            <div className="flex justify-between">
                                <span className="font-black text-base text-[var(--color-on-surface)]">Total Paid</span>
                                <span className="font-black text-xl text-[var(--color-primary)]">{fmt(totalPayable)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button
                            onClick={() => orderId && router.push(`/admin/orders/${orderId}`)}
                            className="h-14 rounded-2xl font-black bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-m3-2)] hover:shadow-[var(--shadow-m3-3)] active:scale-95 transition-all"
                        >
                            View Order
                        </Button>
                        <Button
                            onClick={() => window.print()}
                            variant="outline"
                            className="h-14 rounded-2xl font-black border-2 border-[var(--color-outline-variant)]/40 flex items-center justify-center gap-2 hover:bg-[var(--color-surface-container)] active:scale-95 transition-all"
                        >
                            <Receipt size={18} /> Print Receipt
                        </Button>
                        <Button
                            onClick={resetForm}
                            variant="outline"
                            className="h-14 rounded-2xl font-black border-2 border-[var(--color-outline-variant)]/40 hover:bg-[var(--color-surface-container)] active:scale-95 transition-all"
                        >
                            + New Sale
                        </Button>
                    </div>
                    <div className="flex justify-center pb-4">
                        <Button
                            onClick={() => router.push("/admin/pos/transactions")}
                            variant="text"
                            className="h-10 px-6 rounded-2xl font-black text-[var(--color-on-surface-variant)] opacity-50 hover:opacity-100 transition-all"
                        >
                            View All Transactions →
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Two-column POS layout ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[var(--color-surface-container-low)]">
            {/* ══ MOBILE BOTTOM NAV ══ */}
            <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[50] pointer-events-auto">
                <div className="bg-[var(--color-surface-container-high)] backdrop-blur-xl border border-[var(--color-outline-variant)]/10 rounded-full p-2 shadow-[var(--shadow-m3-3)] flex gap-2">
                    <button
                        onClick={() => setActiveTab('entry')}
                        className={cn(
                            "flex-1 h-12 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95",
                            activeTab === 'entry'
                                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg"
                                : "text-[var(--color-on-surface-variant)] opacity-50 hover:opacity-100"
                        )}
                    >
                        <UserSearch size={16} />
                        Entry
                    </button>
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={cn(
                            "flex-1 h-12 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 relative",
                            activeTab === 'summary'
                                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg"
                                : "text-[var(--color-on-surface-variant)] opacity-50 hover:opacity-100"
                        )}
                    >
                        <Receipt size={16} />
                        Summary
                        {itemCount > 0 && activeTab !== 'summary' && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-error)] text-[var(--color-on-error)] text-[10px] flex items-center justify-center animate-bounce">
                                {itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Two-column layout ── */}
            <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-64px)]">

                {/* ══ LEFT: Customer + Items ══════════════════════════════════════ */}
                <div className={cn(
                    "flex-1 p-4 sm:p-8 pb-32 lg:pb-8 space-y-5 overflow-y-auto",
                    activeTab !== 'entry' && "hidden lg:block"
                )}>

                    {/* ── Customer section ── */}
                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-m3-xl)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] overflow-hidden">
                        <div className="px-6 pt-5 pb-3 border-b border-[var(--color-outline-variant)]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                    <User size={15} />
                                </div>
                                <h2 className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">Customer</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsAddCustSheetOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[10px] font-black text-[var(--color-primary)] transition-all"
                                >
                                    <UserPlus size={12} />
                                    Add New
                                </button>
                                {(phone || email || address) && (
                                    <button
                                        onClick={() => setIsCustExpanded(!isCustExpanded)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[10px] font-black text-[var(--color-primary)] transition-all"
                                    >
                                        {isCustExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        {isCustExpanded ? "Minimize" : "View Details"}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Modal Search Trigger */}
                            <div className="relative group">
                                <button
                                    type="button"
                                    onClick={() => setIsSearchModalOpen(true)}
                                    className="w-full h-14 pl-11 pr-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)]/50 border border-[var(--color-outline-variant)]/5 flex items-center text-left hover:bg-[var(--color-surface-container-high)]/30 transition-all group"
                                >
                                    <UserSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-hover:text-[var(--color-primary)] group-hover:opacity-100 transition-all" />
                                    <span className={cn(
                                        "text-base font-black truncate",
                                        custName ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)] opacity-40"
                                    )}>
                                        {custName || "Search by name or phone..."}
                                    </span>
                                    <div className="ml-auto w-8 h-8 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Search size={14} className="text-[var(--color-on-surface-variant)]" />
                                    </div>
                                </button>
                            </div>

                            {/* Summary / Expandable Info */}
                            {(phone || email || address) && !isCustExpanded && (
                                <div className="flex flex-wrap gap-4 px-4 py-3 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)]/30 border border-[var(--color-outline-variant)]/5">
                                    {phone && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-on-surface-variant)] opacity-70">
                                            <div className="w-6 h-6 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-center"><Phone size={12} /></div>
                                            {countryCode}{phone}
                                        </div>
                                    )}
                                    {email && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-on-surface-variant)] opacity-70">
                                            <div className="w-6 h-6 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-center"><Mail size={12} /></div>
                                            {email}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isCustExpanded && (
                                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-2">WhatsApp / Phone</p>
                                            <p className="font-black text-sm text-[var(--color-on-surface)]">{countryCode} {phone || "Not set"}</p>
                                        </div>
                                        <div className="p-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-2">Email Address</p>
                                            <p className="font-black text-sm text-[var(--color-on-surface)] truncate">{email || "Not set"}</p>
                                        </div>
                                    </div>
                                    {address && (
                                        <div className="p-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-2">Delivery Address</p>
                                            <p className="font-black text-sm text-[var(--color-on-surface)]">{address}</p>
                                        </div>
                                    )}
                                    <Button
                                        onClick={() => setIsEditSheetOpen(true)}
                                        variant="outline"
                                        className="h-12 w-full rounded-[var(--radius-m3-l)] border-2 border-[var(--color-outline-variant)]/40 font-black text-xs gap-2"
                                    >
                                        <Edit2 size={14} /> Edit Customer Details
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Add New Customer Sheet ── */}
                    <Sheet
                        open={isAddCustSheetOpen}
                        onClose={() => !isAddCustSaving && setIsAddCustSheetOpen(false)}
                        title="New Customer"
                        icon={<UserPlus size={20} />}
                        footer={
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                <Button
                                    disabled={isAddCustSaving || !newQuickCust.name}
                                    variant="outline"
                                    onClick={() => handleSaveNewCustomer(false)}
                                    className="h-14 rounded-[var(--radius-m3-l)] font-black text-sm border-2 border-[var(--color-outline-variant)]/40"
                                >
                                    {isAddCustSaving ? <Loader2 size={18} className="animate-spin" /> : addCustSuccess ? <CheckCircle2 size={18} className="text-emerald-500" /> : "Save Profile"}
                                </Button>
                                <Button
                                    disabled={isAddCustSaving || !newQuickCust.name}
                                    onClick={() => handleSaveNewCustomer(true)}
                                    className="h-14 rounded-[var(--radius-m3-l)] font-black text-sm bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary)]/20"
                                >
                                    {isAddCustSaving ? <Loader2 size={18} className="animate-spin" /> : "Save & Fill"}
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
                                        value={newQuickCust.name}
                                        onChange={e => setNewQuickCust({ ...newQuickCust, name: e.target.value })}
                                        className={inputCls}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+254..."
                                        value={newQuickCust.phone}
                                        onChange={e => setNewQuickCust({ ...newQuickCust, phone: e.target.value })}
                                        className={inputCls}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="alice@example.com"
                                        value={newQuickCust.email}
                                        onChange={e => setNewQuickCust({ ...newQuickCust, email: e.target.value })}
                                        className={inputCls}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Physical Address</label>
                                    <textarea
                                        placeholder="Street, Apartment, City"
                                        value={newQuickCust.address}
                                        rows={3}
                                        onChange={e => setNewQuickCust({ ...newQuickCust, address: e.target.value })}
                                        className={`${inputCls} h-auto py-4 resize-none`}
                                    />
                                </div>
                            </div>
                            <div className="p-5 rounded-[var(--radius-m3-xl)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex gap-4">
                                <div className="w-12 h-12 rounded-[var(--radius-m3-l)] bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                                    <CheckCircle2 size={20} />
                                </div>
                                <p className="text-xs font-bold text-[var(--color-on-surface-variant)] leading-relaxed">
                                    Profile saved to your CRM. Use <strong className="text-[var(--color-primary)]">Save &amp; Fill</strong> to instantly pre-fill the customer fields on this sale.
                                </p>
                            </div>
                        </div>
                    </Sheet>

                    {/* ── Edit Customer Sheet ── */}
                    <Sheet
                        open={isEditSheetOpen}
                        onClose={() => setIsEditSheetOpen(false)}
                        title="Edit Customer"
                        icon={<User size={20} />}
                        footer={
                            <Button
                                onClick={() => setIsEditSheetOpen(false)}
                                className="h-14 w-full rounded-[var(--radius-m3-l)] font-black bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg"
                            >
                                Done
                            </Button>
                        }
                    >
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <FieldLabel required>Full Name</FieldLabel>
                                    <input type="text" value={custName} onChange={e => { setCustName(e.target.value); setCustSearch(e.target.value); }}
                                        className={inputCls} placeholder="Alice Johnson" />
                                </div>

                                <div className="space-y-1.5">
                                    <FieldLabel required>WhatsApp / Phone</FieldLabel>
                                    <div className="flex gap-2">
                                        <div ref={codesRef} className="relative">
                                            <button type="button" onClick={() => setShowCodes(v => !v)}
                                                className="h-12 px-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 font-bold text-sm flex items-center gap-1.5">
                                                <span>{COUNTRY_CODES.find(x => x.code === countryCode)?.flag}</span>
                                                <span className="font-mono">{countryCode}</span>
                                                <ChevronDown size={12} className="opacity-30" />
                                            </button>
                                            {showCodes && (
                                                <div className="absolute top-14 left-0 z-50 w-60 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-2xl shadow-xl overflow-y-auto max-h-64 py-1">
                                                    {COUNTRY_CODES.map(c => (
                                                        <button key={c.code} type="button" onClick={() => { setCountryCode(c.code); setShowCodes(false); }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-surface-container)] text-left">
                                                            <span>{c.flag}</span>
                                                            <span className="flex-1">{c.name}</span>
                                                            <span className="opacity-40">{c.code}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                            placeholder="7XX XXX XXX" className={`${inputCls} flex-1`} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <FieldLabel>Email Address</FieldLabel>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        className={inputCls} placeholder="alice@example.com" />
                                </div>

                                <div className="space-y-1.5">
                                    <FieldLabel>Physical Address</FieldLabel>
                                    <textarea rows={3} value={address} onChange={e => setAddress(e.target.value)}
                                        className={`${inputCls} h-auto py-4 resize-none`} placeholder="Street, area, city" />
                                </div>
                            </div>
                        </div>
                    </Sheet>

                    {/* ── Search Modal ── */}
                    <AnimatePresence>
                        {isSearchModalOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsSearchModalOpen(false)}
                                    className="fixed inset-0 bg-[var(--color-on-surface)]/20 backdrop-blur-sm z-[110]"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                    transition={{ duration: 0.4, ease: [0.3, 0, 0, 1] }} // M3 Emphasized
                                    className="fixed top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-xl bg-[var(--color-surface-container-high)] rounded-[28px] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-3)] z-[120] overflow-hidden flex flex-col max-h-[75vh]"
                                >
                                    <div className="p-6 border-b border-[var(--color-outline-variant)]/10 flex items-center gap-5 sticky top-0 bg-[var(--color-surface-container-high)] z-10">
                                        <Search size={22} className="text-[var(--color-primary)] shrink-0" />
                                        <div className="flex-1">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Search by name, phone or email..."
                                                value={custSearch}
                                                onChange={e => setCustSearch(e.target.value)}
                                                className="w-full bg-transparent border-none font-black text-xl text-[var(--color-on-surface)] focus:outline-none placeholder:text-[var(--color-on-surface-variant)] placeholder:opacity-30 p-0"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setIsSearchModalOpen(false)}
                                            className="w-11 h-11 rounded-full hover:bg-[var(--color-surface-container-highest)] flex items-center justify-center text-[var(--color-on-surface-variant)] transition-all active:scale-90"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar min-h-[400px]">
                                        {custSearch.length > 0 && custResults.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-24 opacity-40">
                                                <div className="w-20 h-20 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center mb-6">
                                                    <Search size={32} />
                                                </div>
                                                <p className="font-black text-lg tracking-tight text-[var(--color-on-surface)]">No matching customers</p>
                                                <p className="text-sm font-medium opacity-60 mt-1">Try another search term</p>
                                            </div>
                                        ) : custResults.length > 0 ? (
                                            <div className="space-y-1">
                                                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Search Results</p>
                                                {custResults.map(c => (
                                                    <button
                                                        key={c._id}
                                                        type="button"
                                                        onClick={() => fillCustomer(c)}
                                                        className="w-full flex items-center gap-4 px-4 py-4 hover:bg-[var(--color-primary)]/10 rounded-[22px] transition-all text-left group active:scale-[0.98]"
                                                    >
                                                        <div className="relative">
                                                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] flex items-center justify-center font-black text-xl shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] transition-all">
                                                                {c.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[var(--color-surface-container-high)] border-2 border-[var(--color-surface-container-high)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] transition-all shadow-sm">
                                                                <UserSearch size={12} />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-base text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">{c.name}</p>
                                                            <div className="flex items-center gap-2 mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                {c.telephone && (
                                                                    <div className="flex items-center gap-1.5 text-xs font-black bg-[var(--color-surface-variant)]/40 px-3 py-1 rounded-lg">
                                                                        <Phone size={10} /> {c.telephone}
                                                                    </div>
                                                                )}
                                                                {c.email && (
                                                                    <div className="flex items-center gap-1.5 text-xs font-black bg-[var(--color-surface-variant)]/40 px-3 py-1 rounded-lg truncate max-w-[180px]">
                                                                        <Mail size={10} /> {c.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={20} className="text-[var(--color-on-surface-variant)] opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-24 opacity-40">
                                                <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-6">
                                                    <UserSearch size={32} />
                                                </div>
                                                <p className="font-black text-lg tracking-tight text-[var(--color-on-surface)]">Find a customer</p>
                                                <p className="text-sm font-medium opacity-60 mt-1">Search by name, phone or email...</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* ── Items section ── */}
                    <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-[var(--color-outline-variant)]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                    <Package size={15} />
                                </div>
                                <h2 className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">Items</h2>
                                {lineItems.length > 0 && (
                                    <span className="text-[10px] font-black bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full w-5 h-5 flex items-center justify-center">
                                        {lineItems.length}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-3">
                            {/* Empty state */}
                            {lineItems.length === 0 && !showSearch && (
                                <div className="py-12 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container)] flex items-center justify-center mb-4">
                                        <ShoppingCart size={28} className="text-[var(--color-on-surface-variant)] opacity-20" />
                                    </div>
                                    <p className="font-black text-[var(--color-on-surface)] opacity-30 mb-1">No items yet</p>
                                    <p className="text-xs text-[var(--color-on-surface-variant)] opacity-30">Search the catalog or add a custom item</p>
                                </div>
                            )}

                            {/* Line items */}
                            {lineItems.map(item => (
                                <div key={item.id}
                                    className="rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 overflow-hidden group hover:shadow-[var(--shadow-m3-1)] transition-shadow">
                                    <div className="flex items-center gap-3 p-3 cursor-pointer group/item" onClick={() => editLineItem(item)}>
                                        {item.image
                                            ? <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                                            : <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center shrink-0">
                                                <Package size={16} className="text-[var(--color-on-surface-variant)] opacity-25" />
                                            </div>
                                        }
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm text-[var(--color-on-surface)] group-hover/item:text-[var(--color-primary)] transition-colors truncate">{item.name}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-[11px] font-bold text-[var(--color-on-surface-variant)] opacity-40">{currency}</span>
                                                <span className="text-xs font-black text-[var(--color-on-surface)]">{item.unitPrice.toLocaleString()}</span>
                                                <span className="text-[11px] text-[var(--color-on-surface-variant)] opacity-30 ml-1">each</span>
                                            </div>
                                            {item.note && (
                                                <p className="text-[10px] font-medium text-[var(--color-primary)] opacity-60 truncate mt-1">
                                                    {item.note}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0 px-2">
                                            <div className="flex flex-col items-end min-w-[80px]">
                                                <span className="font-black text-sm text-[var(--color-on-surface)]">
                                                    {fmt(item.unitPrice * item.qty)}
                                                </span>
                                                <span className="text-[10px] font-bold text-[var(--color-primary)] opacity-60">
                                                    {item.qty} × {fmt(item.unitPrice)}
                                                </span>
                                            </div>

                                            <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                                className="w-10 h-10 rounded-xl text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors flex items-center justify-center">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add from catalog trigger */}
                            <button onClick={() => setShowSearch(true)}
                                className="w-full flex items-center gap-3 p-4 rounded-[var(--radius-m3-l)] border-2 border-dashed border-[var(--color-outline-variant)]/25 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 transition-all group text-left">
                                <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                                    <Plus size={18} className="text-[var(--color-on-surface-variant)] opacity-40 group-hover:text-[var(--color-primary)] group-hover:opacity-100 transition-all" />
                                </div>
                                <span className="font-bold text-sm text-[var(--color-on-surface-variant)] opacity-50 group-hover:text-[var(--color-primary)] group-hover:opacity-100 transition-all">
                                    Add item from catalog
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* ── Custom Sale section ── */}
                    <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                    <Calculator size={15} />
                                </div>
                                <h2 className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">Custom Sale</h2>
                            </div>
                        </div>
                        <button onClick={() => setShowCustom(true)}
                            className="w-full flex items-center gap-4 p-5 rounded-[var(--radius-m3-l)] border-2 border-dashed border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 transition-all group text-left">
                            <div className="w-12 h-12 rounded-[var(--radius-m3-m)] bg-[var(--color-surface-container)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                                <Plus size={22} className="text-[var(--color-on-surface-variant)] opacity-40 group-hover:text-[var(--color-primary)] group-hover:opacity-100 transition-all" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-all">Add Custom Sale</p>
                                <p className="text-[11px] font-bold text-[var(--color-on-surface-variant)] opacity-40 mt-0.5">Add an unlisted item or service to the order</p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-[var(--color-outline-variant)]/20 flex items-center justify-center group-hover:border-[var(--color-primary)]/40 transition-all">
                                <Plus size={16} className="text-[var(--color-on-surface-variant)] opacity-30 group-hover:text-[var(--color-primary)] group-hover:opacity-100" />
                            </div>
                        </button>
                    </div>

                    {/* ── Discount section ── */}
                    <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <Tag size={15} />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">Discount</h2>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">
                                    Amount
                                </label>
                                <div className="flex bg-[var(--color-surface-container-high)] rounded-lg p-1 border border-[var(--color-outline-variant)]/10 scale-90 -mr-2">
                                    <button
                                        onClick={() => setDiscountType("fixed")}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                                            discountType === "fixed"
                                                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md"
                                                : "text-[var(--color-on-surface-variant)] opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        FIXED
                                    </button>
                                    <button
                                        onClick={() => setDiscountType("percent")}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                                            discountType === "percent"
                                                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md"
                                                : "text-[var(--color-on-surface-variant)] opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        PERCENT
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center h-12 px-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 focus-within:border-[var(--color-primary)]/50 transition-all">
                                <input type="number" value={discount || ""} placeholder="0"
                                    onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="flex-1 text-sm font-black text-[var(--color-on-surface)] bg-transparent focus:outline-none" />
                                <span className="text-xs font-black text-[var(--color-on-surface-variant)] opacity-40 ml-2">
                                    {discountType === "fixed" ? currency : "%"}
                                </span>
                            </div>
                            {discount > 0 && (
                                <p className="text-[10px] font-black text-[var(--color-error)] text-right">−{fmt(discountAmt)}</p>
                            )}
                        </div>
                    </div>

                    {/* ── Adjustment section ── */}
                    <div className="bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] flex items-center justify-center">
                                <SlidersHorizontal size={15} />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">Adjustment</h2>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50">
                                Price Correction
                            </label>
                            <div className="flex items-center h-12 px-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 focus-within:border-[var(--color-tertiary)]/50 transition-all gap-2">
                                <span className="text-xs font-black text-[var(--color-on-surface-variant)] opacity-40">{currency}</span>
                                <input type="number" value={adjustment || ""} placeholder="0.00" step="any"
                                    onChange={e => setAdjustment(parseFloat(e.target.value) || 0)}
                                    className="flex-1 text-sm font-black text-[var(--color-on-surface)] bg-transparent focus:outline-none" />
                                <div className="flex flex-col gap-0.5">
                                    <button onClick={() => setAdjustment(a => +(a + 10).toFixed(2))} className="opacity-30 hover:opacity-80 transition-opacity"><ChevronUp size={11} /></button>
                                    <button onClick={() => setAdjustment(a => +(a - 10).toFixed(2))} className="opacity-30 hover:opacity-80 transition-opacity"><ChevronDown size={11} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Admin notes ── */}
                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-m3-xl)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <StickyNote size={15} />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">Remark</h2>
                        </div>
                        <textarea value={remark} onChange={e => setRemark(e.target.value)}
                            placeholder="Add a note visible to the customer (e.g. delivery instructions, preferences)..."
                            rows={2}
                            className="w-full px-4 py-3 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 font-medium text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] placeholder:opacity-35 focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all resize-none" />
                    </div>
                </div>

                {/* ══ RIGHT: Order Summary panel ════════════════════════════════ */}
                <div className={cn(
                    "lg:w-[380px] xl:w-[420px] shrink-0 lg:border-l border-[var(--color-outline-variant)]/10 bg-[var(--color-surface)] pb-24 lg:pb-0",
                    activeTab !== 'summary' && "hidden lg:block"
                )}>
                    <div className="lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:overflow-y-auto flex flex-col p-4 sm:p-6 gap-5">

                        {/* Order summary header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Receipt size={18} className="text-[var(--color-primary)]" />
                                <h3 className="font-black text-sm text-[var(--color-on-surface)] uppercase tracking-widest opacity-60">Order Summary</h3>
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">
                                    {channel}
                                </span>
                            </div>
                        </div>

                        {/* Customer attribution mini-card */}
                        <div className="rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-black text-sm">
                                    {custName?.charAt(0).toUpperCase() || <User size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm text-[var(--color-on-surface)] truncate">
                                        {custName || "Guest Customer"}
                                    </p>
                                    {(phone || email) && (
                                        <div className="flex flex-col mt-0.5 opacity-50">
                                            {phone && <span className="text-[10px] font-bold">{phone}</span>}
                                            {email && <span className="text-[10px] font-bold truncate">{email}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Line items mini-list */}
                        {lineItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-[var(--color-on-surface-variant)] opacity-30">
                                <ShoppingCart size={32} className="mb-2" />
                                <p className="text-xs font-black">Add items</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {lineItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 py-1">
                                        <span className="w-5 h-5 rounded-full bg-[var(--color-surface-container)] text-[10px] font-black text-[var(--color-on-surface-variant)] flex items-center justify-center shrink-0">
                                            {item.qty}
                                        </span>
                                        <span className="flex-1 text-sm font-bold text-[var(--color-on-surface)] truncate">{item.name}</span>
                                        <span className="text-sm font-black text-[var(--color-on-surface)] shrink-0">{fmt(item.unitPrice * item.qty)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Divider */}
                        {lineItems.length > 0 && <div className="border-t border-[var(--color-outline-variant)]/10" />}

                        {/* Totals breakdown */}
                        <div className="rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-4 space-y-2.5">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-[var(--color-on-surface-variant)] opacity-60">Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                                <span className="font-black text-[var(--color-on-surface)]">{fmt(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-[var(--color-error)] opacity-80">Discount</span>
                                    <span className="font-black text-[var(--color-error)]">−{fmt(discountAmt)}</span>
                                </div>
                            )}
                            {adjustment !== 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-[var(--color-on-surface-variant)] opacity-60">Adjustment</span>
                                    <span className={`font-black ${adjustment > 0 ? "text-[var(--color-tertiary)]" : "text-[var(--color-error)]"}`}>
                                        {adjustment > 0 ? "+" : ""}{fmt(adjustment)}
                                    </span>
                                </div>
                            )}
                            <div className="pt-2 border-t border-[var(--color-outline-variant)]/10 flex justify-between items-center">
                                <span className="font-black text-sm text-[var(--color-on-surface)]">Total</span>
                                <span className="font-black text-2xl text-[var(--color-primary)]">{fmt(totalPayable)}</span>
                            </div>
                        </div>

                        {/* Payment method */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-50 flex items-center gap-1.5">
                                <CreditCard size={11} /> Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
                                    <button key={key} type="button" onClick={() => setPaymentMethod(key)}
                                        className={`flex items-center gap-2 py-3 px-4 rounded-[var(--radius-m3-l)] text-sm font-black transition-all border ${paymentMethod === key
                                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent shadow-[var(--shadow-m3-1)]"
                                            : "bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]/15 text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]"
                                            }`}>
                                        <Icon size={15} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 rounded-[var(--radius-m3-l)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm font-bold">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <Button onClick={handleSubmit}
                            disabled={isSubmitting || !custName || !phone || lineItems.length === 0}
                            className="w-full h-14 rounded-[var(--radius-m3-l)] font-black text-base bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-m3-2)] hover:shadow-[var(--shadow-m3-3)] transition-shadow disabled:opacity-40 flex items-center justify-center gap-2">
                            {isSubmitting
                                ? <><Loader2 size={18} className="animate-spin" /> Creating...</>
                                : <>{lineItems.length === 0 ? "Create Order" : `Create Order · ${fmt(totalPayable)}`}</>
                            }
                        </Button>

                        <p className="text-[10px] text-center font-medium text-[var(--color-on-surface-variant)] opacity-30">
                            schema.org/Order · {channel}
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Catalog Selection Sheet ─── */}
            <Sheet
                open={showSearch}
                onClose={() => { setShowSearch(false); setQuery(""); }}
                title="Product Catalog"
                icon={<Package size={20} />}
            >
                <div className="space-y-4">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] group-focus-within:opacity-100 transition-all" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Find products by name, category..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-5 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-inner"
                        />
                    </div>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredProducts.length === 0 ? (
                            <div className="py-12 flex flex-col items-center text-center">
                                <Search size={40} className="text-[var(--color-on-surface-variant)] opacity-10 mb-4" />
                                <p className="font-black text-[var(--color-on-surface)] opacity-30">No products found</p>
                                <p className="text-xs text-[var(--color-on-surface-variant)] opacity-40 mt-1">Try a different search term</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {filteredProducts.map((p: any) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            addProduct(p);
                                            // Optional: close on select or keep open for multi-add? 
                                            // Keeping open for productivity
                                        }}
                                        className="w-full flex items-center gap-4 p-3 rounded-[var(--radius-m3-l)] bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5 transition-all text-left group"
                                    >
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center shrink-0">
                                                <Package size={20} className="text-[var(--color-on-surface-variant)] opacity-25" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm text-[var(--color-on-surface)] truncate group-hover:text-[var(--color-primary)] transition-colors">{p.name}</p>
                                            <p className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-40">{p.category || "General"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-sm text-[var(--color-primary)]">{currency} {(p.price ?? 0).toLocaleString()}</p>
                                            <div className="h-6 w-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                <Plus size={14} className="text-[var(--color-primary)]" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Sheet>

            {/* ─── Item Detail / Add to Cart Sheet ─── */}
            <Sheet
                open={!!detailItem}
                onClose={() => setDetailItem(null)}
                title="Item Detail"
                icon={<Info size={20} />}
                footer={
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="text"
                            onClick={() => setDetailItem(null)}
                            className="flex-1 h-14 rounded-[var(--radius-m3-l)] font-black text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAddToCart}
                            className="flex-[2] h-14 rounded-[var(--radius-m3-l)] font-black text-sm bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            Add {detailQty > 1 ? `(${detailQty}) ` : ""}to Order · {fmt(totalDetailPrice * detailQty)}
                        </Button>
                    </div>
                }
            >
                {detailItem && (
                    <div className="space-y-8">
                        {/* Summary */}
                        <div className="flex items-center gap-5">
                            {detailItem.image ? (
                                <img src={detailItem.image} alt={detailItem.name} className="w-24 h-24 rounded-[2rem] object-cover shadow-sm" />
                            ) : (
                                <div className="w-24 h-24 rounded-[2rem] bg-[var(--color-surface-container)] flex items-center justify-center">
                                    <Package size={32} className="text-[var(--color-on-surface-variant)] opacity-20" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-black text-[var(--color-on-surface)] leading-tight">{detailItem.name}</h3>
                                <p className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-50 mt-1">{detailItem.category || "General"}</p>
                                <p className="text-xl font-black text-[var(--color-primary)] mt-2">{fmt(detailItem.price ?? 0)} <span className="text-xs opacity-40 font-bold">each</span></p>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Adjust Quantity</label>
                            <div className="flex items-center justify-center gap-6 p-4 rounded-[var(--radius-m3-xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
                                <button
                                    onClick={() => setDetailQty(q => Math.max(1, q - 1))}
                                    className="w-14 h-14 rounded-full bg-[var(--color-surface)] text-[var(--color-on-surface)] flex items-center justify-center shadow-sm border border-[var(--color-outline-variant)]/15 active:scale-90 transition-all font-black text-xl"
                                >
                                    −
                                </button>
                                <span className="text-4xl font-black text-[var(--color-on-surface)] min-w-[3rem] text-center">{detailQty}</span>
                                <button
                                    onClick={() => setDetailQty(q => q + 1)}
                                    className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center shadow-lg active:scale-90 transition-all font-black text-xl"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Modifiers / Add-ons section */}
                        {(detailItem.bundleItems?.filter((b: any) => b.type === 'addon').length > 0 || detailItem.variants?.length > 0) && (
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Options & Modifiers</label>
                                <div className="flex flex-wrap gap-2">
                                    {detailItem.bundleItems?.filter((b: any) => b.type === 'addon').map((mod: any) => {
                                        const isSelected = selectedModifiers.find(m => m.id === mod.id);
                                        return (
                                            <button
                                                key={mod.id}
                                                onClick={() => toggleModifier(mod)}
                                                className={cn(
                                                    "px-4 py-2.5 rounded-full text-xs font-black border transition-all flex items-center gap-2 active:scale-95",
                                                    isSelected
                                                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent shadow-md"
                                                        : "bg-[var(--color-surface)] border-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/40"
                                                )}
                                            >
                                                {mod.name}
                                                {mod.price > 0 && <span className={cn("opacity-60", isSelected ? "text-[var(--color-on-primary)]" : "text-[var(--color-primary)]")}>+{fmt(mod.price)}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Note / Instructions */}
                        <div className="space-y-4 pt-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 text-left block">Notes / Custom Request</label>
                            <textarea
                                value={detailNote}
                                onChange={e => setDetailNote(e.target.value)}
                                placeholder="e.g. Extra spicy, Allergy info, etc..."
                                rows={2}
                                className="w-full px-5 py-4 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all resize-none shadow-inner"
                            />
                        </div>

                        {/* Upsell Suggestions */}
                        {products.filter((p: any) => p.category === detailItem.category && p.id !== detailItem.id).length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-[var(--color-outline-variant)]/10">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Pairs well with</label>
                                    <span className="text-[10px] font-bold text-[var(--color-primary)]">Frequently bought together</span>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                                    {products
                                        .filter((p: any) => p.category === detailItem.category && p.id !== detailItem.id)
                                        .slice(0, 5)
                                        .map((p: any) => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setLineItems(prev => [...prev, {
                                                        id: crypto.randomUUID(),
                                                        productId: p.id,
                                                        name: p.name,
                                                        image: p.image,
                                                        qty: 1,
                                                        unitPrice: p.price ?? 0
                                                    }]);
                                                }}
                                                className="min-w-[140px] p-3 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-left group active:scale-95 transition-all"
                                            >
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name} className="w-full aspect-square rounded-xl object-cover mb-2 shadow-sm" />
                                                ) : (
                                                    <div className="w-full aspect-square rounded-xl bg-[var(--color-surface)] flex items-center justify-center mb-2">
                                                        <Package size={20} className="opacity-10" />
                                                    </div>
                                                )}
                                                <p className="font-black text-xs text-[var(--color-on-surface)] truncate mb-1">{p.name}</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="font-black text-[10px] text-[var(--color-primary)]">{fmt(p.price ?? 0)}</p>
                                                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center">
                                                        <Plus size={12} />
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Sheet>

            {/* ─── Custom Sale Sheet ─── */}
            <Sheet
                open={showCustom}
                onClose={() => setShowCustom(false)}
                title="Add Custom Sale"
                icon={<Calculator size={20} />}
                footer={
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="text"
                            onClick={() => setShowCustom(false)}
                            className="flex-1 h-14 rounded-[var(--radius-m3-l)] font-black text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={addCustomItem}
                            disabled={!customName || !customPrice}
                            className="flex-[2] h-14 rounded-[var(--radius-m3-l)] font-black text-sm bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2"
                        >
                            Add to Order
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Item Name / Description</label>
                        <input
                            type="text"
                            placeholder="e.g., General Merchandise, Professional Service, etc."
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            className="w-full h-14 px-5 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 font-bold text-sm focus:outline-none focus:border-[var(--color-primary)]/60 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">Unit Price</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--color-on-surface-variant)] opacity-40">{currency}</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={customPrice}
                                onChange={e => setCustomPrice(e.target.value)}
                                className="w-full h-14 pl-14 pr-5 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 font-black text-lg text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)]/60 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </Sheet>
        </div >
    );
}

// needed for the SlidersHorizontal icon
function SlidersHorizontal({ size, className }: { size: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="21" y1="4" x2="14" y2="4" /><line x1="10" y1="4" x2="3" y2="4" />
            <line x1="21" y1="12" x2="12" y2="12" /><line x1="8" y1="12" x2="3" y2="12" />
            <line x1="21" y1="20" x2="16" y2="20" /><line x1="12" y1="20" x2="3" y2="20" />
            <line x1="14" y1="2" x2="14" y2="6" /><line x1="8" y1="10" x2="8" y2="14" />
            <line x1="16" y1="18" x2="16" y2="22" />
        </svg>
    );
}
