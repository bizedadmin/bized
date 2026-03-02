import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { recordOrderRefund } from "@/lib/order-processing";
import { getGatewayAdapter } from "@/lib/gateways";

/**
 * POST /api/orders/[id]/refund
 * Processes a refund for a specific order payment.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: orderId } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { paymentId, amount, reason } = body;

        if (!paymentId || !amount) {
            return NextResponse.json({ error: "Missing paymentId or amount" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // 1. Verify ownership
        const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        const store = await db.collection("stores").findOne({ _id: new ObjectId(order.storeId), ownerId: session.user.id });
        if (!store) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // 2. Fetch the original payment
        const payment = await db.collection("orders_payments").findOne({ _id: new ObjectId(paymentId) });
        if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

        // 3. Process Gateway Refund (if applicable)
        const gateway = payment.paymentGateway;
        const autoGateways = ["Stripe", "Paystack", "PayPal"];

        if (autoGateways.includes(gateway) && payment.paymentRef) {
            try {
                const adapter = await getGatewayAdapter(order.storeId, gateway, db);
                if (gateway === "Stripe") {
                    await (adapter as any).refundPayment(payment.paymentRef, amount);
                } else if (gateway === "Paystack") {
                    await (adapter as any).refundTransaction(payment.paymentRef, amount);
                } else if (gateway === "PayPal") {
                    // PayPal might need captureId. Normally paymentRef is the captureId here.
                    await (adapter as any).refundCapture(payment.paymentRef, amount, payment.priceCurrency);
                }
            } catch (gatewayError: any) {
                console.error(`Gateway refund error (${gateway}):`, gatewayError);
                return NextResponse.json({ error: `Gateway Refund Failed: ${gatewayError.message}` }, { status: 400 });
            }
        }

        // 4. Record the refund in our system (DB + Ledger + Credit Note)
        const result = await recordOrderRefund(db, {
            orderId,
            originalPaymentId: paymentId,
            amount,
            reason,
            userId: session.user.id
        });

        return NextResponse.json({
            success: true,
            message: "Refund processed successfully",
            ...result
        });

    } catch (error: any) {
        console.error("Refund POST error:", error);
        return NextResponse.json({ error: error.message || "Failed to process refund" }, { status: 500 });
    }
}
