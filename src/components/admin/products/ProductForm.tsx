"use client";

import React, { useState, useEffect } from "react";
import {
    X, Upload, Loader2, Check,
    ImageIcon, Tag,
    DollarSign, Package, Layers,
    Globe, ChevronLeft, ChevronRight, Save, Edit2, Plus, FolderTree,
    ChevronUp, ChevronDown, HelpCircle, Wand2, Sparkles, Target, Zap, Clock,
    Trash2, ArrowUpDown
} from "lucide-react";
import { ImageEditor } from "@/components/ui/ImageEditor";
import { ProductItem, useBusiness, ProductCategory, ProductType, ProductOption, ProductVariant } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CategorySheet } from "@/components/admin/products/CategorySheet";
import { CategorySelectorSheet } from "@/components/admin/products/CategorySelectorSheet";
import { useRouter } from "next/navigation";
import { HelpIcon, useHelpCenter } from "@/components/admin/HelpCenter";
import { AiImportSheet } from "@/components/admin/products/AiImportSheet";
import { AiDescriptionSheet } from "@/components/admin/products/AiDescriptionSheet";
import { useSnackbar } from "@/components/ui/Snackbar";

interface ProductFormProps {
    initialData?: ProductItem | null;
    onSave: (product: ProductItem) => Promise<void>;
    slug?: string;
    isSubmitting?: boolean;
    hideHeader?: boolean;
    onCancel?: () => void;
}

