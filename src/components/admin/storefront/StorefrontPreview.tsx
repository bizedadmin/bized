"use client";

import React from "react";
import {
    Store, Clock, Phone, Mail, MapPin,
    ShoppingBag, Wrench, Star, HelpCircle,
    MessageSquare, Instagram, Facebook, Search,
    Image as ImageIcon, ChevronLeft, Menu, User, Settings as SettingsIcon,
    LogOut, Package as PackageIcon, Shield, Plus
} from "lucide-react";
import { type Business } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";

interface StorefrontPreviewProps {
    business: Business;
    activeTab?: string;
}

/* ═══════════════════════════════════════════════════════════════
   SUB-VIEWS
   ═══════════════════════════════════════════════════════════════ */

const HomeView = ({ b }: { b: Business }) => (
    <div className="animate-in fade-in duration-300">
        <div className="px-5 mt-6 space-y-5 pb-10">
            {/* Featured Products */}
            {b.products && b.products.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-[var(--color-on-surface)] px-1">Featured Products</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {b.products.slice(0, 5).map((p) => (
                            <div key={p.id} className="w-full rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-2 flex items-center gap-3 snap-start">
                                <div className="w-16 h-16 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center overflow-hidden border border-[var(--color-outline-variant)]/5 flex-shrink-0">
                                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <ShoppingBag size={16} className="opacity-10" />}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-[11px] font-bold text-[var(--color-on-surface)] truncate">{p.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[10px] font-black text-[var(--color-primary)]">{p.currency || 'KES'} {p.price?.toLocaleString() || '0'}</p>
                                        <button className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-[var(--color-primary)] text-white text-[8px] font-black shadow-sm">
                                            Select <Plus size={8} strokeWidth={4} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Contact/Info */}
            <div className="grid grid-cols-1 gap-2">
                {(b.phone || b.email || b.openingHours || b.address) && (
                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 space-y-3">
                        {b.openingHours && <p className="text-[10px] flex items-center gap-2 text-[var(--color-on-surface-variant)]"><Clock size={12} className="text-[var(--color-primary)]" />{b.openingHours}</p>}
                        {b.phone && <p className="text-[10px] flex items-center gap-2 text-[var(--color-on-surface-variant)]"><Phone size={12} className="text-[var(--color-primary)]" />{b.phone}</p>}
                        {b.email && <p className="text-[10px] flex items-center gap-2 text-[var(--color-on-surface-variant)]"><Mail size={12} className="text-[var(--color-primary)]" />{b.email}</p>}
                        {(b.address || b.city) && <p className="text-[10px] flex items-center gap-2 text-[var(--color-on-surface-variant)]"><MapPin size={12} className="text-[var(--color-primary)]" />{[b.address, b.city].filter(Boolean).join(', ')}</p>}
                    </div>
                )}
            </div>

            {/* Social icons */}
            {b.socialLinks && Object.values(b.socialLinks).some(Boolean) && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    {b.socialLinks.whatsapp && <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center"><MessageSquare size={16} className="text-[var(--color-on-surface-variant)]" /></div>}
                    {b.socialLinks.instagram && <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center"><Instagram size={16} className="text-[var(--color-on-surface-variant)]" /></div>}
                    {b.socialLinks.facebook && <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center"><Facebook size={16} className="text-[var(--color-on-surface-variant)]" /></div>}
                    {b.socialLinks.google && <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center"><Search size={16} className="text-[var(--color-on-surface-variant)]" /></div>}
                </div>
            )}
        </div>
    </div>
);

const ShopView = ({ b }: { b: Business }) => {
    const allItems = [
        ...(b.products || []).map(p => ({ ...p, isService: false })),
        ...(b.services || []).map(s => ({ ...s, isService: true, type: 'Service' }))
    ];

    return (
        <div className="px-5 py-6 animate-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
                <h2 className="text-xl font-black text-[var(--color-on-surface)]">Shop</h2>
                <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">Browse our products & services</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-20">
                {allItems.length > 0 ? allItems.map((item: any) => (
                    <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-3 flex flex-col gap-2 shadow-sm">
                        <div className="aspect-square rounded-xl bg-[var(--color-surface-container)] flex items-center justify-center overflow-hidden border border-[var(--color-outline-variant)]/5">
                            {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10 bg-[var(--color-primary)]/5">
                                    {item.isService ? <Wrench size={24} /> : <ShoppingBag size={24} />}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[var(--color-on-surface)] truncate">{item.name}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-[11px] font-black text-[var(--color-primary)]">
                                    {item.currency || 'KES'} {item.price?.toLocaleString() || '0'}
                                </p>
                                <button className="w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shadow-sm">
                                    <Plus size={14} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 py-10 text-center opacity-30 italic text-xs">No items in shop</div>
                )}
            </div>
        </div>
    );
};

const AccountView = ({ b }: { b: Business }) => (
    <div className="px-5 py-6 animate-in slide-in-from-right-4 duration-300">
        <div className="mb-6">
            <h2 className="text-xl font-black text-[var(--color-on-surface)]">Account</h2>
            <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">Manage your profile & orders</p>
        </div>

        <div className="space-y-4 pb-20">
            {/* Profile Section */}
            <div className="p-4 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <User size={24} />
                </div>
                <div>
                    <h4 className="text-[13px] font-black">Guest User</h4>
                    <p className="text-[10px] opacity-60">Sign in to sync your data</p>
                </div>
            </div>

            {/* Menu Items */}
            <div className="rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 overflow-hidden">
                {[
                    { icon: PackageIcon, label: 'My Orders', badge: '0' },
                    { icon: SettingsIcon, label: 'Profile Settings' },
                    { icon: Shield, label: 'Privacy & Safety' },
                    { icon: LogOut, label: 'Sign Out', danger: true },
                ].map((item, idx) => (
                    <div key={idx} className={cn(
                        "flex items-center justify-between p-4 border-b border-[var(--color-outline-variant)]/5 last:border-0 hover:bg-[var(--color-surface-container-high)]/30 transition-colors cursor-pointer",
                        item.danger && "text-red-500"
                    )}>
                        <div className="flex items-center gap-3">
                            <item.icon size={16} className={cn(!item.danger && "text-[var(--color-on-surface-variant)] opacity-60")} />
                            <span className="text-[12px] font-bold">{item.label}</span>
                        </div>
                        {item.badge ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[9px] font-black">{item.badge}</span>
                        ) : (
                            <ChevronLeft className="rotate-180 opacity-20" size={14} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const PhotosView = ({ b }: { b: Business }) => (
    <div className="px-5 py-6 animate-in slide-in-from-right-4 duration-300">
        <div className="mb-6">
            <h2 className="text-xl font-black text-[var(--on-surface)]">Gallery</h2>
            <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">Visual showcase</p>
        </div>
        <div className="grid grid-cols-2 gap-2 pb-20">
            {((b as any).gallery || []).length > 0 ? (b as any).gallery.map((img: any) => (
                <div key={img.id} className="aspect-square rounded-2xl bg-[var(--color-surface-container-low)] overflow-hidden border border-[var(--color-outline-variant)]/10 shadow-sm">
                    {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="opacity-10 m-auto mt-8" />}
                </div>
            )) : (
                <div className="col-span-2 py-10 text-center opacity-30 italic text-xs">No photos in gallery</div>
            )}
        </div>
    </div>
);

const ReviewsView = ({ b }: { b: Business }) => {
    const avgRating = b.reviews?.length ? (b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length).toFixed(1) : null;
    return (
        <div className="px-5 py-6 animate-in slide-in-from-right-4 duration-300">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-black text-[var(--color-on-surface)]">Reviews</h2>
                    <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">Customer feedback</p>
                </div>
                {avgRating && <div className="text-[var(--color-primary)] font-black text-lg">{avgRating}<span className="text-xs opacity-40 ml-0.5">/ 5</span></div>}
            </div>
            <div className="space-y-3 pb-20">
                {b.reviews && b.reviews.length > 0 ? b.reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-[var(--color-on-surface)]">{r.author}</span>
                            <div className="flex">{[1, 2, 3, 4, 5].map(n => <Star key={n} size={8} className={n <= r.rating ? 'text-amber-400' : 'text-gray-200'} fill={n <= r.rating ? 'currentColor' : 'none'} />)}</div>
                        </div>
                        <p className="text-[10px] text-[var(--color-on-surface-variant)] leading-relaxed italic opacity-80">"{r.body}"</p>
                    </div>
                )) : (
                    <div className="py-10 text-center opacity-30 italic text-xs">No reviews available</div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function StorefrontPreview({ business: b, activeTab }: StorefrontPreviewProps) {
    const currentView = activeTab === 'themes' ? 'home' : activeTab;

    return (
        <div className="flex flex-col items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-4">Storefront Preview</p>
            {/* Phone frame */}
            <div className="w-[300px] h-[600px] rounded-[3rem] border-[8px] border-[var(--color-surface-container-highest)] bg-[var(--color-surface)] shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-[var(--color-outline-variant)]/5">

                {/* Status Bar */}
                <div className="h-8 flex items-center justify-between px-6 pt-2 relative z-20">
                    <span className="text-[10px] font-bold opacity-60">9:41</span>
                    <div className="w-16 h-5 bg-[var(--color-surface-container-highest)] rounded-full -mt-2" />
                    <div className="flex gap-1 items-center opacity-60"><ImageIcon size={8} /><ImageIcon size={8} /><ImageIcon size={10} /></div>
                </div>

                {/* Simulated URL/Navbar */}
                <div className="px-4 py-2 border-b border-[var(--color-outline-variant)]/10 bg-[var(--color-surface)]/80 backdrop-blur-md flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                        <Menu size={14} className="text-[var(--color-on-surface-variant)] opacity-40" />
                        <span className="text-[9px] font-bold text-[var(--color-on-surface-variant)]/60 tracking-wider uppercase">/{b.slug || 'store'}{activeTab && activeTab !== 'home' && activeTab !== 'themes' ? `/${activeTab}` : ''}</span>
                    </div>
                    {activeTab && activeTab !== 'home' && activeTab !== 'themes' && (
                        <button className="p-1 rounded-md bg-[var(--color-surface-container)] text-[var(--color-primary)]"><ChevronLeft size={12} /></button>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-none">
                    {/* Persistent Header */}
                    <div className="px-4 pt-4">
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 aspect-[2.5/1] shadow-sm">
                            {b.coverPhotoUrl ? (
                                <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${b.coverPhotoUrl})` }} />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Logo + name info */}
                        <div className="px-4 mt-4 relative z-[1] flex flex-row items-center gap-3 text-left">
                            <div className="w-16 h-16 rounded-full shadow-lg overflow-hidden flex items-center justify-center border-[3px] border-white flex-shrink-0" style={{ backgroundColor: b.themeColor || 'var(--color-primary)' }}>
                                {b.logoUrl ? <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${b.logoUrl})` }} /> : <span className="text-xl font-black text-white">{(b.name || 'B').charAt(0).toUpperCase()}</span>}
                            </div>
                            <div className="pb-1 flex-1 min-w-0">
                                <h3 className="text-xs font-black text-[var(--color-on-surface)] leading-tight truncate">{b.name || 'Business Name'}</h3>
                                {b.title && <p className="text-[8px] text-[var(--color-on-surface-variant)] font-bold opacity-80 truncate">{b.title}</p>}

                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-[6px] px-1.5 py-0.5 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-black uppercase">{b.industry}</span>
                                </div>

                                {b.description && (
                                    <div className="text-[8px] text-[var(--color-on-surface-variant)] opacity-70 flex items-center gap-1 mt-1">
                                        <p className="truncate flex-1">{b.description}</p>
                                        <button className="text-[var(--color-primary)] font-bold flex-shrink-0">...more</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* View Specific Content */}
                    <div className="mt-2">
                        {activeTab === 'home' || activeTab === 'themes' ? <HomeView b={b} /> :
                            activeTab === 'shop' ? <ShopView b={b} /> :
                                activeTab === 'inbox' ? <div className="p-10 text-center opacity-30 italic text-xs">Inbox View Placeholder</div> :
                                    activeTab === 'you' ? <AccountView b={b} /> :
                                        <HomeView b={b} />
                        }
                    </div>
                </div>

                {/* Bottom Bar (M3 Style) */}
                <div className="h-20 border-t border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container)] px-2 flex items-center justify-around relative z-10 pb-2">
                    {[
                        { id: 'home', label: 'Home', icon: <Store size={20} /> },
                        { id: 'shop', label: 'Shop', icon: <ShoppingBag size={20} /> },
                        { id: 'inbox', label: 'Inbox', icon: <MessageSquare size={20} /> },
                        { id: 'you', label: 'You', icon: <User size={20} /> },
                    ].map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {/* In preview, navigation is handled by activeTab prop */ }}
                                className="flex flex-col items-center gap-1 min-w-[56px]"
                            >
                                <div className="relative h-8 w-12 flex items-center justify-center">
                                    {isActive && (
                                        <div className="absolute inset-0 bg-[var(--color-secondary-container)] rounded-full" />
                                    )}
                                    <div className={cn(
                                        "relative z-10 transition-colors",
                                        isActive ? "text-[var(--color-on-secondary-container)]" : "text-[var(--color-on-surface-variant)] opacity-60"
                                    )}>
                                        {item.icon}
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[9px] font-medium transition-colors",
                                    isActive ? "text-[var(--color-on-surface)] font-bold" : "text-[var(--color-on-surface-variant)] opacity-60"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Interaction Overlay */}
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[2.5rem]" />
            </div>
        </div>
    );
}
