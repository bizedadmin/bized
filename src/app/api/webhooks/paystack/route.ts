import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { PaystackAdapter } from "@/lib/gateways";
import { recordOrderPayment } from "@/lib/order-processing";
import { decrypt } from "@/lib/encryption";

/**
 * PAYSTACK WEBHOOK HANDLER
 * Listens for successful transactions in African markets.
 * Path: /api/webhooks/paystack
 */
export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const sig = req.headers.get("x-paystack-signature");

    if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 401 });

    try {
        const client = await clientPromise;
        const db = client.db();

        // 1. Resolve store-specific secret key for signature verification
        const pmConfig = await db.collection("store_payment_methods").findOne({
            gateway: "Paystack",
            apiKey: { $exists: true, $ne: "" }
        });

        if (!pmConfig) {
            console.error("Paystack Secret Key not found in any store's config.");
            return NextResponse.json({ error: "Secret key not configured" }, { status: 400 });
        }

        // 2. Verify Signature
        // Decrypt the stored API key to use for HMAC verification
        const decryptedSecretKey = decrypt(pmConfig.apiKey);
        const isValidSignature = PaystackAdapter.verifyWebhookSignature(rawBody, sig, decryptedSecretKey);

        if (!isValidSignature) {
            console.warn("Paystack Webhook: HMAC-SHA512 verification failed.");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(rawBody);

        // 3. Handle successful charge
        if (event.event === "charge.success") {
            const data = event.data;
            const orderId = data.metadata?.orderId || data.reference;

            if (!orderId) {
                console.warn("Paystack Webhook: charge.success event missing reference.");
                return NextResponse.json({ received: true });
            }

            // Record payment and update order/finance
            await recordOrderPayment(db, {
                orderId,
                amount: data.amount / 100,
                paymentMethod: "CreditCard",
                paymentGateway: "Paystack",
                paymentRef: data.reference,
                currency: data.currency?.toUpperCase() || "NGN",
                notes: `Paystack Payment (Ref: ${data.reference})`,
                userId: "SYSTEM_PAYSTACK_WEBHOOK",
            });

            console.log(`Paystack Webhook: Order ${orderId} marked as PAID.`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("Paystack webhook error:", error.message);
        return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }
}
