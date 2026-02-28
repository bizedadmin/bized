import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Schema.org mapping:
// We align with "TransferAction" for money movement between accounts.

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

        // Check store ownership
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const transactions = await db
            .collection("finance_transactions")
            .find({ storeId })
            .sort({ date: -1 })
            .toArray();

        return NextResponse.json({
            transactions: transactions.map((t) => ({ ...t, _id: t._id.toString() }))
        });
    } catch (error) {
        console.error("List transactions error:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
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
            description,
            amount,
            date,
            type, // "Debit" or "Credit"
            accountId,
            category,
            referenceId,
            referenceType // "Order", "Invoice", "Bill", "Manual"
        } = body;

        if (!storeId || !amount || !accountId || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Check store ownership
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const transaction = {
            storeId,
            description: description || "Manual Transaction",
            amount: parseFloat(amount),
            date: date ? new Date(date) : new Date(),
            type,
            accountId,
            category,
            referenceId,
            referenceType: referenceType || "Manual",
            "@type": "TransferAction", // Schema.org
            createdBy: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("finance_transactions").insertOne(transaction);

        // Note: balances are NOT stored on accounts. They are calculated on-demand
        // by aggregating finance_transactions in the Reports API (IFRS/GAAP compliant).

        return NextResponse.json(
            { id: result.insertedId.toString(), message: "Transaction recorded successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Transaction creation error:", error);
        return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
    }
}
