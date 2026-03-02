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

    // 2b. Record Platform Commission if applicable
    const { getPlatformSettings } = await import("./platform-settings");
    const platform = await getPlatformSettings();
    if (platform.platformCommission > 0 && !["Cash", "Manual"].includes(paymentGateway)) {
        const platformFee = Number((amount * (platform.platformCommission / 100)).toFixed(2));

        // Determine settlement status
        // Gateways with programmatic splitting/Connect setup are "Settled" automatically
        const automatedGateways = ["Stripe", "Paystack", "Adyen", "PayPal"];

        // Find if this store is using platform partner setup for this gateway
        const storePm = await db.collection("store_payment_methods").findOne({ storeId, gateway: paymentGateway });
        const isSettled = automatedGateways.includes(paymentGateway) && !!storePm?.connectedAccountId;

        await db.collection("platform_commissions").insertOne({
            orderId: new ObjectId(orderId),
            paymentId: insertResult.insertedId,
            storeId,
            amount: platformFee,
            totalAmount: amount, // The original payment amount
            currency,
            percentage: platform.platformCommission,
            gateway: paymentGateway,
            status: isSettled ? "Settled" : "Pending Invoice", // "Settled" means platform cut was split at source
            createdAt: new Date()
        });
    }

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

/**
 * Common logic to record a refund and perform accounting.
 * This should be called after a successful gateway refund.
 */
export async function recordOrderRefund(db: any, params: {
    orderId: string;
    originalPaymentId: string;
    amount: number;
    reason?: string;
    userId?: string;
}) {
    const { orderId, originalPaymentId, amount, reason, userId } = params;

    // 1. Fetch Order
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) throw new Error("Order not found");

    const storeId = order.storeId;
    const originalPayment = await db.collection("orders_payments").findOne({ _id: new ObjectId(originalPaymentId) });
    if (!originalPayment) throw new Error("Original payment not found");

    // 2. Insert Refund Record
    const refundRecord = {
        "@type": "RefundAction",
        orderId: new ObjectId(orderId),
        originalPaymentId: new ObjectId(originalPaymentId),
        storeId,
        amount: -Math.abs(amount), // Negative amount for refunds
        priceCurrency: originalPayment.priceCurrency,
        paymentMethod: originalPayment.paymentMethod,
        paymentStatus: "PaymentRefunded" as PaymentStatus,
        paymentGateway: originalPayment.paymentGateway,
        paymentRef: `REFUND-${originalPayment.paymentRef || "MANUAL"}`,
        notes: reason || "Refund processed",
        processedAt: new Date(),
        createdAt: new Date(),
        createdBy: userId || "SYSTEM",
    };

    const insertResult = await db.collection("orders_payments").insertOne(refundRecord);

    // 3. Update Order financial status
    const allRemainingPayments = await db.collection("orders_payments")
        .find({ orderId: new ObjectId(orderId), paymentStatus: { $in: ["PaymentComplete", "PaymentRefunded"] } })
        .toArray();

    const amountPaidCurrent = allRemainingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalPayable = order.totalPayable || order.total || 0;

    await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        {
            $set: {
                amountPaid: amountPaidCurrent,
                amountDue: Math.max(0, totalPayable - amountPaidCurrent),
                paymentStatus: amountPaidCurrent <= 0 ? "PaymentDue" : (amountPaidCurrent < totalPayable ? "PaymentAutoPay" : "PaymentComplete"),
                updatedAt: new Date(),
            }
        }
    );

    // 4. Create Credit Note (Negative Invoice)
    const invoiceNumber = `CN-${order.orderNumber}-${Date.now().toString().slice(-4)}`;
    await db.collection("finance_invoices").insertOne({
        "@type": "Invoice",
        orderId: orderId,
        storeId,
        invoiceNumber,
        customerName: order.customer?.name || "Customer",
        paymentStatus: "PaymentRefunded" as PaymentStatus,
        totalPaymentDue: -Math.abs(amount),
        priceCurrency: originalPayment.priceCurrency,
        description: `Credit Note / Refund for Order #${order.orderNumber}. Reason: ${reason}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId || "SYSTEM",
    });

    // 5. Accounting: Journal Entries
    // Debit Revenue (4000) or Returns, Credit Asset/Cash (1000/1100)
    let assetCoaCode = "1000"; // default: Cash
    const pmConfig = await db.collection("store_payment_methods").findOne({
        storeId,
        gateway: originalPayment.paymentGateway
    });
    if (pmConfig?.coaCode) assetCoaCode = pmConfig.coaCode;

    const { getAccountByCode } = await import("./finance");
    const assetAccount = await getAccountByCode(db, storeId, assetCoaCode);
    const revenueAccount = await getAccountByCode(db, storeId, "4000"); // Standard Sales Revenue

    const description = `Refund for Order #${order.orderNumber} (Ref: ${originalPayment.paymentRef})`;
    const opts = {
        category: "Returns",
        referenceId: orderId,
        referenceType: "Order" as const,
        date: new Date(),
        createdBy: userId || "SYSTEM",
    };

    if (assetAccount) {
        // Crediting Cash/Bank (Money going OUT)
        await postJournalEntry(db, storeId, assetAccount._id.toString(), "Credit", amount, description, opts);
    }
    if (revenueAccount) {
        // Debiting Revenue (Reducing revenue)
        await postJournalEntry(db, storeId, revenueAccount._id.toString(), "Debit", amount, description, opts);
    }

    // 6. Reverse Platform Commission if it was recorded
    const commission = await db.collection("platform_commissions").findOne({ paymentId: originalPayment._id });
    if (commission && commission.status !== "Reversed") {
        const refundPercent = amount / commission.totalAmount;
        const commissionToReverse = Number((commission.amount * refundPercent).toFixed(2));

        await db.collection("platform_commissions").insertOne({
            ...commission,
            _id: undefined,
            originalCommissionId: commission._id,
            amount: -commissionToReverse,
            status: "Reversed",
            notes: `Commission reversed due to refund of ${amount}`,
            createdAt: new Date()
        });
    }

    return { refundId: insertResult.insertedId, amountPaidCurrent };
}
