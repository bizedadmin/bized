"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export type ProductType = "Physical" | "Digital" | "Booking" | "Subscription" | "Others";

export interface BundleItem {
    id: string;
    name: string;
    type: 'product' | 'service' | 'addon';
    quantity: number;
    description?: string;
    image?: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    price?: number;
    compareAtPrice?: number;
    sku?: string;
    weight?: number;
    quantity?: number;
    image?: string;
    visibility?: boolean;
    isSoldOut?: boolean;
    scheduledLaunch?: boolean;
    scheduledDate?: string;
    trackQuantity?: boolean;
    dailyCapacityEnabled?: boolean;
    dailyCapacity?: number;
    maxOrderQuantityEnabled?: boolean;
    maxOrderQuantity?: number;
    minOrderQuantityEnabled?: boolean;
    minOrderQuantity?: number;
    optionValues: {
        optionId: string;
        value: string;
    }[];
}

export interface ProductOption {
    id: string;
    name: string;
    values: string[];
}

export interface ProductItem {
    id: string;
    type?: ProductType;
    name: string;
    description?: string;
    image?: string;
    images?: string[];
    price?: number;
    compareAtPrice?: number;
    currency?: string;
    sku?: string;
    gtin?: string; // Global Trade Item Number
    brand?: string;
    category?: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
    featured?: boolean;
    weight?: number;
    downloadLink?: string;
    bookingType?: string;
    rentalPricing?: string; // Hourly, Daily, Monthly, Quarterly, Annually
    deliveryIntervals?: string[];
    deliveryCount?: string[];
    taxRateId?: string; // Links to a specific TaxRate in the Business
    // SEO & Advanced Metadata
    metaTitle?: string;
    metaDescription?: string;
    productSlug?: string;
    condition?: "New" | "Used" | "Refurbished";
    material?: string;
    color?: string;
    imageAltTexts?: string[]; // Maps to images array
    // New Fields from Image
    visibility?: boolean;
    isSoldOut?: boolean;
    scheduledLaunch?: boolean;
    scheduledDate?: string;
    trackQuantity?: boolean;
    quantity?: number;
    dailyCapacityEnabled?: boolean;
    dailyCapacity?: number;
    maxOrderQuantityEnabled?: boolean;
    maxOrderQuantity?: number;
    minOrderQuantityEnabled?: boolean;
    minOrderQuantity?: number;
    tags?: string[];
    variants?: ProductVariant[];
    options?: ProductOption[];
    bundleItems?: BundleItem[];
}

export interface ServiceItem {
    id: string;
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    areaServed?: string;
}

export interface ReviewItem {
    id: string;
    author: string;
    rating: number;
    body: string;
    datePublished?: string;
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    parentId?: string; // ID of the parent category, if this is a subcategory
}

export interface TaxRate {
    id: string;
    name: string;
    rate: number;
    isDefault?: boolean;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "Owner" | "Admin" | "Staff";
    status: "Active" | "Pending";
    avatar?: string;
    lastActive?: string;
    invitedAt?: string;
}

