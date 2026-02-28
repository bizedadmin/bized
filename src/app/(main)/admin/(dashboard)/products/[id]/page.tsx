"use client";

import React, { useState, useEffect } from "react";
import { useBusiness, ProductItem, ProductCategory } from "@/contexts/BusinessContext";
import { useParams, useRouter } from "next/navigation";
import {
    Loader2, Package, Edit2, ChevronLeft,
    Link as LinkIcon, ShoppingBag, Tag,
    Hash, DollarSign, Layers, Globe, Clock,
    Info, Image as ImageIcon, Briefcase, FileText, Zap, Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ProductDetailPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const router = useRouter();
    const { id } = useParams();
    const [product, setProduct] = useState<ProductItem | null>(null);

    useEffect(() => {
        if (!isLoading && currentBusiness) {
            const found = currentBusiness.products?.find(p => p.id === id);
            if (found) {
                setProduct(found);
            }
        }
    }, [currentBusiness, isLoading, id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
                <p className="font-bold opacity-40 text-xs tracking-widest uppercase">Fetching details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
                <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--color-surface-container-high)] flex items-center justify-center mb-2 opacity-20">
                    <Package size={40} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Product Not Found</h2>
                <p className="text-[var(--color-on-surface-variant)] opacity-60 max-w-xs">The product you're looking for doesn't exist or has been removed.</p>
                <Link href="/admin/products/all">
                    <Button className="mt-4 px-8 h-12 rounded-2xl">Return to Inventory</Button>
                </Link>
            </div>
        );
    }

    const categories = (currentBusiness?.productCategories || []) as ProductCategory[];
    const categoryName = categories.find(c => c.id === product.category)?.name || "General";

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--color-outline-variant)]/10">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => router.back()}
                        className="p-3.5 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-high)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-all group active:scale-95 shadow-sm"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{product.name}</h1>
                            <span className={cn(
                                "text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border",
                                product.availability === 'InStock'
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : "bg-amber-50 text-amber-600 border-amber-200"
                            )}>
                                {product.availability === 'InStock' ? 'Live' : 'Unavailable'}
                            </span>
                        </div>
                        <p className="text-[var(--color-on-surface-variant)] opacity-70 text-sm mt-1 flex items-center gap-2">
                            <Tag size={14} /> {categoryName} • SKU: {product.sku || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${product.id}/edit`}>
                        <Button className="h-14 px-8 rounded-[var(--radius-m3-xl)] gap-3 shadow-[var(--shadow-m3-2)] bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-all active:scale-[0.98]">
                            <Edit2 size={20} /> <span className="text-lg">Edit Product</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Media & Primary Details */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Media Gallery */}
                    <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                <ImageIcon size={20} />
                            </div>
                            <h3 className="font-bold text-xl">Product Media</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(product.images?.length ? product.images : (product.image ? [product.image] : [])).map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-3xl overflow-hidden border border-[var(--color-outline-variant)]/10 bg-[var(--color-surface)] relative group">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {(!product.image && (!product.images || product.images.length === 0)) && (
                                <div className="aspect-square rounded-3xl border-2 border-dashed border-[var(--color-outline-variant)]/20 flex flex-col items-center justify-center text-[var(--color-on-surface-variant)] opacity-30 gap-3">
                                    <ShoppingBag size={48} strokeWidth={1} />
                                    <p className="font-bold text-sm">No images listed</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <h3 className="font-bold text-xl">Description</h3>
                        </div>
                        <div className="prose prose-sm max-w-none text-[var(--color-on-surface-variant)] leading-relaxed opacity-80 whitespace-pre-wrap">
                            {product.description || "No description provided for this product."}
                        </div>
                    </div>

                    {/* Specifications Card */}
                    <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <Layers size={20} />
                            </div>
                            <h3 className="font-bold text-xl text-[var(--color-on-surface)]">Specifications</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                            {[
                                { label: "Brand", value: product.brand || "Not specified", icon: Briefcase },
                                { label: "Condition", value: product.condition || "New", icon: Info },
                                { label: "Material", value: product.material || "Not specified", icon: Layers },
                                { label: "Color", value: product.color || "Not specified", icon: Tag },
                                { label: "SKU", value: product.sku || "Not specified", icon: Hash },
                                { label: "GTIN / EAN", value: product.gtin || "Not specified", icon: LinkIcon },
                                { label: "Category", value: categoryName, icon: Tag },
                                { label: "Main Status", value: product.availability || "InStock", icon: Clock },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-4 border-b border-[var(--color-outline-variant)]/5 last:border-0 sm:last:border-b">
                                    <div className="flex items-center gap-3 text-[var(--color-on-surface-variant)] opacity-60">
                                        <item.icon size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    <div className="text-sm font-black text-[var(--color-on-surface)]">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Availability Card */}
                        <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <h3 className="font-bold text-xl text-[var(--color-on-surface)]">Availability</h3>
                            </div>

                            <div className="space-y-2">
                                {[
                                    { label: "Visibility", value: product.visibility !== false ? "Visible" : "Hidden", icon: Globe },
                                    { label: "Stock Status", value: product.isSoldOut ? "Sold Out" : "Available", icon: Package },
                                    { label: "Launch", value: product.scheduledLaunch ? `Scheduled: ${product.scheduledDate}` : "Immediate", icon: Clock },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-4 border-b border-[var(--color-outline-variant)]/5 last:border-0">
                                        <div className="flex items-center gap-3 text-[var(--color-on-surface-variant)] opacity-60">
                                            <item.icon size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                        </div>
                                        <div className="text-sm font-black text-[var(--color-on-surface)]">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inventory Card */}
                        <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                    <Layers size={20} />
                                </div>
                                <h3 className="font-bold text-xl text-[var(--color-on-surface)]">Inventory</h3>
                            </div>

                            <div className="space-y-2">
                                {[
                                    { label: "Track Quantity", value: product.trackQuantity ? `Yes (${product.quantity || 0} left)` : "No", icon: Layers },
                                    { label: "Daily Capacity", value: product.dailyCapacityEnabled ? `${product.dailyCapacity} per day` : "Unlimited", icon: Zap },
                                    { label: "Min Order", value: product.minOrderQuantityEnabled ? `${product.minOrderQuantity}` : "None", icon: Hash },
                                    { label: "Max Order", value: product.maxOrderQuantityEnabled ? `${product.maxOrderQuantity}` : "None", icon: Hash },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-4 border-b border-[var(--color-outline-variant)]/5 last:border-0">
                                        <div className="flex items-center gap-3 text-[var(--color-on-surface-variant)] opacity-60">
                                            <item.icon size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                        </div>
                                        <div className="text-sm font-black text-[var(--color-on-surface)]">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tags block */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                    <Tag size={20} />
                                </div>
                                <h3 className="font-bold text-xl text-[var(--color-on-surface)]">Product Tags</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag, i) => (
                                    <span key={i} className="px-4 py-2 rounded-2xl bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-[11px] font-black uppercase tracking-widest border border-[var(--color-primary)]/10">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Options & Variants Section */}
                    <div className="space-y-8">
                        {product.options && product.options.length > 0 && (
                            <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                        <Plus size={20} />
                                    </div>
                                    <h3 className="font-bold text-xl text-[var(--color-on-surface)]">Available Options</h3>
                                </div>
                                <div className="space-y-6">
                                    {product.options.map(option => (
                                        <div key={option.id} className="space-y-3">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{option.name}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {option.values.map((val, i) => (
                                                    <span key={i} className="px-4 py-2 rounded-2xl bg-[var(--color-secondary)]/5 text-[var(--color-secondary)] text-[11px] font-black uppercase tracking-widest border border-[var(--color-secondary)]/10">
                                                        {val}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.variants && product.variants.length > 0 && (
                            <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
                                        <Package size={20} />
                                    </div>
                                    <h3 className="font-bold text-xl text-[var(--color-on-surface)]">Product Variants</h3>
                                </div>
                                <div className="overflow-x-auto -mx-6 sm:-mx-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--color-outline-variant)]/10">
                                                <th className="px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-40">Variant</th>
                                                <th className="px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-40">Price</th>
                                                <th className="px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-40">SKU</th>
                                                <th className="px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-40">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {product.variants.map(variant => (
                                                <tr key={variant.id} className="border-b border-[var(--color-outline-variant)]/5 last:border-0 hover:bg-[var(--color-surface-container-high)]/30 transition-colors">
                                                    <td className="px-6 sm:px-8 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="font-bold text-sm flex items-center gap-2">
                                                                {variant.name}
                                                                {variant.visibility === false && (
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-zinc-500/10 text-zinc-500 text-[8px] font-black uppercase tracking-wider border border-zinc-500/10">Hidden</span>
                                                                )}
                                                            </div>
                                                            {variant.sku && <div className="text-[10px] opacity-40 font-medium">{variant.sku}</div>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 sm:px-8 py-4 text-sm font-black text-nowrap">
                                                        <span className="opacity-40 font-medium mr-1">{product.currency || currentBusiness?.currency || "$"}</span>
                                                        {variant.price?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 sm:px-8 py-4 text-sm font-medium opacity-60">{variant.sku || "—"}</td>
                                                    <td className="px-6 sm:px-8 py-4 text-sm font-bold">
                                                        {variant.trackQuantity ? (
                                                            <span className={cn(
                                                                "px-2 py-1 rounded-lg text-[10px] font-black uppercase",
                                                                (variant.quantity || 0) > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                                            )}>
                                                                {variant.quantity || 0} in stock
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-500/10 text-blue-600">
                                                                Unlimited
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: Pricing, Inventory & Meta */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Key Stats Card */}
                    <div className="bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="text-[10px] font-black tracking-widest uppercase opacity-60 mb-2">Listed Price</div>
                            <div className="text-4xl font-black tracking-tighter flex items-center gap-2">
                                <span className="text-xl opacity-60 font-medium">{product.currency || currentBusiness?.currency || '$'}</span>
                                {product.price?.toLocaleString()}
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] font-black tracking-widest uppercase opacity-60 mb-1">Type</div>
                                    <div className="font-bold text-sm">{product.type || 'Physical'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black tracking-widest uppercase opacity-60 mb-1">Weight</div>
                                    <div className="font-bold text-sm">{product.weight ? `${product.weight}g` : 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* SEO Quick View */}
                    <div className="bg-[var(--color-surface-container-low)] rounded-[2.5rem] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                <Globe size={20} />
                            </div>
                            <h3 className="font-bold text-xl">Search Preview</h3>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10">
                            <div className="text-blue-600 font-medium text-lg leading-tight truncate hover:underline cursor-pointer">
                                {product.metaTitle || `${product.name} | ${currentBusiness?.name}`}
                            </div>
                            <div className="text-emerald-700 text-sm mt-1 flex items-center gap-1">
                                https://{currentBusiness?.slug}.bized.app/products/{product.productSlug || product.id}
                            </div>
                            <div className="text-[var(--color-on-surface-variant)] text-xs mt-2 line-clamp-2 opacity-70">
                                {product.metaDescription || product.description || `View full details for ${product.name}. High quality items from ${currentBusiness?.name}.`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
