import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DpoAdapter } from "@/lib/gateways";
import { recordOrderPayment } from "@/lib/order-processing";

/**
 * DPO GROUP WEBHOOK HANDLER
 * Path: /api/webhooks/dpo
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // DPO can be configured to send JSON
        const token = body.TransactionToken || body.TransToken;

        if (!token) {
            return NextResponse.json({ error: "Missing Transaction Token" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Find any DPO config to get credentials for verification
        const pmConfig = await db.collection("store_payment_methods").findOne({
            gateway: "DPO",
            apiKey: { $exists: true, $ne: "" }
        });

        if (!pmConfig) {
            return NextResponse.json({ error: "DPO configuration not found" }, { status: 400 });
        }

        const dpo = new DpoAdapter(pmConfig as any);
        const verification = await dpo.verifyToken(token);

        if (verification.status === "Success") {
            // DPO XML often contains CompanyRef which we use as orderId
            const orderIdMatch = verification.xml.match(/<CompanyRef>(.*?)<\/CompanyRef>/);
            const amountMatch = verification.xml.match(/<TransactionAmount>(.*?)<\/TransactionAmount>/);
            const currencyMatch = verification.xml.match(/<TransactionCurrency>(.*?)<\/TransactionCurrency>/);
            const orderId = orderIdMatch?.[1];

            if (orderId) {
                await recordOrderPayment(db, {
                    orderId,
                    amount: parseFloat(amountMatch?.[1] || "0"),
                    paymentMethod: "CreditCard",
                    paymentGateway: "DPO",
                    paymentRef: token,
                    currency: currencyMatch?.[1] || "USD",
                    notes: `DPO Payment (Token: ${token})`,
                    userId: "SYSTEM_DPO_WEBHOOK",
                });
                console.log(`DPO Webhook: Order ${orderId} marked as PAID.`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("DPO webhook error:", error.message);
        // DPO expects specific responses sometimes, but JSON {received: true} is usually fine
        return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }
}

// Support GET as DPO sometimes redirects with token in URL
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const token = searchParams.get("TransToken") || searchParams.get("TransactionToken");

    if (token) {
        // We could trigger the same logic here if needed, but usually DPO 
        // does a separate POST for the actual webhook.
        // For now, just acknowledged.
    }

    return NextResponse.json({ received: true });
}