export function ProductForm({ initialData, onSave, slug, isSubmitting, hideHeader, onCancel }: ProductFormProps) {
    const router = useRouter();
    const { currentBusiness } = useBusiness();
    const { openHelp } = useHelpCenter();
    const { showSnackbar } = useSnackbar();
    const [formData, setFormData] = useState<Partial<ProductItem>>({
        type: "Physical",
        name: "",
        description: "",
        image: "",
        price: 0,
        sku: "",
        gtin: "",
        brand: "",
        category: "",
        availability: "InStock",
        featured: false,
        weight: 0,
        downloadLink: "",
        bookingType: "Date only",
        deliveryIntervals: [],
        deliveryCount: [],
        metaTitle: "",
        metaDescription: "",
        productSlug: "",
        condition: "New",
        material: "",
        color: "",
        imageAltTexts: [],
        currency: currentBusiness?.currency || "USD",
        visibility: true,
        isSoldOut: false,
        scheduledLaunch: false,
        scheduledDate: "",
        trackQuantity: false,
        quantity: 0,
        dailyCapacityEnabled: false,
        dailyCapacity: 0,
        maxOrderQuantityEnabled: false,
        maxOrderQuantity: 0,
        minOrderQuantityEnabled: false,
        minOrderQuantity: 0,
        tags: [],
        variants: [],
        options: [],
        bundleItems: []
    });
    const [expandedVariants, setExpandedVariants] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [editingImage, setEditingImage] = useState<{ url: string, index: number | "NEW" | { variantIdx: number } } | null>(null);
    const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
    const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);

    // UI State for advanced pricing
    const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
    const [advancedPricingState, setAdvancedPricingState] = useState({
        estimated: false,
        costPerItem: false,
        pricePerUnit: false,
        taxOverride: false
    });
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [isAiImproving, setIsAiImproving] = useState(false);
    const [isAiImportSheetOpen, setIsAiImportSheetOpen] = useState(false);
    const [isAiDescriptionSheetOpen, setIsAiDescriptionSheetOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                images: initialData.images?.length ? initialData.images : (initialData.image ? [initialData.image] : []),
                currency: initialData.currency || currentBusiness?.currency || "USD"
            });
            if (initialData.taxRateId) {
                setAdvancedPricingState(s => ({ ...s, taxOverride: true }));
                setShowAdvancedPricing(true);
            }
        }
    }, [initialData, currentBusiness?.currency]);

    const coreUploadImage = async (dataUrl: string, fileName: string) => {
        if (!slug) return null;
        setUploading(true);
        try {
            const blob = await (await fetch(dataUrl)).blob();
            const uploadFormData = new FormData();
            uploadFormData.append("file", blob, fileName);
            uploadFormData.append("slug", slug);

            const res = await fetch("/api/upload/product", {
                method: "POST",
                body: uploadFormData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();
            return url as string;
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image. Please try again.");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const uploadFinalImage = async (dataUrl: string, indexToUpdate: number | "NEW") => {
        const url = await coreUploadImage(dataUrl, "product-image.webp");
        if (!url) return;

        const newImages = [...(formData.images || [])];
        if (indexToUpdate === "NEW") {
            newImages.push(url);
        } else {
            newImages[indexToUpdate] = url;
        }

        setFormData(prev => ({
            ...prev,
            images: newImages,
            image: newImages[0] || ""
        }));

        if (!initialData && newImages.length === 1 && !formData.name) {
            analyzeImageWithAi(url);
        }
    };

    const uploadVariantImage = async (dataUrl: string, variantIdx: number) => {
        const url = await coreUploadImage(dataUrl, "variant-image.webp");
        if (!url) return;

        setFormData(p => {
            const newVariants = [...(p.variants || [])];
            if (newVariants[variantIdx]) {
                newVariants[variantIdx].image = url;
            }
            return { ...p, variants: newVariants };
        });
    };

    const analyzeImageWithAi = async (imageUrl: string) => {
        if (!currentBusiness?._id) return;
        setIsAiAnalyzing(true);
        try {
            const res = await fetch("/api/ai/analyze-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image: imageUrl,
                    storeId: currentBusiness._id
                })
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "AI analysis failed");
            }
            const data = await res.json();
            setFormData(prev => ({
                ...prev,
                name: prev.name || data.title,
                description: prev.description || data.description,
                brand: prev.brand || data.brand,
                price: prev.price || data.price,
                metaTitle: prev.metaTitle || data.metaTitle || data.title,
                metaDescription: prev.metaDescription || data.metaDescription || data.description,
                productSlug: prev.productSlug || data.productSlug,
                condition: data.condition || prev.condition || "New",
                material: data.material || prev.material,
                color: data.color || prev.color,
                imageAltTexts: data.imageAltText ? [data.imageAltText, ...(prev.imageAltTexts || [])] : prev.imageAltTexts
            }));
        } catch (error) {
            console.error("AI Analysis Error:", error);
        } finally {
            setIsAiAnalyzing(false);
        }
    };

    const improveDescriptionWithAi = () => {
        if (!formData.description) return;
        setIsAiDescriptionSheetOpen(true);
    };

    const calculateSEOHealth = () => {
        let score = 0;
        const suggestions: { title: string; description: string; helpKey: string; type: 'seo' | 'id' }[] = [];

        // Title Check
        if (formData.name && formData.name.length >= 10) score += 20;
        else suggestions.push({
            title: "Add a descriptive product name",
            description: "A name with at least 10 characters helps search engines understand what you're selling.",
            helpKey: "seoMetaTitle",
            type: 'seo'
        });

        // Meta Description Check
        if (formData.metaDescription && formData.metaDescription.length >= 50) score += 20;
        else if (formData.description && formData.description.length >= 50) score += 10;
        else suggestions.push({
            title: "Add a compelling meta description",
            description: "Short summaries (50+ chars) increase click-through rates from Google search results.",
            helpKey: "seoMetaDescription",
            type: 'seo'
        });

        // Image Check & Alt Text
        if (formData.images && formData.images.length > 0) {
            score += 20;
            const hasAltText = formData.imageAltTexts && formData.imageAltTexts.some(t => t && t.length > 5);
            if (hasAltText) score += 10;
            else suggestions.push({
                title: "Add image alt-texts",
                description: "Describe your photos to help them appear in Google Image search results.",
                helpKey: "imageAltText",
                type: 'seo'
            });
        } else {
            suggestions.push({
                title: "Upload a product photo",
                description: "Products with images get 94% more views and better search ranking.",
                helpKey: "storeLogo", // generic image help
                type: 'seo'
            });
        }

        // GTIN/Identification
        if (formData.brand && formData.gtin) score += 20;
        else if (formData.brand || formData.gtin) score += 10;
        else suggestions.push({
            title: "Add Brand and GTIN/Barcode",
            description: "Providing a Brand and GTIN (Barcode) is required for Google Shopping and merchant rich results.",
            helpKey: "productIdentification",
            type: 'id'
        });

        // Slug Check
        if (formData.productSlug) score += 10;
        else suggestions.push({
            title: "Customize your URL slug",
            description: "A clean, keyword-rich URL improves search ranking and store shareability.",
            helpKey: "productSlug",
            type: 'seo'
        });

        return { score, suggestions };
    };

    const handleApplyImportedData = (data: Partial<ProductItem>) => {
        setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            description: data.description || prev.description,
            price: data.price || prev.price,
            brand: data.brand || prev.brand,
            sku: data.sku || prev.sku,
            images: data.images?.length ? data.images : prev.images,
            image: data.images?.[0] || prev.image,
            // SEO & Rich Metadata
            metaTitle: (data as Partial<ProductItem>).metaTitle || prev.metaTitle,
            metaDescription: (data as Partial<ProductItem>).metaDescription || prev.metaDescription,
            productSlug: (data as Partial<ProductItem>).productSlug || prev.productSlug,
            condition: (data as Partial<ProductItem>).condition || prev.condition,
            material: (data as Partial<ProductItem>).material || prev.material,
            color: (data as Partial<ProductItem>).color || prev.color,
            imageAltTexts: (data as Partial<ProductItem>).imageAltTexts || prev.imageAltTexts
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (onSave) {
            await onSave({
                ...formData,
                id: initialData?.id || Math.random().toString(36).substr(2, 9),
            } as ProductItem);

            showSnackbar(
                initialData ? "Product updated successfully" : "Product created successfully",
                "success",
                3000
            );
        }

        if (!onCancel) {
            // Delay navigation slightly to let the user see the snackbar
            setTimeout(() => {
                router.back();
            }, 800);
        }
    };

    // Helper to generate a flat list of categories with indentation for the Select
    const getCategoryPath = (categoryId: string) => {
        const cats = (currentBusiness?.productCategories || []) as ProductCategory[];
        const path: string[] = [];
        let currentId: string | undefined = categoryId;

        while (currentId) {
            const cat = cats.find(c => c.id === currentId);
            if (cat) {
                path.unshift(cat.name);
                currentId = cat.parentId;
            } else {
                currentId = undefined;
            }
        }

        return path.join(" > ") || "Select category";
    };

    const Switch = ({ checked, onChange, label, description }: { checked: boolean, onChange: (v: boolean) => void, label: string, description?: string }) => (
        <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--color-on-surface)]">{label}</span>
                {description && <span className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50 font-medium leading-tight">{description}</span>}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
                <div className="w-10 h-6 bg-[var(--color-surface-container-high)] rounded-full peer peer-checked:bg-[var(--color-primary)] transition-colors flex items-center px-1">
                    <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", checked ? "translate-x-4" : "translate-x-0")} />
                </div>
            </label>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="pb-24 sm:pb-12">
            {/* Mobile Header */}
            {!hideHeader && (
                <div className="sticky top-0 z-40 flex items-center justify-between p-4 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/10 sm:hidden">
                    <button type="button" onClick={() => onCancel ? onCancel() : router.back()} className="p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors">
                        <ChevronLeft size={24} className="text-[var(--color-on-surface)]" />
                    </button>
                    <h2 className="font-bold text-lg text-[var(--color-on-surface)]">{initialData ? "Edit Product" : "New Product"}</h2>
                    {!initialData ? (
                        <button
                            type="button"
                            onClick={() => setIsAiImportSheetOpen(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] active:scale-90 transition-all"
                        >
                            <Sparkles size={20} />
                        </button>
                    ) : (
                        <div className="w-10" />
                    )}
                </div>
            )}

            <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
                {/* Desktop Header */}
                {!hideHeader && (
                    <div className="hidden sm:flex items-center justify-between mb-2">
                        <div className="flex items-center gap-5">
                            <button type="button" onClick={() => onCancel ? onCancel() : router.back()} className="p-3.5 rounded-[var(--radius-m3-l)] bg-[var(--color-surface-container-high)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-all group active:scale-95 shadow-[var(--shadow-m3-1)]">
                                <ChevronLeft size={22} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{initialData ? "Edit Product" : "Create Product"}</h1>
                                <p className="text-[var(--color-on-surface-variant)] opacity-70 text-sm mt-1">Configure your product&apos;s visibility and inventory details.</p>
                            </div>
                        </div>

                        {!initialData && (
                            <Button
                                type="button"
                                onClick={() => setIsAiImportSheetOpen(true)}
                                className="h-12 px-6 rounded-xl font-bold gap-2 shadow-[var(--shadow-m3-1)] bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90 transition-all active:scale-95"
                            >
                                <Sparkles size={18} />
                                AI Import
                            </Button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Media & Primary Info */}
                    <div className="lg:col-span-12 space-y-6">



                        <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-xl">Product Details</h3>
                                {hideHeader && !initialData && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAiImportSheetOpen(true)}
                                        className="flex items-center gap-2 px-4 h-9 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-xs font-bold hover:opacity-90 transition-all shadow-sm active:scale-95"
                                    >
                                        <Sparkles size={14} />
                                        AI Import
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1">Name <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all font-medium text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 flex items-center">Type <HelpIcon topic="productType" /></label>
                                        <div className="relative z-[60]">
                                            <Select
                                                value={formData.type || "Physical"}
                                                onValueChange={v => setFormData(p => ({ ...p, type: v as ProductType }))}
                                                options={[
                                                    { label: "Physical", value: "Physical" },
                                                    { label: "Digital", value: "Digital" },
                                                    { label: "Booking", value: "Booking" },
                                                    { label: "Subscription", value: "Subscription" },
                                                    { label: "Others", value: "Others" }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    {formData.type !== "Booking" && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1">Category <span className="text-red-500">*</span></label>
                                                <div className="flex gap-2 relative z-[55]">
                                                    <div className="flex-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsCategorySelectorOpen(true)}
                                                            className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)] outline-none transition-all flex items-center justify-between group"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                                                    <FolderTree size={16} />
                                                                </div>
                                                                <div className="text-left min-w-0">
                                                                    <p className={cn(
                                                                        "text-sm font-bold truncate",
                                                                        formData.category ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)] opacity-40"
                                                                    )}>
                                                                        {formData.category ? getCategoryPath(formData.category) : "Select category"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={18} className="text-[var(--color-on-surface-variant)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 flex items-center">SKU <HelpIcon topic="sku" /></label>
                                                    <input
                                                        type="text"
                                                        placeholder="SKU"
                                                        value={formData.sku || ""}
                                                        onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))}
                                                        className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all text-sm font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 flex items-center">Weight <HelpIcon topic="weight" /></label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={formData.weight === 0 ? "" : formData.weight}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                setFormData(p => ({ ...p, weight: val === "" ? 0 : parseFloat(val) }));
                                                            }}
                                                            className="w-full h-[52px] px-5 pr-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all text-right text-sm font-medium"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-on-surface-variant)] opacity-50 font-medium">g</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-6 md:border-l md:border-[var(--color-outline-variant)]/10 md:pl-8">
                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-sm font-medium text-[var(--color-on-surface-variant)]">Detailed Description</label>
                                            <button
                                                type="button"
                                                onClick={improveDescriptionWithAi}
                                                disabled={!formData.description || isAiImproving}
                                                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:opacity-80 disabled:opacity-30 transition-all"
                                            >
                                                {isAiImproving ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                                Improve with AI
                                            </button>
                                        </div>
                                        <textarea
                                            placeholder="Highlight key features, materials and sizing details..."
                                            value={formData.description}
                                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                            className="w-full flex-1 min-h-[120px] p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] text-sm leading-relaxed transition-all shadow-sm resize-none placeholder:opacity-40"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Type-specific Section */}
                        {formData.type === "Booking" && (
                            <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                                <h3 className="font-bold text-xl mb-6">Booking</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1">Booking type <span className="text-red-500">*</span></label>
                                        <div className="relative z-[50]">
                                            <Select
                                                value={formData.bookingType || "Date only"}
                                                onValueChange={v => setFormData(p => ({ ...p, bookingType: v }))}
                                                options={[
                                                    { label: "Date only", value: "Date only" },
                                                    { label: "Date and time", value: "Date and time" },
                                                    { label: "Stay", value: "Stay" },
                                                    { label: "Rental", value: "Rental" }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    {formData.bookingType === "Rental" && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                            <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1">Pricing <span className="text-red-500">*</span></label>
                                            <div className="relative z-[45]">
                                                <Select
                                                    value={formData.rentalPricing || "Hourly"}
                                                    onValueChange={v => setFormData(p => ({ ...p, rentalPricing: v }))}
                                                    options={[
                                                        { label: "Hourly", value: "Hourly" },
                                                        { label: "Daily", value: "Daily" },
                                                        { label: "Monthly", value: "Monthly" },
                                                        { label: "Quarterly", value: "Quarterly" },
                                                        { label: "Annually", value: "Annually" }
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {formData.type === "Digital" && (
                            <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                                <h3 className="font-bold text-xl mb-6">Digital product</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 block border-b-0">Download link</label>
                                        <p className="text-xs text-[var(--color-on-surface-variant)] opacity-70 mb-2 font-medium">Confirm your order to show download link on invoice. <a href="#" className="text-[var(--color-primary)] hover:underline">Learn more</a></p>
                                        <input
                                            type="url"
                                            placeholder="https://example.com/download"
                                            value={formData.downloadLink || ""}
                                            onChange={e => setFormData(p => ({ ...p, downloadLink: e.target.value }))}
                                            className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 block border-b-0">Licenses</label>
                                        <p className="text-xs text-[var(--color-on-surface-variant)] opacity-70 mb-2 font-medium">Save product to manage licenses</p>
                                        <button type="button" disabled className="w-full h-[52px] rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] font-bold text-sm opacity-50 cursor-not-allowed">
                                            Manage licenses
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.type === "Subscription" && (
                            <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                                <h3 className="font-bold text-xl mb-6">Subscription options</h3>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 flex items-center">Delivery intervals <HelpIcon topic="deliveryIntervals" /></label>
                                        <div className="flex flex-wrap gap-6">
                                            {["Every week", "Every 2 weeks", "Every 4 weeks"].map(interval => (
                                                <label key={interval} className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.deliveryIntervals?.includes(interval) || false}
                                                        onChange={e => {
                                                            const arr = formData.deliveryIntervals || [];
                                                            if (e.target.checked) {
                                                                setFormData(p => ({ ...p, deliveryIntervals: [...arr, interval] }));
                                                            } else {
                                                                setFormData(p => ({ ...p, deliveryIntervals: arr.filter(i => i !== interval) }));
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded border-2 border-[var(--color-outline-variant)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)] transition-colors"
                                                    />
                                                    <span className="text-sm font-medium group-hover:text-[var(--color-primary)] transition-colors">{interval}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 flex items-center">Number of deliveries <HelpIcon topic="deliveryCount" /></label>
                                        <div className="flex flex-col gap-3">
                                            {["4 times", "8 times", "12 times"].map(count => (
                                                <label key={count} className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.deliveryCount?.includes(count) || false}
                                                        onChange={e => {
                                                            const arr = formData.deliveryCount || [];
                                                            if (e.target.checked) {
                                                                setFormData(p => ({ ...p, deliveryCount: [...arr, count] }));
                                                            } else {
                                                                setFormData(p => ({ ...p, deliveryCount: arr.filter(c => c !== count) }));
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded border-2 border-[var(--color-outline-variant)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)] transition-colors"
                                                    />
                                                    <span className="text-sm font-medium group-hover:text-[var(--color-primary)] transition-colors">{count}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing & Logistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-[var(--radius-m3-m)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center hidden">
                                        <DollarSign size={20} />
                                    </div>
                                    <h3 className="font-bold text-xl">Pricing</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 flex items-center">
                                            {formData.type === "Booking" && formData.bookingType === "Rental"
                                                ? `Price per ${formData.rentalPricing === "Hourly" ? "hour" : formData.rentalPricing === "Daily" ? "day" : formData.rentalPricing === "Monthly" ? "month" : formData.rentalPricing === "Quarterly" ? "quarter" : "year"}`
                                                : "Price"
                                            }
                                            <HelpIcon topic="price" />
                                        </label>
                                        <div className="relative group flex items-center">
                                            <div className="absolute left-4 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all font-bold text-sm">
                                                {currentBusiness?.currency || "USD"}
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={formData.price || ""}
                                                onChange={e => setFormData(p => ({ ...p, price: parseFloat(e.target.value) }))}
                                                className="w-full h-[48px] pl-16 pr-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] font-medium text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--color-on-surface-variant)] px-1 flex items-center">Original price <HelpIcon topic="compareAtPrice" /></label>
                                        <div className="relative group flex items-center">
                                            <div className="absolute left-4 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:text-[var(--color-primary)] transition-all font-bold text-sm">
                                                {currentBusiness?.currency || "USD"}
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={formData.compareAtPrice || ""}
                                                onChange={e => setFormData(p => ({ ...p, compareAtPrice: parseFloat(e.target.value) }))}
                                                className="w-full h-[48px] pl-16 pr-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 outline-none focus:border-[var(--color-primary)] font-medium text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${advancedPricingState.estimated ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-container-high)] grayscale opacity-50'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${advancedPricingState.estimated ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                        <input type="checkbox" className="hidden" checked={advancedPricingState.estimated} onChange={e => setAdvancedPricingState(s => ({ ...s, estimated: e.target.checked }))} />
                                        <span className="text-sm font-medium text-[var(--color-on-surface)]">Display as estimated price</span>
                                        <HelpIcon topic="estimatedPrice" />
                                    </label>

                                    {showAdvancedPricing && (
                                        <div className="space-y-4 animate-in fade-in pb-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input type="checkbox" checked={advancedPricingState.costPerItem} onChange={e => setAdvancedPricingState(s => ({ ...s, costPerItem: e.target.checked }))} className="peer appearance-none w-5 h-5 rounded border-2 border-[var(--color-outline-variant)]/20 checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all cursor-pointer" />
                                                    <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                                </div>
                                                <span className="text-sm font-medium text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors flex items-center">Cost per item <HelpIcon topic="costPerItem" /></span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input type="checkbox" checked={advancedPricingState.pricePerUnit} onChange={e => setAdvancedPricingState(s => ({ ...s, pricePerUnit: e.target.checked }))} className="peer appearance-none w-5 h-5 rounded border-2 border-[var(--color-outline-variant)]/20 checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all cursor-pointer" />
                                                    <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                                </div>
                                                <span className="text-sm font-medium text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors flex items-center">Price per unit <HelpIcon topic="pricePerUnit" /></span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input type="checkbox" checked={advancedPricingState.taxOverride} onChange={e => {
                                                        const isChecked = e.target.checked;
                                                        setAdvancedPricingState(s => ({ ...s, taxOverride: isChecked }));
                                                        if (!isChecked) {
                                                            setFormData(p => ({ ...p, taxRateId: undefined }));
                                                        }
                                                    }} className="peer appearance-none w-5 h-5 rounded border-2 border-[var(--color-outline-variant)]/20 checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all cursor-pointer" />
                                                    <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                                </div>
                                                <span className="text-sm font-medium text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors flex items-center">Tax override <HelpIcon topic="taxOverride" /></span>
                                            </label>

                                            {advancedPricingState.taxOverride && (
                                                <div className="pl-8 pt-1 animate-in fade-in slide-in-from-top-2">
                                                    <div className="space-y-2 relative z-[45]">
                                                        <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60">Select Tax Rate</label>
                                                        <Select
                                                            value={formData.taxRateId || "none"}
                                                            onValueChange={v => setFormData(p => ({ ...p, taxRateId: v === "none" ? undefined : v }))}
                                                            options={[
                                                                { label: "No Tax (0%)", value: "none" },
                                                                ...(currentBusiness?.taxes || []).map(t => ({
                                                                    label: `${t.name} (${t.rate}%)`,
                                                                    value: t.id
                                                                }))
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)]/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvancedPricing(!showAdvancedPricing)}
                                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors"
                                    >
                                        {showAdvancedPricing ? 'Show less' : 'Show more'}
                                        {showAdvancedPricing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-[var(--radius-m3-m)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                        <Layers size={20} />
                                    </div>
                                    <h3 className="font-bold text-xl">Inventory Status</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-40 px-1">Condition</label>
                                    <Select
                                        value={formData.condition || "New"}
                                        onValueChange={v => setFormData(p => ({ ...p, condition: v as "New" | "Used" | "Refurbished" }))}
                                        options={[
                                            { label: "New", value: "New" },
                                            { label: "Used", value: "Used" },
                                            { label: "Refurbished", value: "Refurbished" }
                                        ]}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-40 px-1">Material</label>
                                        <input
                                            type="text"
                                            placeholder="Leather, Silk, etc."
                                            value={formData.material}
                                            onChange={e => setFormData(p => ({ ...p, material: e.target.value }))}
                                            className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-40 px-1">Color</label>
                                        <input
                                            type="text"
                                            placeholder="Midnight Black"
                                            value={formData.color}
                                            onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}
                                            className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Availability Section */}
                        <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                Availability
                            </h3>
                            <div className="space-y-4">
                                <Switch
                                    label="Visibility"
                                    checked={formData.visibility ?? true}
                                    onChange={v => setFormData(p => ({ ...p, visibility: v }))}
                                />
                                <Switch
                                    label="Mark as sold out"
                                    checked={formData.isSoldOut || false}
                                    onChange={v => setFormData(p => ({ ...p, isSoldOut: v }))}
                                />
                                <Switch
                                    label="Scheduled launch"
                                    checked={formData.scheduledLaunch || false}
                                    onChange={v => setFormData(p => ({ ...p, scheduledLaunch: v }))}
                                />
                                {formData.scheduledLaunch && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="datetime-local"
                                            value={formData.scheduledDate || ""}
                                            onChange={e => setFormData(p => ({ ...p, scheduledDate: e.target.value }))}
                                            className="w-full h-11 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Inventory Section */}
                        <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                    <Layers size={20} />
                                </div>
                                Inventory
                            </h3>
                            <div className="space-y-4">
                                <Switch
                                    label="Track quantity"
                                    checked={formData.trackQuantity || false}
                                    onChange={v => setFormData(p => ({ ...p, trackQuantity: v }))}
                                />
                                {formData.trackQuantity && (
                                    <div className="pl-2 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="number"
                                            placeholder="Stock Quantity"
                                            value={formData.quantity || ""}
                                            onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) }))}
                                            className="w-full h-11 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium text-sm"
                                        />
                                    </div>
                                )}
                                <Switch
                                    label="Daily capacity"
                                    description="The maximum number of items you can sell per day"
                                    checked={formData.dailyCapacityEnabled || false}
                                    onChange={v => setFormData(p => ({ ...p, dailyCapacityEnabled: v }))}
                                />
                                {formData.dailyCapacityEnabled && (
                                    <div className="pl-2 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="number"
                                            placeholder="Daily Items"
                                            value={formData.dailyCapacity || ""}
                                            onChange={e => setFormData(p => ({ ...p, dailyCapacity: parseInt(e.target.value) }))}
                                            className="w-full h-11 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium text-sm"
                                        />
                                    </div>
                                )}

                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between gap-4 mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Upgrade to Business</div>
                                            <div className="text-[10px] opacity-60">Unlock advanced tracking</div>
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold border-blue-500/20 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500/30">Upgrade</Button>
                                </div>

                                <Switch
                                    label="Maximum order quantity"
                                    description="The maximum number of items customers can buy per order"
                                    checked={formData.maxOrderQuantityEnabled || false}
                                    onChange={v => setFormData(p => ({ ...p, maxOrderQuantityEnabled: v }))}
                                />
                                {formData.maxOrderQuantityEnabled && (
                                    <div className="pl-2 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="number"
                                            placeholder="Max per order"
                                            value={formData.maxOrderQuantity || ""}
                                            onChange={e => setFormData(p => ({ ...p, maxOrderQuantity: parseInt(e.target.value) }))}
                                            className="w-full h-11 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium text-sm"
                                        />
                                    </div>
                                )}
                                <Switch
                                    label="Minimum order quantity"
                                    description="The minimum number of items customers should buy per order"
                                    checked={formData.minOrderQuantityEnabled || false}
                                    onChange={v => setFormData(p => ({ ...p, minOrderQuantityEnabled: v }))}
                                />
                                {formData.minOrderQuantityEnabled && (
                                    <div className="pl-2 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="number"
                                            placeholder="Min per order"
                                            value={formData.minOrderQuantity || ""}
                                            onChange={e => setFormData(p => ({ ...p, minOrderQuantity: parseInt(e.target.value) }))}
                                            className="w-full h-11 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tags Section */}
                        <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                    <Tag size={20} />
                                </div>
                                Tags
                            </h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Add tags separated by comma..."
                                    value={formData.tags?.join(", ") || ""}
                                    onChange={e => {
                                        const tags = e.target.value.split(",").map(t => t.trim()).filter(t => t);
                                        setFormData(p => ({ ...p, tags }));
                                    }}
                                    className="w-full h-12 px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium text-sm"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags?.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            {tag}
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, tags: p.tags?.filter((_, idx) => idx !== i) }))}>
                                                <X size={10} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Options Section */}
                        <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                    <Plus size={20} />
                                </div>
                                Options
                            </h3>
                            <div className="space-y-6">
                                {formData.options?.map((option, optIdx) => (
                                    <div key={option.id} className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="text"
                                                placeholder="Option Name (e.g. Size)"
                                                value={option.name}
                                                onChange={e => {
                                                    const newOptions = [...(formData.options || [])];
                                                    newOptions[optIdx].name = e.target.value;
                                                    setFormData(p => ({ ...p, options: newOptions }));
                                                }}
                                                className="bg-transparent font-bold text-lg outline-none w-full"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, options: p.options?.filter((_, i) => i !== optIdx) }))}
                                                className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {option.values.map((val, valIdx) => (
                                                    <span key={valIdx} className="px-3 py-1.5 rounded-xl bg-[var(--color-secondary)]/5 text-[var(--color-secondary)] text-[10px] font-black uppercase tracking-widest border border-[var(--color-secondary)]/10 flex items-center gap-2">
                                                        {val}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = [...(formData.options || [])];
                                                                newOptions[optIdx].values = newOptions[optIdx].values.filter((_, i) => i !== valIdx);
                                                                setFormData(p => ({ ...p, options: newOptions }));
                                                            }}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Add value and press Enter..."
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = (e.target as HTMLInputElement).value.trim();
                                                        if (val && !option.values.includes(val)) {
                                                            const newOptions = [...(formData.options || [])];
                                                            newOptions[optIdx].values.push(val);
                                                            setFormData(p => ({ ...p, options: newOptions }));
                                                            (e.target as HTMLInputElement).value = "";
                                                        }
                                                    }
                                                }}
                                                className="w-full h-11 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm outline-none focus:border-[var(--color-secondary)]"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newOption = { id: Math.random().toString(36).substr(2, 9), name: "", values: [] };
                                        setFormData(p => ({ ...p, options: [...(p.options || []), newOption] }));
                                    }}
                                    className="w-full h-14 rounded-[1.25rem] border-2 border-dashed border-[var(--color-outline-variant)]/20 flex items-center justify-center gap-3 text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] transition-all font-bold"
                                >
                                    <Plus size={20} />
                                    Add option
                                </button>
                            </div>
                        </div>

                        {/* Variants Section */}
                        <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
                                        <Package size={20} />
                                    </div>
                                    Variants
                                </h3>
                                {(formData.options?.length || 0) > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (!formData.options?.length) return;
                                            // Generate combinations
                                            const generateCombinations = (options: ProductOption[], current: { optionId: string; value: string }[] = []): { optionId: string; value: string }[][] => {
                                                if (options.length === 0) return [current];
                                                const [first, ...rest] = options;
                                                return first.values.flatMap((val: string) =>
                                                    generateCombinations(rest, [...current, { optionId: first.id, value: val }])
                                                );
                                            };
                                            const combos = generateCombinations(formData.options);
                                            const newVariants = combos.map(combo => ({
                                                id: Math.random().toString(36).substr(2, 9),
                                                name: combo.map(c => c.value).join(" / "),
                                                price: formData.price,
                                                quantity: formData.quantity,
                                                optionValues: combo
                                            }));
                                            setFormData(p => ({ ...p, variants: newVariants }));
                                        }}
                                        className="h-10 px-6 rounded-xl text-xs font-black uppercase tracking-widest border-pink-500/20 text-pink-600 hover:bg-pink-500/5"
                                    >
                                        Generate from Options
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {formData.variants?.map((variant, vIdx) => {
                                    const isExpanded = expandedVariants.includes(variant.id);
                                    return (
                                        <div key={variant.id} className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 rounded-[2rem] overflow-hidden transition-all shadow-sm">
                                            {/* Variant Header */}
                                            <div className="p-6 flex items-center justify-between border-b border-[var(--color-outline-variant)]/5">
                                                <div className="font-black text-lg">Variant {vIdx + 1}</div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, variants: p.variants?.filter((_, i) => i !== vIdx) }))}
                                                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                {/* Variant Name */}
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Name"
                                                        value={variant.name}
                                                        onChange={e => {
                                                            const newVariants = [...(formData.variants || [])];
                                                            newVariants[vIdx].name = e.target.value;
                                                            setFormData(p => ({ ...p, variants: newVariants }));
                                                        }}
                                                        className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold outline-none focus:border-[var(--color-primary)]/30"
                                                    />
                                                </div>

                                                {isExpanded && (
                                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                                        {/* Price & Original Price */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-1">Price</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-30">{formData.currency || "KES"}</span>
                                                                    <input
                                                                        type="number"
                                                                        value={variant.price || 0}
                                                                        onChange={e => {
                                                                            const newVariants = [...(formData.variants || [])];
                                                                            newVariants[vIdx].price = parseFloat(e.target.value);
                                                                            setFormData(p => ({ ...p, variants: newVariants }));
                                                                        }}
                                                                        className="w-full h-14 pl-14 pr-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold outline-none"
                                                                    />
                                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col opacity-20">
                                                                        <ChevronUp size={14} />
                                                                        <ChevronDown size={14} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-1">Original price</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-30">{formData.currency || "KES"}</span>
                                                                    <input
                                                                        type="number"
                                                                        value={variant.compareAtPrice || 0}
                                                                        onChange={e => {
                                                                            const newVariants = [...(formData.variants || [])];
                                                                            newVariants[vIdx].compareAtPrice = parseFloat(e.target.value);
                                                                            setFormData(p => ({ ...p, variants: newVariants }));
                                                                        }}
                                                                        className="w-full h-14 pl-14 pr-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold outline-none"
                                                                    />
                                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col opacity-20">
                                                                        <ChevronUp size={14} />
                                                                        <ChevronDown size={14} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* SKU & Weight */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-1">SKU</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="SKU"
                                                                    value={variant.sku || ""}
                                                                    onChange={e => {
                                                                        const newVariants = [...(formData.variants || [])];
                                                                        newVariants[vIdx].sku = e.target.value;
                                                                        setFormData(p => ({ ...p, variants: newVariants }));
                                                                    }}
                                                                    className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold outline-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-1">Weight</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Weight"
                                                                        value={variant.weight || ""}
                                                                        onChange={e => {
                                                                            const newVariants = [...(formData.variants || [])];
                                                                            newVariants[vIdx].weight = parseFloat(e.target.value);
                                                                            setFormData(p => ({ ...p, variants: newVariants }));
                                                                        }}
                                                                        className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold outline-none"
                                                                    />
                                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold opacity-30">g</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Inventory & Availability Sub-section */}
                                                        <div className="space-y-4 pt-4 border-t border-[var(--color-outline-variant)]/5">
                                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Availability & Inventory</div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                                                                <Switch
                                                                    label="Visibility"
                                                                    checked={variant.visibility ?? true}
                                                                    onChange={v => {
                                                                        const newVariants = [...(formData.variants || [])];
                                                                        newVariants[vIdx].visibility = v;
                                                                        setFormData(p => ({ ...p, variants: newVariants }));
                                                                    }}
                                                                />
                                                                <Switch
                                                                    label="Mark as sold out"
                                                                    checked={variant.isSoldOut || false}
                                                                    onChange={v => {
                                                                        const newVariants = [...(formData.variants || [])];
                                                                        newVariants[vIdx].isSoldOut = v;
                                                                        setFormData(p => ({ ...p, variants: newVariants }));
                                                                    }}
                                                                />
                                                                <Switch
                                                                    label="Track quantity"
                                                                    checked={variant.trackQuantity || false}
                                                                    onChange={v => {
                                                                        const newVariants = [...(formData.variants || [])];
                                                                        newVariants[vIdx].trackQuantity = v;
                                                                        setFormData(p => ({ ...p, variants: newVariants }));
                                                                    }}
                                                                />
                                                                {variant.trackQuantity && (
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-black opacity-30">Stock quantity</label>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="0"
                                                                            value={variant.quantity || ""}
                                                                            onChange={e => {
                                                                                const newVariants = [...(formData.variants || [])];
                                                                                newVariants[vIdx].quantity = parseInt(e.target.value);
                                                                                setFormData(p => ({ ...p, variants: newVariants }));
                                                                            }}
                                                                            className="w-full h-10 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-xs font-bold outline-none"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <Switch
                                                                    label="Scheduled launch"
                                                                    checked={variant.scheduledLaunch || false}
                                                                    onChange={v => {
                                                                        const newVariants = [...(formData.variants || [])];
                                                                        newVariants[vIdx].scheduledLaunch = v;
                                                                        setFormData(p => ({ ...p, variants: newVariants }));
                                                                    }}
                                                                />
                                                                {variant.scheduledLaunch && (
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-black opacity-30">Launch date</label>
                                                                        <input
                                                                            type="datetime-local"
                                                                            value={variant.scheduledDate || ""}
                                                                            onChange={e => {
                                                                                const newVariants = [...(formData.variants || [])];
                                                                                newVariants[vIdx].scheduledDate = e.target.value;
                                                                                setFormData(p => ({ ...p, variants: newVariants }));
                                                                            }}
                                                                            className="w-full h-10 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-xs font-bold outline-none"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <Switch
                                                                    label="Daily capacity"
                                                                    checked={variant.dailyCapacityEnabled || false}
                                                                    onChange={v => {
                                                                        const newVariants = [...(formData.variants || [])];
                                                                        newVariants[vIdx].dailyCapacityEnabled = v;
                                                                        setFormData(p => ({ ...p, variants: newVariants }));
                                                                    }}
                                                                />
                                                                {variant.dailyCapacityEnabled && (
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-black opacity-30">Daily Items</label>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="0"
                                                                            value={variant.dailyCapacity || ""}
                                                                            onChange={e => {
                                                                                const newVariants = [...(formData.variants || [])];
                                                                                newVariants[vIdx].dailyCapacity = parseInt(e.target.value);
                                                                                setFormData(p => ({ ...p, variants: newVariants }));
                                                                            }}
                                                                            className="w-full h-10 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-xs font-bold outline-none"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <Switch
                                                                    label="Max order quantity"
                                                                    checked={variant.maxOrderQuantityEnabled || false}
                                                                    onChange={v => {
                                                                        const newVariants = [...(formData.variants || [])];
                                                                        newVariants[vIdx].maxOrderQuantityEnabled = v;
                                                                        setFormData(p => ({ ...p, variants: newVariants }));
                                                                    }}
                                                                />
                                                                {variant.maxOrderQuantityEnabled && (
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-black opacity-30">Max per order</label>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="0"
                                                                            value={variant.maxOrderQuantity || ""}
                                                                            onChange={e => {
                                                                                const newVariants = [...(formData.variants || [])];
                                                                                newVariants[vIdx].maxOrderQuantity = parseInt(e.target.value);
                                                                                setFormData(p => ({ ...p, variants: newVariants }));
                                                                            }}
                                                                            className="w-full h-10 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-xs font-bold outline-none"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <Switch
                                                                    label="Min order quantity"
                                                                    checked={variant.minOrderQuantityEnabled || false}
                                                                    onChange={v => {
                                                                        const newVariants = [...(formData.variants || [])];
                                                                        newVariants[vIdx].minOrderQuantityEnabled = v;
                                                                        setFormData(p => ({ ...p, variants: newVariants }));
                                                                    }}
                                                                />
                                                                {variant.minOrderQuantityEnabled && (
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-black opacity-30">Min per order</label>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="0"
                                                                            value={variant.minOrderQuantity || ""}
                                                                            onChange={e => {
                                                                                const newVariants = [...(formData.variants || [])];
                                                                                newVariants[vIdx].minOrderQuantity = parseInt(e.target.value);
                                                                                setFormData(p => ({ ...p, variants: newVariants }));
                                                                            }}
                                                                            className="w-full h-10 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-xs font-bold outline-none"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Image Upload Area */}
                                                        <div className="space-y-4">
                                                            <div
                                                                className={cn(
                                                                    "relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 group/vupload transition-all cursor-pointer overflow-hidden",
                                                                    variant.image ? "border-transparent shadow-md" : "border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/5"
                                                                )}
                                                            >
                                                                {variant.image ? (
                                                                    <>
                                                                        <img src={variant.image} alt="Variant" className="absolute inset-0 w-full h-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/vupload:opacity-100 transition-all duration-300 backdrop-blur-sm gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setEditingImage({ url: "NEW_UPLOAD", index: { variantIdx: vIdx } })}
                                                                                className="p-2 rounded-lg bg-white text-black hover:scale-110 transition-transform"
                                                                                title="Replace"
                                                                            >
                                                                                <Upload size={16} />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setEditingImage({ url: variant.image!, index: { variantIdx: vIdx } })}
                                                                                className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:scale-110 transition-transform"
                                                                                title="Edit"
                                                                            >
                                                                                <Edit2 size={16} />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newVariants = [...(formData.variants || [])];
                                                                                    newVariants[vIdx].image = undefined;
                                                                                    setFormData(p => ({ ...p, variants: newVariants }));
                                                                                }}
                                                                                className="p-2 rounded-lg bg-red-500 text-white hover:scale-110 transition-transform"
                                                                                title="Remove"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div
                                                                        className="flex flex-col items-center gap-2 w-full h-full justify-center"
                                                                        onClick={() => setEditingImage({ url: "NEW_UPLOAD", index: { variantIdx: vIdx } })}
                                                                    >
                                                                        <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-on-surface-variant)] group-hover/vupload:scale-110 transition-transform">
                                                                            <ImageIcon size={20} />
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <div className="text-sm font-bold">Upload Photo</div>
                                                                            <div className="text-[10px] opacity-40 mt-0.5 font-medium px-4">4:3 Ratio Recommended</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => setEditingImage({ url: "NEW_UPLOAD", index: { variantIdx: vIdx } })}
                                                                className="h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest border-[var(--color-outline-variant)]/20 flex items-center gap-2"
                                                            >
                                                                <Sparkles size={14} />
                                                                Generate image
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Show More/Less Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setExpandedVariants(prev =>
                                                        prev.includes(variant.id)
                                                            ? prev.filter(id => id !== variant.id)
                                                            : [...prev, variant.id]
                                                    );
                                                }}
                                                className="w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-[var(--color-surface-container-high)]/30 border-t border-[var(--color-outline-variant)]/5 transition-all"
                                            >
                                                {isExpanded ? (
                                                    <>Show less <ChevronUp size={14} /></>
                                                ) : (
                                                    <>Show more <ChevronDown size={14} /></>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const id = Math.random().toString(36).substr(2, 9);
                                            const newVariant = { id, name: "New Variant", optionValues: [] };
                                            setFormData(p => ({ ...p, variants: [...(p.variants || []), newVariant] }));
                                            setExpandedVariants(prev => [...prev, id]);
                                        }}
                                        className="h-14 rounded-2xl border border-[var(--color-outline-variant)]/20 flex items-center justify-center gap-3 text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] transition-all font-bold text-sm bg-white shadow-sm"
                                    >
                                        <Plus size={20} />
                                        Add variant
                                    </button>
                                    <button
                                        type="button"
                                        className="h-14 rounded-2xl border border-[var(--color-outline-variant)]/20 flex items-center justify-center gap-3 text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] transition-all font-bold text-sm bg-white shadow-sm"
                                    >
                                        <ArrowUpDown size={18} />
                                        Change variant sequence
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* Schema.org Section */}
                        <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[var(--radius-m3-m)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-xl">SEO & Identification</h3>
                                            <button
                                                onClick={() => openHelp('seoDashboard' as any, calculateSEOHealth())}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 group/seo"
                                                title="View SEO Health Analysis"
                                            >
                                                <Target size={14} className="group-hover/seo:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{calculateSEOHealth().score}% Health</span>
                                                <HelpCircle size={14} className="opacity-40" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-[var(--color-on-surface-variant)] opacity-60 mt-0.5 font-medium tracking-wide italic">Verified Schema.org Data Structures</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={e => setFormData(p => ({ ...p, featured: e.target.checked }))}
                                                className="peer appearance-none w-6 h-6 rounded-lg border-2 border-[var(--color-outline-variant)]/30 checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all cursor-pointer"
                                            />
                                            <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">Featured</span>
                                            <span className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50 font-medium">Show on Home</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-30 px-1 flex items-center">Brand <HelpIcon topic="productIdentification" /></label>
                                    <input
                                        type="text"
                                        placeholder="Manufacturer"
                                        value={formData.brand}
                                        onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
                                        className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-30 px-1 flex items-center">Barcode (GTIN) <HelpIcon topic="gtin" /></label>
                                    <input
                                        type="text"
                                        placeholder="Unique Identifier"
                                        value={formData.gtin}
                                        onChange={e => setFormData(p => ({ ...p, gtin: e.target.value }))}
                                        className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-30 px-1">Custom URL Slug <HelpIcon topic="gtin" /></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[10px] font-bold opacity-30">/products/</div>
                                        <input
                                            type="text"
                                            placeholder="my-cool-product"
                                            value={formData.productSlug}
                                            onChange={e => setFormData(p => ({ ...p, productSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                            className="w-full h-[52px] pl-20 pr-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-xs font-bold opacity-30 px-1">Search Engine Meta Title</label>
                                    <input
                                        type="text"
                                        placeholder="SEO optimized title (e.g., Buy Best [Product] Online)"
                                        value={formData.metaTitle}
                                        onChange={e => setFormData(p => ({ ...p, metaTitle: e.target.value }))}
                                        className="w-full h-[52px] px-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-xs font-bold opacity-30 px-1">Search Engine Meta Description</label>
                                    <textarea
                                        placeholder="A short summary that appears in search results..."
                                        value={formData.metaDescription}
                                        onChange={e => setFormData(p => ({ ...p, metaDescription: e.target.value }))}
                                        className="w-full h-32 p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 outline-none focus:border-[var(--color-primary)] font-medium transition-all text-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bundle Section */}
                        <div className="bg-[var(--color-surface-container-low)] mt-8 rounded-[var(--radius-m3-xl)] p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[var(--radius-m3-m)] bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl">Bundle Content</h3>
                                        <p className="text-xs text-[var(--color-on-surface-variant)] opacity-60 mt-0.5 font-medium tracking-wide">Add individual items or services included in this package.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({
                                        ...p,
                                        bundleItems: [...(p.bundleItems || []), { id: Date.now().toString(), name: "", type: "product", quantity: 1 }]
                                    }))}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-primary)] text-white text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--color-primary)]/20"
                                >
                                    <Plus size={18} /> Add Component
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.bundleItems?.map((item, idx) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-5 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/15 group/bundle shadow-sm">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Included Item Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 5kVA Inverter"
                                                value={item.name}
                                                onChange={e => {
                                                    const newItems = [...(formData.bundleItems || [])];
                                                    newItems[idx].name = e.target.value;
                                                    setFormData(p => ({ ...p, bundleItems: newItems }));
                                                }}
                                                className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold outline-none focus:border-[var(--color-primary)]/30 transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-full sm:w-36 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Type</label>
                                                <div className="relative">
                                                    <select
                                                        value={item.type}
                                                        onChange={e => {
                                                            const newItems = [...(formData.bundleItems || [])];
                                                            newItems[idx].type = e.target.value as 'product' | 'service' | 'addon';
                                                            setFormData(p => ({ ...p, bundleItems: newItems }));
                                                        }}
                                                        className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-[var(--color-primary)]/30 transition-all"
                                                    >
                                                        <option value="product">Product</option>
                                                        <option value="service">Service</option>
                                                        <option value="addon">Add-on</option>
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="w-24 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1 text-center block">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => {
                                                        const newItems = [...(formData.bundleItems || [])];
                                                        newItems[idx].quantity = parseInt(e.target.value);
                                                        setFormData(p => ({ ...p, bundleItems: newItems }));
                                                    }}
                                                    className="w-full h-14 px-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-sm font-bold outline-none text-center focus:border-[var(--color-primary)]/30 transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newItems = [...(formData.bundleItems || [])];
                                                    newItems.splice(idx, 1);
                                                    setFormData(p => ({ ...p, bundleItems: newItems }));
                                                }}
                                                className="self-end mb-1 p-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!formData.bundleItems || formData.bundleItems.length === 0) && (
                                    <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-outline-variant)]/10 rounded-[2.5rem] opacity-30 gap-4 bg-[var(--color-surface-container-low)]/50">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner">
                                            <Layers size={32} strokeWidth={1} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black uppercase tracking-widest">No components added</p>
                                            <p className="text-xs font-medium">Bundles let users see exactly what they get</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="bg-[var(--color-surface-container-low)] mt-8 rounded-[var(--radius-m3-xl)] p-6 sm:p-8 border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-[var(--radius-m3-m)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                                    <ImageIcon size={20} />
                                </div>
                                <h3 className="font-bold text-xl">Product Appearance & Photos</h3>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div
                                    className={cn(
                                        "relative h-64 md:h-80 rounded-[var(--radius-m3-xl)] border-2 border-dashed flex flex-col items-center justify-center bg-[var(--color-surface)] transition-all overflow-hidden group/upload",
                                        formData.images?.[0] ? "border-transparent shadow-xl" : "border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary)]/50"
                                    )}
                                >
                                    {formData.images?.[0] ? (
                                        <>
                                            <img src={formData.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-all duration-300 backdrop-blur-sm gap-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingImage({ url: "NEW_UPLOAD", index: 0 })}
                                                        className="px-6 py-3 rounded-[var(--radius-m3-l)] bg-white text-black font-bold flex items-center gap-2 shadow-[var(--shadow-m3-3)] active:scale-95 transition-transform"
                                                    >
                                                        <Upload size={18} /> Replace
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingImage({ url: formData.images?.[0] || "", index: 0 })}
                                                        className="px-6 py-3 rounded-[var(--radius-m3-l)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold flex items-center gap-2 shadow-[var(--shadow-m3-3)] active:scale-95 transition-transform"
                                                    >
                                                        <Edit2 size={18} /> Edit
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => analyzeImageWithAi(formData.images?.[0] || "")}
                                                    disabled={isAiAnalyzing}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-all backdrop-blur-md"
                                                >
                                                    {isAiAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                                    Magic Autofill
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = [...(formData.images || [])];
                                                        newImages.splice(0, 1);
                                                        setFormData(p => ({ ...p, images: newImages, image: newImages[0] || "" }));
                                                    }}
                                                    className="text-xs font-bold text-white/70 hover:text-white underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setEditingImage({ url: "NEW_UPLOAD", index: "NEW" })}
                                            disabled={uploading}
                                            className="flex flex-col items-center gap-4 text-[var(--color-on-surface-variant)] p-8 w-full h-full"
                                        >
                                            <div className="w-20 h-20 rounded-[var(--radius-m3-xl)] bg-[var(--color-surface-container-high)] flex items-center justify-center mb-2 shadow-inner group-hover/upload:scale-110 transition-transform">
                                                {uploading ? <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" /> : <Upload size={32} className="opacity-40" />}
                                            </div>
                                            <div className="text-center">
                                                <span className="block font-bold text-lg">Upload Primary Photo</span>
                                                <span className="text-[11px] opacity-50 font-medium tracking-wide">JPG, PNG or WEBP · 4:3 Ratio</span>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Primary Image Alt Text */}
                                {formData.images?.[0] && (
                                    <div className="px-1 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Image Meta Label (Alt Text)</label>
                                        <input
                                            type="text"
                                            placeholder="Describe this image for Google Search accessibility..."
                                            value={formData.imageAltTexts?.[0] || ""}
                                            onChange={e => {
                                                const newAlts = [...(formData.imageAltTexts || [])];
                                                newAlts[0] = e.target.value;
                                                setFormData(p => ({ ...p, imageAltTexts: newAlts }));
                                            }}
                                            className="w-full h-11 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 outline-none focus:border-[var(--color-primary)] font-medium text-xs transition-all"
                                        />
                                    </div>
                                )}

                                {/* Thumbnail Gallery */}
                                {formData.images && formData.images.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-none w-full border-t border-[var(--color-outline-variant)]/10">
                                        {formData.images.slice(1).map((img, idx) => {
                                            const actualIndex = idx + 1;
                                            return (
                                                <div key={actualIndex} className="relative w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden border border-[var(--color-outline-variant)]/20 group/thumb">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm p-1">
                                                        <div className="flex gap-1.5">
                                                            <button type="button" onClick={() => setEditingImage({ url: "NEW_UPLOAD", index: actualIndex })} className="p-1.5 rounded-lg bg-white text-black hover:scale-110 transition-transform"><Upload size={14} /></button>
                                                            <button type="button" onClick={() => setEditingImage({ url: img, index: actualIndex })} className="p-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:scale-110 transition-transform"><Edit2 size={14} /></button>
                                                        </div>
                                                        <div className="flex gap-1 w-full justify-between items-center px-2">
                                                            <button type="button" onClick={() => {
                                                                const newImages = [...(formData.images || [])];
                                                                const temp = newImages[0];
                                                                newImages[0] = newImages[actualIndex];
                                                                newImages[actualIndex] = temp;
                                                                setFormData(p => ({ ...p, images: newImages, image: newImages[0] }));
                                                            }} className="text-[10px] font-bold text-white hover:underline whitespace-nowrap">Make Primary</button>
                                                            <button type="button" onClick={() => {
                                                                const newImages = [...(formData.images || [])];
                                                                newImages.splice(actualIndex, 1);
                                                                setFormData(p => ({ ...p, images: newImages }));
                                                            }} className="p-1 rounded-md text-red-400 hover:bg-red-400/20"><X size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => setEditingImage({ url: "NEW_UPLOAD", index: "NEW" })}
                                            className="w-24 h-24 rounded-2xl flex-shrink-0 border-2 border-dashed border-[var(--color-outline-variant)]/30 flex flex-col items-center justify-center text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] transition-colors"
                                        >
                                            <Plus size={24} />
                                            <span className="text-[10px] font-bold mt-2">Add Photo</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Fixed Footer for Mobile / Bottom Actions for Desktop */}
                        <div className={cn(
                            "p-4 sm:p-0 sm:relative bg-[var(--color-surface)]/80 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-[var(--color-outline-variant)]/10 sm:border-0 z-40",
                            hideHeader ? "sticky bottom-0 -mx-7 -mb-6 px-7 py-4" : "fixed bottom-0 left-0 right-0"
                        )}>
                            <div className="max-w-4xl mx-auto flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onCancel ? onCancel() : router.back()}
                                    className={cn(
                                        "h-14 px-8 rounded-[var(--radius-m3-xl)] font-bold flex-1 shadow-[var(--shadow-m3-1)]",
                                        !hideHeader && "hidden sm:flex"
                                    )}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-14 flex-[2] rounded-[var(--radius-m3-xl)] font-bold gap-3 shadow-[var(--shadow-m3-3)] active:scale-[0.98] transition-all bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                                >
                                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                    <span className="text-lg">{initialData ? "Apply changes" : "Create product"}</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {editingImage && (
                        <ImageEditor
                            imageUrl={editingImage.url}
                            onClose={() => setEditingImage(null)}
                            onSave={async (newUrl) => {
                                const idx = editingImage.index;
                                setEditingImage(null);
                                if (typeof idx === 'object' && idx !== null && 'variantIdx' in idx) {
                                    await uploadVariantImage(newUrl, idx.variantIdx);
                                } else {
                                    await uploadFinalImage(newUrl, idx as number | "NEW");
                                }
                            }}
                            targetLayout="product"
                        />
                    )}

                    <CategorySheet
                        open={isCategorySheetOpen}
                        onClose={() => setIsCategorySheetOpen(false)}
                    />

                    <CategorySelectorSheet
                        open={isCategorySelectorOpen}
                        onClose={() => setIsCategorySelectorOpen(false)}
                        selectedId={formData.category}
                        onSelect={(id) => setFormData(p => ({ ...p, category: id }))}
                        onOpenManage={() => {
                            setIsCategorySelectorOpen(false);
                            setIsCategorySheetOpen(true);
                        }}
                    />
                </div>
            </div>
            {/* AI Import Sheet */}
            <AiImportSheet
                open={isAiImportSheetOpen}
                onClose={() => setIsAiImportSheetOpen(false)}
                onApply={handleApplyImportedData}
            />

            <AiDescriptionSheet
                open={isAiDescriptionSheetOpen}
                onClose={() => setIsAiDescriptionSheetOpen(false)}
                onApply={(description) => setFormData(prev => ({ ...prev, description }))}
                initialData={{
                    name: formData.name || "",
                    brand: formData.brand || "",
                    description: formData.description || ""
                }}
            />
        </form>
    );
}