export interface Business {
    _id: string;
    name: string;
    slug: string;
    industry: string;
    businessType: string;
    ownerId: string;
    status: string;
    title?: string;
    subtitle?: string;
    description?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    country?: string;
    locationAreas?: string;
    openingHours?: string;
    facilities?: string;
    about?: string;
    socialLinks?: {
        whatsapp?: string;
        whatsappMessage?: string;
        whatsappTemplates?: {
            home?: string;
            shop?: string;
            product?: string;
            booking?: string;
            order?: string;
        };
        whatsappSettings?: {
            floatingButtonEnabled?: boolean;
            floatingButtonPosition?: 'bottom-right' | 'bottom-left' | 'right-middle' | 'left-middle';
            floatingButtonTooltip?: string;
            floatingButtonStyle?: 'circle-solid' | 'circle-regular' | 'square-solid' | 'square-regular';
            floatingButtonSize?: number;
            floatingButtonLabel?: string;
            useSchedule?: boolean;
            hideWhenClosed?: boolean;
        };
        instagram?: string;
        facebook?: string;
        google?: string;
    };
    logoUrl?: string;
    coverPhotoUrl?: string;
    themeColor?: string;
    secondaryColor?: string;
    currency?: string;
    dateFormat?: string;
    numberFormat?: string;
    taxes?: TaxRate[];
    privacyPolicyUrl?: string;
    termsUrl?: string;
    footerText?: string;
    productCategories?: (string | ProductCategory)[];
    products?: ProductItem[];
    services?: ServiceItem[];
    reviews?: ReviewItem[];
    faq?: FAQItem[];
    teamMembers?: TeamMember[];
    aiConfig?: {
        provider?: "openai" | "google";
        openaiApiKey?: string;
        googleApiKey?: string;
        model?: string;
        systemPrompt?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface BusinessContextType {
    businesses: Business[];
    currentBusiness: Business | null;
    isLoading: boolean;
    setCurrentBusiness: (id: string) => void;
    updateBusiness: (fields: Partial<Business>) => Promise<boolean>;
    refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEY = "bized_current_business_id";

export function BusinessProvider({ children }: { children: React.ReactNode }) {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBusinesses = useCallback(async () => {
        try {
            const res = await fetch("/api/stores");
            if (!res.ok) return;
            const data = await res.json();
            setBusinesses(data.stores || []);
            return data.stores || [];
        } catch (err) {
            console.error("Failed to fetch businesses:", err);
            return [];
        }
    }, []);

    const { data: session, status } = useSession();

    // Initial load & Session change
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (status === "loading") return;

            if (status === "unauthenticated") {
                setBusinesses([]);
                setCurrentBusinessState(null);
                setIsLoading(false);
                return;
            }

            const stores = await fetchBusinesses();
            if (!mounted) return;

            if (!stores?.length) {
                setIsLoading(false);
                return;
            }

            // Restore last selected business from localStorage
            const savedId = localStorage.getItem(STORAGE_KEY);
            const restored = stores.find((s: Business) => s._id === savedId);
            setCurrentBusinessState(restored || stores[0]);
            setIsLoading(false);
        })();
        return () => { mounted = false; };
    }, [fetchBusinesses, status]);

    const setCurrentBusiness = useCallback((id: string) => {
        const found = businesses.find((b) => b._id === id);
        if (found) {
            setCurrentBusinessState(found);
            localStorage.setItem(STORAGE_KEY, id);
        }
    }, [businesses]);

    const updateBusiness = useCallback(async (fields: Partial<Business>): Promise<boolean> => {
        if (!currentBusiness) return false;
        try {
            const res = await fetch(`/api/stores/${currentBusiness._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields),
            });
            if (!res.ok) return false;
            const data = await res.json();
            const updated = data.store as Business;

            // Update local state optimistically
            setCurrentBusinessState(updated);
            setBusinesses((prev) =>
                prev.map((b) => (b._id === updated._id ? updated : b))
            );
            return true;
        } catch (err) {
            console.error("Failed to update business:", err);
            return false;
        }
    }, [currentBusiness]);

    const refreshBusinesses = useCallback(async () => {
        const stores = await fetchBusinesses();
        if (currentBusiness && stores) {
            const refreshed = stores.find((s: Business) => s._id === currentBusiness._id);
            if (refreshed) setCurrentBusinessState(refreshed);
        }
    }, [fetchBusinesses, currentBusiness]);

    return (
        <BusinessContext.Provider
            value={{
                businesses,
                currentBusiness,
                isLoading,
                setCurrentBusiness,
                updateBusiness,
                refreshBusinesses,
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    const ctx = useContext(BusinessContext);
    if (!ctx) throw new Error("useBusiness must be used within BusinessProvider");
    return ctx;
}
