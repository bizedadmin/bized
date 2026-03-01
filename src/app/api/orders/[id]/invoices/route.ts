import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { PaymentStatus } from "@/lib/orders";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id]/invoices?storeId=...
 * Returns all invoices for this order (an order can have multiple invoices).
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

        const invoices = await db.collection("finance_invoices")
            .find({ orderId: id, storeId })
            .sort({ createdAt: 1 })
            .toArray();

        return NextResponse.json({
            invoices: invoices.map(i => ({ ...i, _id: i._id.toString() }))
        });
    } catch (error) {
        console.error("Order invoices GET error:", error);
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }
}

/**
 * POST /api/orders/[id]/invoices
 * Creates an additional invoice for this order.
 *
 * Use cases:
 * - Split invoices (deposit + final)
 * - Revised invoice after order amendment
 * - Advance invoice for a booking
 *
 * schema.org/Invoice
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
            totalPaymentDue,
            priceCurrency = "USD",
            description,
            lineItems,
            paymentDueDate,
        } = body;

        if (!storeId || totalPaymentDue == null)
            return NextResponse.json(
                { error: "Missing required fields: storeId, totalPaymentDue" },
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

        // Generate invoice number: INV-<orderNumber>-<seq>
        const existingCount = await db.collection("finance_invoices")
            .countDocuments({ orderId: id });
        const invoiceNumber = `${order.orderNumber}-INV-${String(existingCount + 1).padStart(2, "0")}`;

        const invoice = {
            "@type": "Invoice",   // schema.org
            orderId: id,
            orderNumber: order.orderNumber,
            storeId,
            invoiceNumber,
            paymentStatus: "PaymentDue" as PaymentStatus,
            totalPaymentDue: parseFloat(totalPaymentDue),
            priceCurrency,
            paymentDueDate: paymentDueDate ? new Date(paymentDueDate) : null,
            description: description ?? `Invoice for ${order.orderNumber}`,
            lineItems: lineItems ?? [],
            customerName: order.customer?.name || "Guest",
            customerEmail: order.customer?.email || null,
            // Customer (denormalised from order for standalone invoice rendering)
            customer: order.customer,
            seller: order.seller,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: session.user.id,
        };

        const result = await db.collection("finance_invoices").insertOne(invoice);

        return NextResponse.json({
            id: result.insertedId.toString(),
            invoiceNumber,
            message: "Invoice created successfully",
        }, { status: 201 });
    } catch (error: any) {
        console.error("Order invoice POST error:", error);
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
    }
}
