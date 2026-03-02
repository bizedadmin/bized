import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { AdyenAdapter } from "@/lib/gateways";
import { recordOrderPayment } from "@/lib/order-processing";
import { decrypt } from "@/lib/encryption";

/**
 * ADYEN WEBHOOK HANDLER
 * Listens for notification events to mark orders as paid.
 * Path: /api/webhooks/adyen
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const notificationItem = body.notificationItems?.[0]?.NotificationRequestItem;

        if (!notificationItem) {
            return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // 1. Get Adyen configuration
        const pmConfig = await db.collection("store_payment_methods").findOne({
            gateway: "Adyen",
            webhookSecret: { $exists: true, $ne: "" }
        });

        if (!pmConfig) {
            console.error("Adyen Webhook Secret not found.");
            return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
        }

        // 2. Handle successful payment
        if (notificationItem.success === "true" && notificationItem.eventCode === "AUTHORISATION") {
            const orderId = notificationItem.merchantReference;

            if (!orderId) {
                console.warn("Adyen Webhook: AUTHORISATION missing merchantReference.");
                return NextResponse.json({ "[accepted]": true });
            }

            // Record payment
            await recordOrderPayment(db, {
                orderId,
                amount: notificationItem.amount.value / 100,
                paymentMethod: "CreditCard",
                paymentGateway: "Adyen",
                paymentRef: notificationItem.pspReference,
                currency: notificationItem.amount.currency,
                notes: `Adyen Payment (PSP: ${notificationItem.pspReference})`,
                userId: "SYSTEM_ADYEN_WEBHOOK",
            });

            console.log(`Adyen Webhook: Order ${orderId} marked as PAID.`);
        }

        // Adyen requires [accepted] in response
        return NextResponse.json({ "[accepted]": true });

    } catch (error: any) {
        console.error("Adyen webhook error:", error.message);
        return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }
}
