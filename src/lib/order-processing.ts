import { ObjectId } from "mongodb";
import { postJournalEntry } from "./finance";
import { PaymentStatus, OrderStatus } from "./orders";

/**
 * Common logic to record an order payment and perform
 * accounting (Double-Entry Journal Posting).
 */
export async function recordOrderPayment(db: any, params: {
    orderId: string;
    amount: number;
    paymentMethod: string;    // "CreditCard", "Cash", etc.
    paymentGateway: string;   // "Stripe", "Paystack", "Manual"
    paymentRef?: string;      // Gateway transaction ID
    currency: string;
    notes?: string;
    userId?: string;          // System or Admin ID
}) {
    const { orderId, amount, paymentMethod, paymentGateway, paymentRef, currency, notes, userId } = params;

    // 1. Fetch Order
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) throw new Error("Order not found");

    const storeId = order.storeId;

    // 2. Insert Payment Record
    const payment = {
        "@type": "PayAction",
        orderId: new ObjectId(orderId),
        storeId,
        amount,
        priceCurrency: currency,
        paymentMethod,
        paymentStatus: "PaymentComplete" as PaymentStatus,
        paymentGateway,
        paymentRef,
        notes,
        processedAt: new Date(),
        createdAt: new Date(),
        createdBy: userId || "SYSTEM",
    };

    const insertResult = await db.collection("orders_payments").insertOne(payment);

    // 3. Update Order financial status
    const allPayments = await db.collection("orders_payments")
        .find({ orderId: new ObjectId(orderId), paymentStatus: "PaymentComplete" })
        .toArray();

    const amountPaid = allPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalPayable = order.totalPayable || order.total || 0;

    await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        {
            $set: {
                amountPaid,
                amountDue: Math.max(0, totalPayable - amountPaid),
                paymentStatus: amountPaid >= totalPayable ? "PaymentComplete" : "PaymentAutoPay",
                orderStatus: "OrderProcessing", // Move to processing if paid
                updatedAt: new Date(),
            }
        }
    );

    // 4. Accounting: Post Journal Entry
    // Resolve asset account from store payment method config
    let assetCoaCode = "1000"; // default: Cash
    const pmConfig = await db.collection("store_payment_methods").findOne({
        storeId,
        $or: [
            { type: paymentMethod },
            { gateway: paymentGateway },
            { name: { $regex: paymentMethod, $options: "i" } },
        ]
    });
    if (pmConfig?.coaCode) assetCoaCode = pmConfig.coaCode;

    // Get account IDs from codes
    const { getAccountByCode } = await import("./finance");
    const assetAccount = await getAccountByCode(db, storeId, assetCoaCode);
    const arAccount = await getAccountByCode(db, storeId, "1200");

    const description = `Payment for Order #${order.orderNumber} via ${paymentGateway} (${paymentMethod})`;
    const opts = {
        category: "Sales",
        referenceId: orderId,
        referenceType: "Order" as const,
        date: new Date(),
        createdBy: userId || "SYSTEM",
        paymentMethod,
    };

    if (assetAccount) {
        await postJournalEntry(db, storeId, assetAccount._id.toString(), "Debit", amount, description, opts);
    }
    if (arAccount) {
        await postJournalEntry(db, storeId, arAccount._id.toString(), "Credit", amount, description, opts);
    }

    return { paymentId: insertResult.insertedId, amountPaid };
}
