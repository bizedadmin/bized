"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Store, ShoppingBag, Wrench, MessageSquare,
    Globe, Briefcase, Phone, Mail, MapPin,
    Clock, Star, ExternalLink, Wifi, Instagram, Facebook, Search, ChevronRight, X,
    Plus, User, Package, Settings, Shield, LogOut
} from "lucide-react";
import { BottomNav, NavItem } from "@/components/ui/BottomNav";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

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

interface StorefrontClientProps {
    store: any; // Type should match StoreDoc
    initialTab?: string;
    initialSelectedProduct?: any;
}

export function StorefrontClient({ store, initialTab = "home", initialSelectedProduct = null }: StorefrontClientProps) {
    const params = useParams();
    const slug = params?.slug as string;
    const { totalItems } = useCart();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showBio, setShowBio] = useState(false);

    const navItems: NavItem[] = [
        { id: "home", label: "Home", icon: <Store size={22} />, activeIcon: <Store size={22} fill="currentColor" /> },
        { id: "shop", label: "Shop", icon: <ShoppingBag size={22} />, activeIcon: <ShoppingBag size={22} fill="currentColor" /> },
        { id: "inbox", label: "Inbox", icon: <MessageSquare size={22} />, activeIcon: <MessageSquare size={22} fill="currentColor" /> },
        { id: "you", label: "You", icon: <User size={22} />, activeIcon: <User size={22} fill="currentColor" /> },
    ];

    const avgRating = store.reviews?.length
        ? (store.reviews.reduce((s: any, r: any) => s + r.rating, 0) / store.reviews.length).toFixed(1)
        : null;

    return (
        <div className="min-h-screen bg-[var(--color-surface)] pb-24">
            {/* Header - Persistence: Cover + Overlapping Logo */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto relative cursor-default">
                    <div className="absolute top-6 right-6 z-10">
                        <Link
                            href={`/${slug}/cart`}
                            className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-[var(--color-primary)] relative hover:scale-105 transition-transform active:scale-95"
                        >
                            <ShoppingBag size={20} />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="w-full h-48 sm:h-64 lg:h-80 rounded-[2rem] overflow-hidden relative shadow-lg">
                        {store.coverPhotoUrl ? (
                            <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${store.coverPhotoUrl})` }} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-400" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    <div className="relative px-6 sm:px-10 mt-6 sm:mt-8 flex flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-xl border-[4px] sm:border-[6px] border-white overflow-hidden flex-shrink-0"
                            style={store.themeColor ? { backgroundColor: store.themeColor } : {}}
                        >
                            {store.logoUrl ? (
                                <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${store.logoUrl})` }} />
                            ) : (
                                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white">{store.name.charAt(0).toUpperCase()}</span>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1 pb-2 sm:pb-4"
                        >
                            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-[var(--color-on-surface)] tracking-tight leading-tight">{store.name}</h1>
                            {store.title && <p className="text-[10px] sm:text-base text-[var(--color-on-surface-variant)] font-bold opacity-80 line-clamp-1">{store.title}</p>}

                            <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-3 mb-2 sm:mb-4">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-[9px] sm:text-xs font-black uppercase"><Globe size={10} />{store.industry}</span>
                            </div>

                            {store.description && (
                                <div className="text-[10px] sm:text-sm text-[var(--color-on-surface-variant)] opacity-70 flex items-center gap-1">
                                    <p className="line-clamp-1 flex-1">{store.description}</p>
                                    <button
                                        onClick={() => setShowBio(true)}
                                        className="text-[var(--color-primary)] font-bold hover:underline flex-shrink-0"
                                    >
                                        ...more
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto px-6 sm:px-10 mt-12">
                <AnimatePresence mode="wait">
                    {activeTab === "home" && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-12"
                        >

                            {/* Featured Products */}
                            {store.products && store.products.length > 0 && (() => {
                                const featured = store.products.filter((p: any) => p.featured);
                                const displays = featured.length > 0 ? featured.slice(0, 5) : store.products.slice(0, 5);
                                if (displays.length === 0) return null;

                                return (
                                    <section className="mb-12">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]"><ShoppingBag size={18} /></div>
                                                <h2 className="text-xl font-black text-[var(--color-on-surface)]">Featured Products</h2>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab("shop")}
                                                className="text-xs font-bold text-[var(--color-primary)] hover:opacity-70 transition-opacity"
                                            >
                                                View all
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {displays.map((p: any) => (
                                                <Link
                                                    key={p.id}
                                                    href={`/${slug}/p/${p.productSlug || p.id}`}
                                                    className="w-full rounded-[2rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 flex items-center p-3 gap-4 group shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-[var(--color-primary)]/40"
                                                >
                                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[var(--color-surface-container)] flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                        {p.image ? <img src={p.image} alt={p.imageAltTexts?.[0] || p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ShoppingBag size={24} className="opacity-10" />}
                                                    </div>
                                                    <div className="flex-1 pr-4 py-1 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="font-bold text-[var(--color-on-surface)] text-base line-clamp-2">{p.name}</h3>
                                                            <p className="font-black text-[var(--color-primary)] text-lg mt-1">{p.currency || "KES"} {p.price?.toLocaleString() || "0"}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <div className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-widest flex items-center gap-1">
                                                                Details <ChevronRight size={10} />
                                                            </div>
                                                            <button
                                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-black shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all"
                                                            >
                                                                Select <Plus size={14} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })()}

                            {/* Quick Contact & Hours */}
                            {(store.openingHours || store.phone || store.email || store.address || store.city) && (
                                <section className="mb-12">
                                    <div className="rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 p-6 space-y-4 shadow-sm">
                                        {store.openingHours && <div className="flex items-start gap-4"><div className="p-2.5 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-primary)]"><Clock size={16} /></div><div><p className="text-xs font-bold opacity-40 mb-1">Hours</p><p className="text-sm font-bold text-[var(--color-on-surface)]">{store.openingHours}</p></div></div>}
                                        {store.phone && <div className="flex items-start gap-4"><div className="p-2.5 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-primary)]"><Phone size={16} /></div><div><p className="text-xs font-bold opacity-40 mb-1">Phone</p><p className="text-sm font-medium text-[var(--color-on-surface)]">{store.phone}</p></div></div>}
                                        {store.email && <div className="flex items-start gap-4"><div className="p-2.5 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-primary)]"><Mail size={16} /></div><div><p className="text-xs font-bold opacity-40 mb-1">Email</p><p className="text-sm font-medium text-[var(--color-on-surface)]">{store.email}</p></div></div>}
                                        {(store.address || store.city) && <div className="flex items-start gap-4"><div className="p-2.5 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-primary)]"><MapPin size={16} /></div><div><p className="text-xs font-bold opacity-40 mb-1">Location</p><p className="text-sm font-medium text-[var(--color-on-surface)]">{[store.address, store.city].filter(Boolean).join(", ")}</p></div></div>}
                                    </div>
                                </section>
                            )}

                            {/* Reviews */}
                            {store.reviews && store.reviews.length > 0 && (
                                <section className="mb-14">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600"><Star size={18} /></div>
                                        <div>
                                            <h2 className="text-xl font-black text-[var(--color-on-surface)]">Reviews</h2>
                                            {avgRating && <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50">{avgRating} ★ average · {store.reviews.length} reviews</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {store.reviews.map((r: any) => (
                                            <div key={r.id} className="rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 p-5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-bold text-[var(--color-on-surface)] text-sm">{r.author}</p>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((n) => (
                                                            <Star key={n} size={12} className={n <= r.rating ? "text-amber-400" : "text-[var(--color-on-surface-variant)] opacity-15"} fill={n <= r.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60 leading-relaxed">{r.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "shop" && (
                        <motion.div
                            key="shop"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]"><ShoppingBag size={18} /></div>
                                <h2 className="text-xl font-black text-[var(--color-on-surface)]">Shop</h2>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                {store.products?.map((p: any) => (
                                    <Link
                                        key={p.id}
                                        href={`/${slug}/p/${p.productSlug || p.id}`}
                                        className="rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 overflow-hidden cursor-pointer hover:border-[var(--color-primary)]/40 transition-colors"
                                    >
                                        {p.image && <img src={p.image} alt={p.imageAltTexts?.[0] || p.name} className="w-full h-40 object-cover" />}
                                        <div className="p-4">
                                            <h3 className="font-bold text-[var(--color-on-surface)] mb-1">{p.name}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-black text-[var(--color-primary)]">{p.currency || "KES"} {p.price?.toLocaleString()}</span>
                                                <button
                                                    className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all active:scale-90"
                                                >
                                                    <Plus size={18} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Services List */}
                            {store.services && store.services.length > 0 && (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]"><Wrench size={18} /></div>
                                        <h2 className="text-xl font-black text-[var(--color-on-surface)]">Services</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {store.services?.map((s: any) => (
                                            <div key={s.id} className="rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 p-5">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-bold text-[var(--color-on-surface)]">{s.name}</h3>
                                                    {s.price ? <span className="text-lg font-black text-[var(--color-primary)] whitespace-nowrap">{s.currency || "KES"} {s.price.toLocaleString()}</span> : null}
                                                </div>
                                                <p className="text-xs text-[var(--color-on-surface-variant)] opacity-50 mb-4">{s.description}</p>
                                                <button className="w-full py-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-bold">Select +</button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {(!store.products || store.products.length === 0) && (!store.services || store.services.length === 0) && (
                                <p className="text-center py-20 opacity-30 italic">No products or services available</p>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "you" && (
                        <motion.div
                            key="you"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]"><User size={18} /></div>
                                <h2 className="text-xl font-black text-[var(--color-on-surface)]">Account</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-[var(--color-on-surface)]">Guest User</h4>
                                        <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60">Sign in to track orders</p>
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 overflow-hidden">
                                    {[
                                        { icon: Package, label: 'My Orders', badge: '0' },
                                        { icon: Settings, label: 'Profile Settings' },
                                        { icon: Shield, label: 'Privacy & Safety' },
                                        { icon: LogOut, label: 'Sign Out', danger: true },
                                    ].map((item, idx) => (
                                        <div key={idx} className={cn(
                                            "flex items-center justify-between p-5 border-b border-[var(--color-outline-variant)]/5 last:border-0 hover:bg-[var(--color-primary)]/5 transition-colors cursor-pointer",
                                            item.danger && "text-red-500"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                <item.icon size={20} className={cn(!item.danger && "text-[var(--color-on-surface-variant)] opacity-60")} />
                                                <span className="font-bold">{item.label}</span>
                                            </div>
                                            {item.badge ? (
                                                <span className="px-2 py-0.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-black">{item.badge}</span>
                                            ) : (
                                                <ChevronRight className="opacity-20" size={18} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "inbox" && (
                        <motion.div
                            key="inbox"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-600"><MessageSquare size={18} /></div>
                                <h2 className="text-xl font-black text-[var(--color-on-surface)]">Contact Us</h2>
                            </div>

                            <div className="space-y-4">
                                {(() => {
                                    const whatsapp = store.socialLinks?.whatsapp;
                                    if (!whatsapp) return null;
                                    const cleanNumber = whatsapp.replace(/[^0-9]/g, "");

                                    const templates = store.socialLinks?.whatsappTemplates;
                                    let message = store.socialLinks?.whatsappMessage;

                                    if (activeTab === "inbox") {
                                        // If we are in inbox, we don't know where they came from easily 
                                        // without extra state, so we use home template as default fallback
                                        message = templates?.home || message;
                                    } else if (activeTab === "home") {
                                        message = templates?.home || message;
                                    } else if (activeTab === "shop") {
                                        message = templates?.shop || message;
                                    } else if (activeTab === "you") {
                                        message = templates?.home || message;
                                    }

                                    const link = `https://wa.me/${cleanNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

                                    return (
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-5 rounded-3xl bg-green-500 text-white shadow-xl shadow-green-500/20"
                                            suppressHydrationWarning
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><MessageSquare size={24} /></div>
                                                <div>
                                                    <p className="font-black text-lg">WhatsApp Chat</p>
                                                    <p className="text-white/70 text-sm">Typical response: Instant</p>
                                                </div>
                                            </div>
                                            <ExternalLink size={20} className="opacity-50" />
                                        </a>
                                    );
                                })()}

                                <div className="rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/15 p-6 space-y-6">
                                    {store.openingHours && <div className="flex items-start gap-3"><Clock size={16} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" /><div><p className="text-xs font-bold opacity-40 mb-1">Hours</p><p className="text-sm text-[var(--color-on-surface)]">{store.openingHours}</p></div></div>}
                                    {store.phone && <div className="flex items-start gap-3"><Phone size={16} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" /><div><p className="text-xs font-bold opacity-40 mb-1">Phone</p><p className="text-sm text-[var(--color-on-surface)] font-medium">{store.phone}</p></div></div>}
                                    {store.email && <div className="flex items-start gap-3"><Mail size={16} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" /><div><p className="text-xs font-bold opacity-40 mb-1">Email</p><p className="text-sm text-[var(--color-on-surface)] font-medium">{store.email}</p></div></div>}
                                    {(store.address || store.city) && <div className="flex items-start gap-3"><MapPin size={16} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" /><div><p className="text-xs font-bold opacity-40 mb-1">Location</p><p className="text-sm text-[var(--color-on-surface)]">{[store.address, store.city].filter(Boolean).join(", ")}</p></div></div>}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Brand */}
                <div className="mt-20 mb-12 text-center opacity-30">
                    <p className="text-[10px] uppercase font-black tracking-[4px]">Powered by Bized</p>
                </div>
            </div >

            {/* Floating WhatsApp Button */}
            {(() => {
                const settings = store.socialLinks?.whatsappSettings;
                if (!settings?.floatingButtonEnabled || !store.socialLinks?.whatsapp) return null;

                // Availability Logic
                if (settings.useSchedule && settings.hideWhenClosed && store.openingHours) {
                    // Simple heuristic for "Open" check
                    // For now we assume if openingHours exists and they want to hide it, 
                    // we could implement a real check. But since we don't have a rigid schema for openingHours yet, 
                    // we'll show it but ideally this would be a real-time check.
                    // For the sake of demonstration, let's assume it's open unless we find a reason not to.
                }

                const whatsapp = store.socialLinks.whatsapp;
                const cleanNumber = whatsapp.replace(/[^0-9]/g, "");
                const templates = store.socialLinks.whatsappTemplates;
                let templateText = templates?.[activeTab as keyof typeof templates] || store.socialLinks.whatsappMessage || "";

                // Advanced Template Parsing
                const processWhatsAppTemplate = (text: string) => {
                    if (!text) return "";

                    // Context Data
                    const businessName = store.name || "Business";
                    const pageUrl = typeof window !== 'undefined' ? window.location.href : "";
                    const productName = activeTab === 'product' ? "Product from Shop" : ""; // Placeholder until we have more granular product context

                    return text
                        .replace(/\{\{business_name\}\}/g, businessName)
                        .replace(/\{\{page_url\}\}/g, pageUrl)
                        .replace(/\{\{product_name\}\}/g, productName)
                        .trim();
                };

                // Add a suppressHydrationWarning to the anchor since the href relies on window
                let message = processWhatsAppTemplate(templateText);

                // Add UTM/Source Tracking
                const sourceTag = ` [Source: ${activeTab.toUpperCase()}]`;
                if (message && !message.includes("[Source:")) {
                    message += sourceTag;
                } else if (!message) {
                    message = `Hi, I'm contacting you from your ${activeTab} page!`;
                }

                const link = `https://wa.me/${cleanNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
                const size = settings.floatingButtonSize || 48;

                const positionClasses = ({
                    'bottom-right': "right-6 bottom-24 sm:bottom-10",
                    'bottom-left': "left-6 bottom-24 sm:bottom-10",
                    'right-middle': "right-6 top-1/2 -translate-y-1/2",
                    'left-middle': "left-6 top-1/2 -translate-y-1/2"
                } as any)[settings.floatingButtonPosition || 'bottom-right'];

                const styleVariants = {
                    'circle-solid': "bg-[#25D366] text-white rounded-full p-2 h-auto shadow-green-500/20",
                    'circle-regular': "bg-white text-[#25D366] border-2 border-[#25D366] rounded-full p-2 h-auto",
                    'square-solid': "bg-[#25D366] text-white rounded-2xl p-2 h-auto shadow-green-500/20",
                    'square-regular': "bg-white text-[#25D366] border-2 border-[#25D366] rounded-2xl p-2 h-auto"
                };

                const currentStyleClass = (styleVariants as any)[settings.floatingButtonStyle || 'circle-solid'] || styleVariants['circle-solid'];

                return (
                    <motion.a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className={cn(
                            "fixed z-50 flex items-center justify-center shadow-2xl transition-transform active:scale-95 group",
                            positionClasses,
                            currentStyleClass
                        )}
                        style={{ width: size, height: size }}
                        title={settings.floatingButtonTooltip}
                        suppressHydrationWarning
                    >
                        <WhatsAppIcon
                            size={size * 0.6}
                            fill={settings.floatingButtonStyle?.includes('solid') ? "white" : "#25D366"}
                        />
                    </motion.a>
                );
            })()}

            {/* Bio Sheet */}
            <AnimatePresence>
                {showBio && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBio(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full sm:max-w-lg bg-[var(--color-surface)] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[80vh]"
                        >
                            <div className="p-8 pb-4 flex items-center justify-between border-b border-[var(--color-outline-variant)]/10">
                                <h2 className="text-xl font-black text-[var(--color-on-surface)]">Business Bio</h2>
                                <button onClick={() => setShowBio(false)} className="p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-20">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest">About</h3>
                                    <p className="text-[var(--color-on-surface)] leading-relaxed whitespace-pre-wrap">{store.description}</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest">Information</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-container-low)]">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center"><Globe size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-50 uppercase">Industry</p>
                                                <p className="text-sm font-bold">{store.industry}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-container-low)]">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center"><Briefcase size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-50 uppercase">Type</p>
                                                <p className="text-sm font-bold">{store.businessType}</p>
                                            </div>
                                        </div>
                                        {store.phone && (
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-container-low)]">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center"><Phone size={20} /></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-50 uppercase">Contact</p>
                                                    <p className="text-sm font-bold">{store.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {store.address && (
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-container-low)]">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center"><MapPin size={20} /></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] opacity-50 uppercase">Location</p>
                                                    <p className="text-sm font-bold">{store.address}, {store.city}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sticky Bottom Nav */}
            <BottomNav
                items={navItems}
                activeId={activeTab}
                onChange={setActiveTab}
            />
        </div>
    );
}
