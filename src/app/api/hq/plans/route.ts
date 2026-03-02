import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getPlatformSettings } from "@/lib/platform-settings";

/**
 * GET /api/hq/plans
 * List all available platform plans
 * Accessible only by Super Admin (HQ)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const isSuperAdmin = (session?.user as any)?.isSuperAdmin === true;
        if (!isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const plans = await db.collection("platform_plans")
            .find()
            .sort({ price: 1 })
            .toArray();

        // If no plans exist yet, initialize with defaults
        if (plans.length === 0) {
            const defaults = [
                {
                    id: "free",
                    name: "Free Tier",
                    price: 0,
                    currency: "USD",
                    interval: "forever",
                    description: "Perfect for new businesses getting started.",
                    features: ["Up to 50 Products", "1 Staff Account", "Basic WhatsApp Ordering", "Community Support"],
                    limits: { maxProducts: 50, maxStaff: 1, customDomain: false, analyticsLevel: "basic" },
                    status: "active",
                    isDefault: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: "starter",
                    name: "Starter",
                    price: 19,
                    currency: "USD",
                    interval: "monthly",
                    description: "For growing teams needing more scale.",
                    features: ["Up to 500 Products", "5 Staff Accounts", "Custom Subdomain", "Email Support", "Advanced Analytics"],
                    limits: { maxProducts: 500, maxStaff: 5, customDomain: false, analyticsLevel: "advanced" },
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: "pro",
                    name: "Pro",
                    price: 49,
                    currency: "USD",
                    interval: "monthly",
                    description: "Unlimited scale for power sellers.",
                    features: ["Unlimited Products", "Unlimited Staff", "Custom Domain Support", "Priority 24/7 Support", "API Access"],
                    limits: { maxProducts: 99999, maxStaff: 99, customDomain: true, analyticsLevel: "pro" },
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            await db.collection("platform_plans").insertMany(defaults);
            return NextResponse.json({ plans: defaults });
        }

        return NextResponse.json({ plans });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/hq/plans
 * Create or update a plan
 * This should also trigger syncing with Stripe/Paystack
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const isSuperAdmin = (session?.user as any)?.isSuperAdmin === true;
        if (!isSuperAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { _id, id, name, description, price, currency, interval, features, limits, status, syncWithGateways } = body;

        const client = await clientPromise;
        const db = client.db();

        const planData: any = {
            id, name, description, price: Number(price), currency, interval, features, limits, status,
            updatedAt: new Date()
        };

        if (!_id) planData.createdAt = new Date();

        if (syncWithGateways && status === "active" && price > 0) {
            const platform = await getPlatformSettings();

            // 1. Stripe Sync
            if (platform.platformPartnerKeys?.stripe?.secretKey) {
                try {
                    const Stripe = (await import("stripe")).default;
                    const stripe = new Stripe(platform.platformPartnerKeys.stripe.secretKey);

                    // Always CREATE a new product/price (simplest for POC) 
                    // or look up existing by plan.id
                    const stripeProd = await stripe.products.create({
                        name: `${name} (${interval})`,
                        description,
                        metadata: { platformPlanId: id }
                    });

                    const stripePrice = await stripe.prices.create({
                        product: stripeProd.id,
                        unit_amount: Math.round(price * 100),
                        currency: currency.toLowerCase(),
                        recurring: { interval: interval === "yearly" ? "year" : "month" },
                    });

                    planData.gateways = planData.gateways || {};
                    planData.gateways.stripe = {
                        priceId: stripePrice.id,
                        productId: stripeProd.id
                    };
                } catch (se) { console.error("Stripe Plan sync error:", se); }
            }

            // 2. Paystack Sync
            if (platform.platformPartnerKeys?.paystack?.secretKey) {
                try {
                    const res = await fetch("https://api.paystack.co/plan", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${platform.platformPartnerKeys.paystack.secretKey}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: `${name} (${interval})`,
                            description,
                            amount: Math.round(price * 100), // KES is usually in cents for Paystack too
                            interval: interval === "monthly" ? "monthly" : "annually",
                            currency
                        })
                    });
                    const psData = await res.json();
                    if (psData.status) {
                        planData.gateways = planData.gateways || {};
                        planData.gateways.paystack = { planCode: psData.data.plan_code };
                    }
                } catch (pe) { console.error("Paystack Plan sync error:", pe); }
            }
        }

        if (_id) {
            await db.collection("platform_plans").updateOne(
                { _id: new ObjectId(_id) },
                { $set: planData }
            );
        } else {
            await db.collection("platform_plans").insertOne(planData);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
