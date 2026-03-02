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

        // 1. Get Platform Settings and try to verify with Platform Webhook Secret
        const { getPlatformSettings } = await import("@/lib/platform-settings");
        const platform = await getPlatformSettings();
        const platformWebhookSecret = platform.platformPartnerKeys?.stripe?.webhookSecret;

        let event;
        let adapter: StripeAdapter | null = null;

        if (platformWebhookSecret && platform.platformPartnerKeys?.stripe?.secretKey) {
            try {
                // Try platform-level verification
                const platformAdapter = new StripeAdapter({} as any, {
                    secretKey: platform.platformPartnerKeys.stripe.secretKey,
                    feePercent: platform.platformCommission
                });
                event = platformAdapter.verifyWebhook(rawBody, sig, platformWebhookSecret);
                adapter = platformAdapter;
            } catch (e) {
                // Not a platform webhook or signature mismatch
                console.log("Stripe Webhook: Not a platform-level event or invalid platform secret.");
            }
        }

        // 2. If platform verification failed, try find any store with a matching secret 
        // (This is common if stores set up their own non-connected Stripe)
        if (!event) {
            const pmConfig = await db.collection("store_payment_methods").findOne({
                gateway: "Stripe",
                webhookSecret: { $exists: true, $ne: "" }
            });

            if (!pmConfig) {
                return NextResponse.json({ error: "No valid Stripe configuration found for verification" }, { status: 400 });
            }

            adapter = new StripeAdapter(pmConfig as any);
            const decryptedSecret = decrypt(pmConfig.webhookSecret);
            event = adapter.verifyWebhook(rawBody, sig, decryptedSecret);
        }

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
