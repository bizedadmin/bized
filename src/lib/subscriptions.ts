import { ObjectId } from "mongodb";

export type PlanInterval = "monthly" | "yearly" | "forever";

export interface PlatformPlan {
    _id?: string | ObjectId;
    id: string; // URL-friendly ID e.g. "free", "starter", "pro"
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: PlanInterval;
    features: string[];
    limits: {
        maxProducts: number;
        maxStaff: number;
        customDomain: boolean;
        analyticsLevel: "basic" | "advanced" | "pro";
    };
    gateways: {
        stripe?: {
            priceId: string;
            productId: string;
        };
        paystack?: {
            planCode: string;
        };
    };
    status: "active" | "draft" | "archived";
    isDefault?: boolean; // New businesses auto-assigned to this
    createdAt: Date;
    updatedAt: Date;
}

export interface BusinessSubscription {
    storeId: string;
    planId: string; // ref to PlatformPlan.id
    status: "active" | "past_due" | "canceled" | "unpaid" | "trialing" | "incomplete";
    gateway: "Stripe" | "Paystack" | "Manual";
    externalSubscriptionId?: string;
    externalCustomerId?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd: boolean;
    trialEnd?: Date;
    updatedAt: Date;
}
