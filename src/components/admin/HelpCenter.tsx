"use client";

import React, { createContext, useContext, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { HelpCircle, Info } from "lucide-react";

export const HELP_CONTENT = {
    price: {
        title: "Price",
        description: "This is the actual selling price of the product that the customer will pay. If a customer adds this item to their cart today, this is the amount they will be charged."
    },
    compareAtPrice: {
        title: "Original price (Compare-at price)",
        description: "This is the 'before' price. Put a higher original price here to show a product as being on sale. Most storefronts will cross out this original price (e.g., ~1,000~ 850) to emphasize the discount."
    },
    estimatedPrice: {
        title: "Display as estimated price",
        description: "Turn this on if the exact price isn't known until the customer finalizes the details (e.g., custom furniture, catering). It adds a label like 'Estimated' or 'Starting at' next to the price."
    },
    costPerItem: {
        title: "Cost per item",
        description: "This is for your internal profit tracking. It's what you paid to acquire or manufacture the product. Customers never see this number."
    },
    pricePerUnit: {
        title: "Price per unit",
        description: "Used for groceries, liquids, or bulk items. If you sell a 5-liter bottle for 2,000, you can display '400 per liter' underneath the main price to help customers compare."
    },
    taxOverride: {
        title: "Tax override",
        description: "By default, your store applies a standard regional tax rate. Check this to specify a unique tax rule just for this product (e.g., tax-exempt items)."
    },
    productType: {
        title: "Product Type",
        description: "Choose 'Physical' for goods that need shipping, 'Digital' for downloadable files, 'Booking' for services or rentals, or 'Subscription' for recurring deliveries."
    },
    sku: {
        title: "SKU (Stock Keeping Unit)",
        description: "A unique internal code you use to track this specific item in your inventory."
    },
    gtin: {
        title: "GTIN / Barcode",
        description: "Global Trade Item Number, such as UPC, EAN, or ISBN. Used for Google Shopping and external marketplaces."
    },
    weight: {
        title: "Weight",
        description: "The physical weight of the product, typically used for calculating shipping rates or logistics."
    },
    deliveryIntervals: {
        title: "Delivery Intervals",
        description: "Allows customers to choose how often they want to receive the subscription product."
    },
    deliveryCount: {
        title: "Number of deliveries",
        description: "Limits the total amount of subscription cycles before it ends. Useful for prepaid plans."
    },
    storeName: {
        title: "Store Name",
        description: "The public name of your business as it will appear on your storefront, invoices, and customer emails."
    },
    businessIndustry: {
        title: "Business Industry",
        description: "Helps us customize the platform experience and suggestions based on your specific sector (e.g., Retail, Food & Beverage)."
    },
    supportEmail: {
        title: "Support Email",
        description: "The email address customers can use to contact you. This will be displayed on your 'Contact Us' page."
    },
    supportPhone: {
        title: "Support Phone",
        description: "The phone number for customer inquiries. Make sure to include the country code for international reach."
    },
    physicalAddress: {
        title: "Physical Address",
        description: "The location of your office or storefront. This helps with local SEO and establishes trust with your customers."
    },
    whatsappNumber: {
        title: "WhatsApp Number",
        description: "The primary number for your WhatsApp catalog. Customers will be able to start a chat with you directly from the storefront."
    },
    storeLogo: {
        title: "Store Logo",
        description: "Your brand's visual identity. We recommend a square PNG or SVG with a transparent background for the best look."
    },
    primaryColor: {
        title: "Primary Color",
        description: "The main accent color for your storefront. This will be applied to buttons, links, and key UI elements."
    },
    businessCountry: {
        title: "Business Country",
        description: "Your primary operating location. This setting automatically adjusts tax calculations and currency defaults."
    },
    storeCurrency: {
        title: "Store Currency",
        description: "The currency in which your products are priced and transactions are processed."
    },
    dateFormat: {
        title: "Date Format",
        description: "How dates are displayed across your admin panel and customer-facing pages (e.g., DD/MM/YYYY vs MM/DD/YYYY)."
    },
    taxRates: {
        title: "Tax Rates",
        description: "Configure the VAT, GST, or Sales Tax applicable to your products. You can have multiple rates for different product categories."
    },
    aiProvider: {
        title: "AI Provider",
        description: "Choose the artificial intelligence engine that powers your assistant (e.g., OpenAI or Google Gemini)."
    },
    seoDashboard: {
        title: "SEO Health Dashboard",
        description: "Your product's search engine optimization score based on real-time analysis of titles, descriptions, images, and identification data."
    },
    seoMetaTitle: {
        title: "SEO Meta Title",
        description: "This is the 'headline' that appears in Google search results. A strong title includes your main product keywords and your brand name. Aim for 50-60 characters."
    },
    seoMetaDescription: {
        title: "SEO Meta Description",
        description: "The summary text below your title in Google search. It should clearly explain what the product is and include a 'call to action' to encourage clicks. Aim for 120-160 characters."
    },
    productSlug: {
        title: "Product URL Slug",
        description: "The part of the web address that identifies this specific product (e.g., /products/leather-jacket). Keep it short, use hyphens between words, and include your main keywords."
    },
    imageAltText: {
        title: "Image Alt Text",
        description: "A text description of your image. This helps visually impaired users and allows Google Image Search to understand and index your photos, bringing more traffic to your store."
    },
    productIdentification: {
        title: "Product Identification",
        description: "Providing a clear Brand and GTIN (Barcode) is essential for Google Shopping, Amazon, and other marketplaces. It helps search engines verify that your product is authentic."
    }
} as const;

export type HelpKey = keyof typeof HELP_CONTENT;

interface HelpCenterContextType {
    openHelp: (key: HelpKey, data?: any) => void;
    helpData: any;
}

const HelpCenterContext = createContext<HelpCenterContextType | undefined>(undefined);

export function HelpCenterProvider({ children }: { children: React.ReactNode }) {
    const [openKey, setOpenKey] = useState<HelpKey | null>(null);
    const [helpData, setHelpData] = useState<any>(null);

    const openHelp = (key: HelpKey, data?: any) => {
        setOpenKey(key);
        setHelpData(data);
    };

    return (
        <HelpCenterContext.Provider value={{ openHelp, helpData }}>
            {children}
            <Sheet
                open={!!openKey}
                onClose={() => {
                    setOpenKey(null);
                    setHelpData(null);
                }}
                title={openKey ? HELP_CONTENT[openKey].title : "Help Center"}
                icon={<Info size={24} />}
            >
                {openKey && (
                    <div className="flex flex-col gap-6">
                        <div className="text-[var(--color-on-surface-variant)] leading-relaxed text-[15px] p-4 bg-[var(--color-surface-container-low)] rounded-[var(--radius-m3-md)] border border-[var(--color-outline-variant)]/20 shadow-[var(--shadow-m3-1)]">
                            {HELP_CONTENT[openKey].description}
                        </div>

                        {openKey === "seoDashboard" && helpData && (
                            <div className="space-y-6">
                                <div className="p-6 rounded-[var(--radius-m3-xl)] bg-[var(--color-surface-container-high)] flex items-center justify-between border border-[var(--color-outline-variant)]/10">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black">{helpData.score}%</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Visibility Score</span>
                                    </div>
                                    <div className="w-24 h-2 bg-[var(--color-outline-variant)]/20 rounded-full overflow-hidden shrink-0">
                                        <div
                                            className={`h-full transition-all duration-500 ${helpData.score > 80 ? 'bg-emerald-500' : helpData.score > 50 ? 'bg-amber-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${helpData.score}%` }}
                                        />
                                    </div>
                                </div>

                                {helpData.suggestions?.length > 0 ? (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Actionable Suggestions</h4>
                                        {helpData.suggestions.map((tip: any, i: number) => (
                                            <div
                                                key={i}
                                                className="p-4 rounded-2xl bg-white border border-[var(--color-outline-variant)]/10 shadow-sm flex gap-3"
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tip.type === 'id' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
                                                    }`}>
                                                    <Info size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-bold text-[var(--color-on-surface)] mb-0.5">{tip.title}</p>
                                                    <p className="text-[11px] text-[var(--color-on-surface-variant)] leading-relaxed opacity-70">
                                                        {tip.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 gap-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                            <Info size={24} />
                                        </div>
                                        <p className="font-bold text-center px-4">Your SEO is perfect! No further actions needed.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Sheet>
        </HelpCenterContext.Provider>
    );
}

export function useHelpCenter() {
    const context = useContext(HelpCenterContext);
    if (!context) throw new Error("useHelpCenter must be used within HelpCenterProvider");
    return context;
}

export function HelpIcon({ topic }: { topic: HelpKey }) {
    const { openHelp } = useHelpCenter();
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openHelp(topic);
            }}
            className="inline-flex items-center justify-center p-1 rounded-full text-[var(--color-on-surface-variant)] opacity-50 hover:opacity-100 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 ml-1.5"
            title="Click for help"
        >
            <HelpCircle size={14} />
        </button>
    );
}
