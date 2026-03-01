import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { StripeAdapter } from "@/lib/gateways";
import { recordOrderPayment } from "@/lib/order-processing";
import { decrypt } from "@/lib/encryption";

/**
 * STRIPE WEBHOOK HANDLER
 * Listens for successful checkout sessions to mark orders as paid.
 * Path: /api/webhooks/stripe
 */
export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

    try {
        const client = await clientPromise;
        const db = client.db();

        // 1. Get ANY Stripe configuration from the database 
        // Note: Stripe Webhook Secret is usually global per account, 
        // but here it's per-store in our current settings model.
        // For a production SaaS, you'd usually have a global secret or a way to look up store secret first.

        // Find a store that has a Stripe webhook secret configured
        const pmConfig = await db.collection("store_payment_methods").findOne({
            gateway: "Stripe",
            webhookSecret: { $exists: true, $ne: "" }
        });

        if (!pmConfig) {
            console.error("Stripe Webhook Secret not found in any store's config.");
            return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
        }

        const stripe = new StripeAdapter(pmConfig as any);
        const decryptedSecret = decrypt(pmConfig.webhookSecret);
        const event = stripe.verifyWebhook(rawBody, sig, decryptedSecret);

        // 2. Handle successful payment
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;
            const orderId = session.client_reference_id || session.metadata?.orderId;

            if (!orderId) {
                console.warn("Stripe Webhook: checkout.session.completed event missing orderId reference.");
                return NextResponse.json({ received: true });
            }

            // Record payment and update order/finance
            await recordOrderPayment(db, {
                orderId,
                amount: session.amount_total / 100, // Stripe cents to dollars
                paymentMethod: "CreditCard",
                paymentGateway: "Stripe",
                paymentRef: session.id,
                currency: session.currency?.toUpperCase() || "USD",
                notes: `Stripe Payment (Session: ${session.id})`,
                userId: "SYSTEM_STRIPE_WEBHOOK",
            });

            console.log(`Stripe Webhook: Order ${orderId} marked as PAID.`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("Stripe webhook error:", error.message);
        return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }
}

// Next.js App Router config for raw body
export const config = {
    api: {
        bodyParser: false,
    },
};
