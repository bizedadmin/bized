import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { postJournalEntry, getAccountByCode } from "@/lib/finance";
import type { PaymentStatus } from "@/lib/orders";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id]/payments?storeId=...
 * Returns all payment transactions for a given order.
 */
export async function GET(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const storeId = req.nextUrl.searchParams.get("storeId");
        if (!storeId)
            return NextResponse.json({ error: "storeId is required" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        const payments = await db.collection("orders_payments")
            .find({ orderId: id, storeId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            payments: payments.map(p => ({ ...p, _id: p._id.toString() }))
        });
    } catch (error) {
        console.error("Order payments GET error:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}

/**
 * POST /api/orders/[id]/payments
 * Records a payment (full or partial) against an order.
 *
 * schema.org/PayAction
 *
 * Business logic:
 * 1. Insert the payment into orders_payments
 * 2. Recalculate amountPaid and amountDue on the order
 * 3. Update order paymentStatus:
 *    - amountPaid >= totalPayable → PaymentComplete
 *    - 0 < amountPaid < totalPayable → PaymentAutoPay (partial)
 * 4. Update the referenced invoice paymentStatus if invoiceId is provided
 * 5. Auto-post journal entries (Cash debit, AR credit)
 */
export async function POST(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const {
            storeId,
            amount,
            priceCurrency = "USD",
            paymentMethod,  // "CreditCard", "Cash", "BankTransfer", "Crypto"
            paymentGateway, // "Stripe", "Paystack", "Manual", etc.
            paymentRef,     // gateway transaction ID
            invoiceId,      // optional — which invoice this payment covers
            notes,
        } = body;

        if (!storeId || !amount || !paymentMethod)
            return NextResponse.json(
                { error: "Missing required fields: storeId, amount, paymentMethod" },
                { status: 400 }
            );

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId), ownerId: session.user.id
        });
        if (!store)
            return NextResponse.json({ error: "Store not found" }, { status: 404 });

        const order = await db.collection("orders").findOne({
            _id: new ObjectId(id), storeId
        });
        if (!order)
            return NextResponse.json({ error: "Order not found" }, { status: 404 });

        const parsedAmount = parseFloat(amount);

        // 1. Record the payment
        const payment = {
            "@type": "PayAction", // schema.org
            orderId: id,
            orderNumber: order.orderNumber,
            storeId,
            amount: parsedAmount,
            priceCurrency,
            paymentMethod,
            paymentGateway: paymentGateway ?? "Manual",
            paymentRef: paymentRef ?? null,
            paymentStatus: "PaymentComplete" as PaymentStatus,
            invoiceId: invoiceId ?? null,
            notes: notes ?? null,
            processedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: session.user.id,
        };

        const payResult = await db.collection("orders_payments").insertOne(payment);

        // 2. Recalculate payment totals on the order
        const allPayments = await db.collection("orders_payments")
            .find({ orderId: id, storeId, paymentStatus: "PaymentComplete" })
            .toArray();

        const amountPaid = allPayments.reduce((s, p) => s + p.amount, 0);
        const amountDue = Math.max(0, order.totalPayable - amountPaid);

        const newPaymentStatus: PaymentStatus =
            amountPaid >= order.totalPayable ? "PaymentComplete" :
                amountPaid > 0 ? "PaymentAutoPay" :
                    "PaymentDue";

        const newOrderStatus = newPaymentStatus === "PaymentComplete"
            ? "OrderProcessing"
            : order.orderStatus;

        await db.collection("orders").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    amountPaid,
                    amountDue,
                    paymentStatus: newPaymentStatus,
                    orderStatus: newOrderStatus,
                    updatedAt: new Date(),
                }
            }
        );

        // 3. Update invoice paymentStatus if invoiceId is provided
        if (invoiceId) {
            const inv = await db.collection("finance_invoices").findOne({
                _id: new ObjectId(invoiceId)
            });
            if (inv) {
                const invPayments = await db.collection("orders_payments")
                    .find({ invoiceId, paymentStatus: "PaymentComplete" })
                    .toArray();
                const invPaid = invPayments.reduce((s, p) => s + p.amount, 0);
                const invStatus: PaymentStatus =
                    invPaid >= inv.totalPaymentDue ? "PaymentComplete" :
                        invPaid > 0 ? "PaymentAutoPay" :
                            "PaymentDue";
                // also map schema.org statuses to UI statuses Draft/Sent/Paid/Overdue for the finance_invoices collection
                let mappedStatus = "Draft";
                if (invStatus === "PaymentDue" || invStatus === "PaymentAutoPay") {
                    const isOverdue = inv.paymentDueDate ? new Date(inv.paymentDueDate) < new Date() : false;
                    mappedStatus = isOverdue ? "Overdue" : "Sent";
                } else if (invStatus === "PaymentComplete" || invStatus === "Paid") {
                    mappedStatus = "Paid";
                }

                await db.collection("finance_invoices").updateOne(
                    { _id: new ObjectId(invoiceId) },
                    { $set: { paymentStatus: mappedStatus, updatedAt: new Date() } }
                );
            }
        }

        // 4. Auto-post double-entry journal entries when a payment is received.
        //
        // Entry A: Debit the payment-method-specific asset account (money IN to a real account).
        //          The COA code is resolved from the store's payment method config:
        //          Cash → 1000 | Card → 1010 | BankTransfer → 1020 | MobileMoney → 1030 | etc.
        //
        // Entry B: Credit Accounts Receivable 1200 (clearing the amount owed).
        //
        // Entry C: Credit Sales Revenue 4000 (revenue recognised on payment).
        //
        // This produces a fully balanced double-entry ledger per payment channel.

        // Resolve the correct asset account from payment method config
        let assetCoaCode = "1000"; // default: Cash on Hand
        const pmConfig = await db.collection("store_payment_methods").findOne({
            storeId,
            $or: [
                { type: paymentMethod },
                { name: { $regex: paymentMethod, $options: "i" } },
            ]
        });
        if (pmConfig?.coaCode) assetCoaCode = pmConfig.coaCode;

        const extraOpts = {
            category: "Sales",
            referenceId: id,
            referenceType: "Order" as const,
            createdBy: session.user.id,
            paymentMethod, // propagated for per-channel reporting
        };

        // A. Debit payment channel asset account (money received into this account)
        const assetAccount = await getAccountByCode(db, storeId, assetCoaCode);
        if (assetAccount) {
            await postJournalEntry(
                db, storeId, assetAccount._id.toString(), "Debit", parsedAmount,
                `${paymentMethod} payment received for ${order.orderNumber}`,
                extraOpts
            );
        } else {
            // Fallback: try the generic cash account
            const cashAccount = await getAccountByCode(db, storeId, "1000");
            if (cashAccount) {
                await postJournalEntry(
                    db, storeId, cashAccount._id.toString(), "Debit", parsedAmount,
                    `${paymentMethod} payment received for ${order.orderNumber}`,
                    extraOpts
                );
            }
        }

        // B. Credit Accounts Receivable (clearing the AR balance)
        const arAccount = await getAccountByCode(db, storeId, "1200");
        if (arAccount) {
            await postJournalEntry(
                db, storeId, arAccount._id.toString(), "Credit", parsedAmount,
                `AR cleared for ${order.orderNumber} (${paymentMethod})`,
                extraOpts
            );
        }

        // C. Credit Sales Revenue (recognise revenue)
        const revenueAccount = await getAccountByCode(db, storeId, "4000");
        if (revenueAccount) {
            await postJournalEntry(
                db, storeId, revenueAccount._id.toString(), "Credit", parsedAmount,
                `Sales Revenue recognised for ${order.orderNumber}`,
                extraOpts
            );
        }

        return NextResponse.json({
            id: payResult.insertedId.toString(),
            amountPaid,
            amountDue,
            paymentStatus: newPaymentStatus,
            message: "Payment recorded successfully",
        }, { status: 201 });
    } catch (error: any) {
        console.error("Order payment POST error:", error);
        return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }
}
