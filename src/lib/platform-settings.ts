import clientPromise from "./mongodb";

export interface PlatformSettings {
    _id: string;
    defaultCurrency: string;
    supportedLanguages: string[];
    globalTimezones: string[];
    // Financials
    trialPeriodDays: number;
    platformCommission: number;
    defaultTaxRate: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    // System
    maintenanceMode: boolean;
    enableBetaFeatures: boolean;
    enableAiFeatures: boolean;
    registrationLocked: boolean;
    deletionGracePeriod: number;
    // Branding
    supportEmail: string;
    supportPhone: string;
    whatsappNumber: string;
    primaryColor: string;
    secondaryColor: string;
    // SEO & Localization
    metaTitle: string;
    metaDescription: string;
    dateFormat: string;
    numberFormat: string;
    measurementSystem: "metric" | "imperial";
    // Payment Gateways
    enabledGateways: string[];
}

export const PLATFORM_SETTINGS_ID = "global";

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
    _id: PLATFORM_SETTINGS_ID,
    defaultCurrency: "USD",
    supportedLanguages: ["English"],
    globalTimezones: ["UTC"],
    trialPeriodDays: 14,
    platformCommission: 5,
    defaultTaxRate: 16,
    minWithdrawal: 10,
    maxWithdrawal: 10000,
    maintenanceMode: false,
    enableBetaFeatures: false,
    enableAiFeatures: true,
    registrationLocked: false,
    deletionGracePeriod: 30,
    supportEmail: "support@bized.app",
    supportPhone: "+1234567890",
    whatsappNumber: "+1234567890",
    primaryColor: "#4f46e5",
    secondaryColor: "#06b6d4",
    metaTitle: "Bized - All-in-one Business Platform",
    metaDescription: "The ultimate platform for managing your business, POS, and storefront.",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "commas",
    measurementSystem: "metric",
    enabledGateways: ["stripe", "mpesa", "paystack", "dpo"]
};

export async function getPlatformSettings(): Promise<PlatformSettings> {
    const client = await clientPromise;
    const db = client.db();

    const settings = await db.collection<PlatformSettings>("platform_settings").findOne({ _id: PLATFORM_SETTINGS_ID as any });

    if (!settings) {
        return DEFAULT_PLATFORM_SETTINGS;
    }

    // Ensure all fields exist by merging with defaults
    return {
        ...DEFAULT_PLATFORM_SETTINGS,
        ...settings
    };
}
