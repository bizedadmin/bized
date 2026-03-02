import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getPlatformSettings } from "@/lib/platform-settings";

/**
 * POST /api/billing/subscribe
 * Creates a checkout session for a subscription plan
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { planId, gateway, storeId } = body;

        if (!planId || !gateway || !storeId) {
            return NextResponse.json({ error: "planId, gateway, and storeId are required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // 1. Verify store ownership
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        // 2. Fetch Plan
        const plan = await db.collection("platform_plans").findOne({ id: planId });
        if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

        const platform = await getPlatformSettings();
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const returnUrl = `${protocol}://${host}/admin/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}`;

        // 3. Gateway Specific Logic
        if (gateway === "Stripe") {
            const stripeKey = platform.platformPartnerKeys?.stripe?.secretKey;
            const priceId = plan.gateways?.stripe?.priceId;
            if (!stripeKey || !priceId) throw new Error("Stripe is not configured for this plan");

            const Stripe = (await import("stripe")).default;
            const stripe = new Stripe(stripeKey);

            // Create or lookup customer
            let stripeCustomerId = store.subscription?.externalCustomerId;
            if (!stripeCustomerId) {
                const customer = await stripe.customers.create({
                    email: store.email || session.user.email || "",
                    name: store.name,
                    metadata: { storeId }
                });
                stripeCustomerId = customer.id;
            }

            const checkoutSession = await stripe.checkout.sessions.create({
                customer: stripeCustomerId,
                payment_method_types: ["card"],
                line_items: [{ price: priceId, quantity: 1 }],
                mode: "subscription",
                success_url: returnUrl,
                cancel_url: `${protocol}://${host}/admin/settings?tab=billing&status=cancelled`,
                metadata: { storeId, planId }
            });

            return NextResponse.json({ checkoutUrl: checkoutSession.url });
        }

        if (gateway === "Paystack") {
            const secretKey = platform.platformPartnerKeys?.paystack?.secretKey;
            const planCode = plan.gateways?.paystack?.planCode;
            if (!secretKey || !planCode) throw new Error("Paystack is not configured for this plan");

            const res = await fetch("https://api.paystack.co/transaction/initialize", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: store.email || session.user.email || "billing@bized.app",
                    amount: Math.round(plan.price * 100),
                    plan: planCode,
                    callback_url: `${protocol}://${host}/admin/settings?tab=billing`,
                    metadata: { storeId, planId, type: "subscription" }
                })
            });

            const psData = await res.json();
            if (!psData.status) throw new Error(psData.message);

            return NextResponse.json({ checkoutUrl: psData.data.authorization_url });
        }

        return NextResponse.json({ error: "Unsupported gateway" }, { status: 400 });

    } catch (error: any) {
        console.error("Subscription Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
