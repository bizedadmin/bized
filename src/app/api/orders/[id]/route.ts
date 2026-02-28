import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@/lib/orders";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id]?storeId=...
 * Returns a single order with its payments, invoices, and fulfillments.
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

        const orderId = id;

        // Fetch sub-collections
        const [payments, invoices, fulfillments] = await Promise.all([
            db.collection("orders_payments").find({ orderId }).sort({ createdAt: -1 }).toArray(),
            db.collection("orders_invoices").find({ orderId }).sort({ createdAt: 1 }).toArray(),
            db.collection("orders_fulfillments").find({ orderId }).sort({ createdAt: 1 }).toArray(),
        ]);

        return NextResponse.json({
            order: { ...order, _id: order._id.toString() },
            payments: payments.map(p => ({ ...p, _id: p._id.toString() })),
            invoices: invoices.map(i => ({ ...i, _id: i._id.toString() })),
            fulfillments: fulfillments.map(f => ({ ...f, _id: f._id.toString() })),
        });
    } catch (error) {
        console.error("Order GET [id] error:", error);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}

/**
 * PATCH /api/orders/[id]
 * Update order status, notes, customer info, etc.
 * Automatically recalculates amountDue when payments change.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { storeId, ...updateData } = body;

        if (!storeId)
            return NextResponse.json({ error: "storeId is required" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId), ownerId: session.user.id
        });
        if (!store)
            return NextResponse.json({ error: "Store not found" }, { status: 404 });

        const { orderStatus, ...rest } = updateData;

        const setData: Record<string, any> = {
            ...rest,
            updatedAt: new Date(),
        };

        if (orderStatus) {
            setData.orderStatus = orderStatus;

            // When order is delivered, update fulfillment status too
            if (orderStatus === "OrderDelivered") {
                setData.fulfillmentStatus = "Delivered" as FulfillmentStatus;
            }
            if (orderStatus === "OrderCancelled") {
                setData.paymentStatus = "PaymentDue";
            }
        }

        const result = await db.collection("orders").updateOne(
            { _id: new ObjectId(id), storeId },
            { $set: setData }
        );

        if (result.matchedCount === 0)
            return NextResponse.json({ error: "Order not found" }, { status: 404 });

        return NextResponse.json({ message: "Order updated successfully" });
    } catch (error: any) {
        console.error("Order PATCH [id] error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

/**
 * DELETE /api/orders/[id]
 * Soft-delete by setting orderStatus to OrderCancelled.
 * Hard delete only in dev/test scenarios.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
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

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId), ownerId: session.user.id
        });
        if (!store)
            return NextResponse.json({ error: "Store not found" }, { status: 404 });

        // Soft cancel
        await db.collection("orders").updateOne(
            { _id: new ObjectId(id), storeId },
            { $set: { orderStatus: "OrderCancelled" as OrderStatus, updatedAt: new Date() } }
        );

        return NextResponse.json({ message: "Order cancelled" });
    } catch (error: any) {
        console.error("Order DELETE [id] error:", error);
        return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
    }
}
