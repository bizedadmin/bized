import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Schema.org mapping: https://schema.org/Invoice (used for Payables)

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const storeId = req.nextUrl.searchParams.get("storeId");
        if (!storeId) {
            return NextResponse.json({ error: "storeId is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const bills = await db
            .collection("finance_bills")
            .find({ storeId })
            .sort({ dueDate: 1 })
            .toArray();

        return NextResponse.json({
            bills: bills.map((b) => ({ ...b, _id: b._id.toString() }))
        });
    } catch (error) {
        console.error("List bills error:", error);
        return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            storeId,
            vendorName,
            vendorEmail,
            totalAmount,
            dueDate,
            lineItems,
            status, // "Unpaid", "Paid", "Overdue"
            expenseAccountId
        } = body;

        if (!storeId || !totalAmount || !vendorName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const bill = {
            storeId,
            vendorName,
            vendorEmail,
            totalPaymentDue: parseFloat(totalAmount), // schema.org
            paymentDueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default Net 30
            paymentStatus: status || "Unpaid",
            lineItems: lineItems || [],
            billNumber: `BILL-${Date.now().toString().slice(-6)}`,
            expenseAccountId,
            "@type": "Invoice", // schema.org (Incoming)
            customer: {
                "@type": "Organization",
                name: store.name
            },
            provider: {
                "@type": "Organization",
                name: vendorName
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: session.user.id
        };

        const result = await db.collection("finance_bills").insertOne(bill);

        return NextResponse.json(
            { id: result.insertedId.toString(), message: "Bill recorded successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Bill recording error:", error);
        return NextResponse.json({ error: "Failed to record bill" }, { status: 500 });
    }
}

/**
 * PATCH /api/finance/bills
 * Update bill status (e.g. Unpaid → Paid).
 * When marked as Paid, auto-posts journal entries:
 *   Debit → 2000 Accounts Payable  (liability cleared)
 *   Debit → 5000 Cost of Goods Sold (expense recognized)
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, storeId, paymentStatus, ...rest } = body;

        if (!id || !storeId) {
            return NextResponse.json({ error: "Missing id or storeId" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const bill = await db.collection("finance_bills").findOne({ _id: new ObjectId(id), storeId });
        if (!bill) {
            return NextResponse.json({ error: "Bill not found" }, { status: 404 });
        }

        await db.collection("finance_bills").updateOne(
            { _id: new ObjectId(id) },
            { $set: { paymentStatus, ...rest, updatedAt: new Date() } }
        );

        // Auto-post journal entries when bill transitions to Paid
        if (paymentStatus === "Paid" && bill.paymentStatus !== "Paid") {
            const { postJournalEntry, getAccountByCode } = await import("@/lib/finance");
            const amount = bill.totalPaymentDue;
            const billRef = bill.billNumber ?? id;

            // Debit Accounts Payable (2000) — liability is cleared upon payment
            const apAccount = await getAccountByCode(db, storeId, "2000");
            if (apAccount) {
                await postJournalEntry(db, storeId, apAccount._id.toString(), "Debit", amount,
                    `Bill ${billRef} — Payment to ${bill.vendorName}`,
                    { category: "Cost of Goods Sold", referenceId: id, referenceType: "Bill", createdBy: session.user.id }
                );
            }

            // Debit Expense account (COGS 5000 by default, or the linked account)
            const expenseCode = bill.expenseAccountCode ?? "5000";
            const expenseAccount = await getAccountByCode(db, storeId, expenseCode);
            if (expenseAccount) {
                await postJournalEntry(db, storeId, expenseAccount._id.toString(), "Debit", amount,
                    `Bill ${billRef} — Expense recognized from ${bill.vendorName}`,
                    { category: "Cost of Goods Sold", referenceId: id, referenceType: "Bill", createdBy: session.user.id }
                );
            }
        }

        return NextResponse.json({ message: "Bill updated successfully" });
    } catch (error: any) {
        console.error("Bill update error:", error);
        return NextResponse.json({ error: "Failed to update bill" }, { status: 500 });
    }
}

