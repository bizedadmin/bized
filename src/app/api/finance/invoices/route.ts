import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Schema.org mapping: https://schema.org/Invoice

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

        const invoices = await db
            .collection("finance_invoices")
            .find({ storeId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            invoices: invoices.map((i) => ({ ...i, _id: i._id.toString() }))
        });
    } catch (error) {
        console.error("List invoices error:", error);
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
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
            customerName,
            customerEmail,
            totalAmount,
            dueDate,
            lineItems,
            status // "Draft", "Sent", "Paid", "Overdue", "Cancelled"
        } = body;

        if (!storeId || !totalAmount || !customerName) {
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

        const invoice = {
            storeId,
            customerName,
            customerEmail,
            totalPaymentDue: parseFloat(totalAmount), // schema.org
            paymentDueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // default 14 days
            paymentStatus: status || "Draft", // schema.org
            lineItems: lineItems || [],
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            "@type": "Invoice", // schema.org
            provider: {
                "@type": "Organization",
                name: store.name
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: session.user.id
        };

        const result = await db.collection("finance_invoices").insertOne(invoice);

        return NextResponse.json(
            { id: result.insertedId.toString(), message: "Invoice created successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Invoice creation error:", error);
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
    }
}

/**
 * PATCH /api/finance/invoices
 * Update invoice status (e.g. Draft → Sent → Paid).
 * When marked as Paid, auto-posts journal entries:
 *   Credit → 4000 Sales Revenue  (revenue recognized)
 *   Credit → 1200 Accounts Receivable (AR settled — money in)
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

        // Fetch the current invoice
        const invoice = await db.collection("finance_invoices").findOne({ _id: new ObjectId(id), storeId });
        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        await db.collection("finance_invoices").updateOne(
            { _id: new ObjectId(id) },
            { $set: { paymentStatus, ...rest, updatedAt: new Date() } }
        );

        // Auto-post journal entries when invoice transitions to Paid
        if (paymentStatus === "Paid" && invoice.paymentStatus !== "Paid") {
            const { postJournalEntry, getAccountByCode } = await import("@/lib/finance");
            const amount = invoice.totalPaymentDue;
            const invoiceRef = invoice.invoiceNumber ?? id;

            // Credit Accounts Receivable (1200) — customer has paid, AR is collected
            const arAccount = await getAccountByCode(db, storeId, "1200");
            if (arAccount) {
                await postJournalEntry(db, storeId, arAccount._id.toString(), "Credit", amount,
                    `Invoice ${invoiceRef} — Payment received from ${invoice.customerName}`,
                    { category: "Sales", referenceId: id, referenceType: "Invoice", createdBy: session.user.id }
                );
            }

            // Credit Sales Revenue (4000) — revenue recognized
            const revenueAccount = await getAccountByCode(db, storeId, "4000");
            if (revenueAccount) {
                await postJournalEntry(db, storeId, revenueAccount._id.toString(), "Credit", amount,
                    `Invoice ${invoiceRef} — Sales Revenue recognized`,
                    { category: "Sales", referenceId: id, referenceType: "Invoice", createdBy: session.user.id }
                );
            }
        }

        return NextResponse.json({ message: "Invoice updated successfully" });
    } catch (error: any) {
        console.error("Invoice update error:", error);
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
    }
}

