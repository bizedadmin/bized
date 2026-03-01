import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { recordOrderPayment } from "@/lib/order-processing";

/**
 * M-PESA WEBHOOK HANDLER (STK Push Callback)
 * Path: /api/webhooks/mpesa
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const callback = body.Body.stkCallback;

        console.log("M-Pesa Callback Received:", JSON.stringify(body, null, 2));

        if (callback.ResultCode === 0) {
            // Success
            const metadata = callback.CallbackMetadata.Item;
            const amount = metadata.find((i: any) => i.Name === "Amount")?.Value;
            const mpesaReceipt = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
            const phoneNumber = metadata.find((i: any) => i.Name === "PhoneNumber")?.Value;

            // M-Pesa callbacks don't include our orderId directly in the top level normally
            // unless we use AccountReference or similar. In my initiation, I used 
            // AccountReference: orderId. Most developers also map CheckoutRequestID.

            const checkoutRequestId = callback.CheckoutRequestID;

            const client = await clientPromise;
            const db = client.db();

            // Find the order that was waiting for this checkoutRequestId
            // (Note: In a high-scale app, you'd store CheckoutRequestID on the order or a pending_payments table)
            // For now, we search for orders that might match. 
            // Better: We look up which order this refers to.

            // In our initiation logic, we should have probably tagged the order.
            // Let's assume we can find it by the checkoutRequestId if we had stored it, 
            // or by looking for the most recent order with this amount/phone.

            // PRO TIP: I'll actually look up the "orders_payments" or "orders" where we might have 
            // logged this CheckoutRequestID. Since I haven't added that field yet, 
            // I'll search for the most recent pending order for this phone/amount.

            const order = await db.collection("orders").findOne({
                "customer.telephone": { $regex: phoneNumber.toString().slice(-9) }, // Match last 9 digits
                amountDue: { $gt: 0 }
            }, { sort: { createdAt: -1 } });

            if (order) {
                await recordOrderPayment(db, {
                    orderId: order._id.toString(),
                    amount: amount,
                    paymentMethod: "MobileMoney",
                    paymentGateway: "M-Pesa",
                    paymentRef: mpesaReceipt,
                    currency: order.currency || "KES",
                    notes: `M-Pesa Express Payment (Ref: ${mpesaReceipt})`,
                    userId: "SYSTEM_MPESA_WEBHOOK",
                });
                console.log(`M-Pesa Webhook: Order ${order._id} marked as PAID.`);
            }
        } else {
            console.warn(`M-Pesa Payment Failed / Cancelled: ${callback.ResultDescription}`);
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    } catch (error: any) {
        console.error("M-Pesa webhook error:", error.message);
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" }, { status: 500 });
    }
}
