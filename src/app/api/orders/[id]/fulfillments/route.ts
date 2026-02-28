import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { FulfillmentStatus, DeliveryMode } from "@/lib/orders";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id]/fulfillments?storeId=...
 * Returns all shipments/fulfillments for this order.
 * An order can have multiple partial shipments (schema.org/ParcelDelivery).
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

        const fulfillments = await db.collection("orders_fulfillments")
            .find({ orderId: id, storeId })
            .sort({ createdAt: 1 })
            .toArray();

        return NextResponse.json({
            fulfillments: fulfillments.map(f => ({ ...f, _id: f._id.toString() }))
        });
    } catch (error) {
        console.error("Order fulfillments GET error:", error);
        return NextResponse.json({ error: "Failed to fetch fulfillments" }, { status: 500 });
    }
}

/**
 * POST /api/orders/[id]/fulfillments
 * Creates a new shipment for this order (partial or full).
 *
 * schema.org/ParcelDelivery
 *
 * Business logic:
 * - Insert the fulfillment into orders_fulfillments
 * - Recalculate the parent order's fulfillmentStatus
 *   (Pending → Processing → Shipped → Delivered based on all fulfillments)
 * - Update orderStatus to OrderShipped if first tracked shipment is posted
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
            trackingNumber,
            carrier,
            trackingUrl,
            deliveryMode = "Delivery",
            itemIndexes = [],
            expectedArrivalFrom,
            expectedArrivalUntil,
            notes,
        } = body;

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

        const fulfillment = {
            "@type": "ParcelDelivery",   // schema.org
            orderId: id,
            orderNumber: order.orderNumber,
            storeId,
            trackingNumber: trackingNumber ?? null,
            carrier: carrier ?? null,
            trackingUrl: trackingUrl ?? null,
            deliveryStatus: "Packed" as FulfillmentStatus,
            deliveryMode: deliveryMode as DeliveryMode,
            itemIndexes,
            expectedArrivalFrom: expectedArrivalFrom ? new Date(expectedArrivalFrom) : null,
            expectedArrivalUntil: expectedArrivalUntil ? new Date(expectedArrivalUntil) : null,
            shippedAt: null,
            deliveredAt: null,
            notes: notes ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: session.user.id,
        };

        const result = await db.collection("orders_fulfillments").insertOne(fulfillment);

        // Update parent order fulfillmentStatus
        // If any fulfillment has a trackingNumber → order is at least "Shipped"
        const allFulfillments = await db.collection("orders_fulfillments")
            .find({ orderId: id, storeId })
            .toArray();

        const allDelivered = allFulfillments.every(f => f.deliveryStatus === "Delivered");
        const anyShipped = allFulfillments.some(f => f.deliveryStatus === "Shipped" || f.trackingNumber);
        const anyPacked = allFulfillments.some(f => f.deliveryStatus === "Packed");

        const newFulfillmentStatus: FulfillmentStatus =
            allDelivered ? "Delivered" :
                anyShipped ? "Shipped" :
                    anyPacked ? "Packed" :
                        "Processing";

        const newOrderStatus =
            allDelivered ? "OrderDelivered" :
                anyShipped ? "OrderShipped" :
                    order.orderStatus;

        await db.collection("orders").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    fulfillmentStatus: newFulfillmentStatus,
                    orderStatus: newOrderStatus,
                    updatedAt: new Date(),
                }
            }
        );

        return NextResponse.json({
            id: result.insertedId.toString(),
            fulfillmentStatus: newFulfillmentStatus,
            message: "Fulfillment created successfully",
        }, { status: 201 });
    } catch (error: any) {
        console.error("Order fulfillment POST error:", error);
        return NextResponse.json({ error: "Failed to create fulfillment" }, { status: 500 });
    }
}

/**
 * PATCH /api/orders/[id]/fulfillments
 * Update the status of a specific fulfillment (e.g. Packed → Shipped → Delivered).
 * Body must include { fulfillmentId, deliveryStatus }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { storeId, fulfillmentId, deliveryStatus } = body;

        if (!storeId || !fulfillmentId || !deliveryStatus)
            return NextResponse.json({ error: "Missing: storeId, fulfillmentId, deliveryStatus" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        const statusUpdate: Record<string, any> = {
            deliveryStatus,
            updatedAt: new Date(),
        };

        if (deliveryStatus === "Shipped") statusUpdate.shippedAt = new Date();
        if (deliveryStatus === "Delivered") statusUpdate.deliveredAt = new Date();

        await db.collection("orders_fulfillments").updateOne(
            { _id: new ObjectId(fulfillmentId), orderId: id },
            { $set: statusUpdate }
        );

        // Recalculate parent order status
        const allFulfillments = await db.collection("orders_fulfillments")
            .find({ orderId: id })
            .toArray();

        const allDelivered = allFulfillments.every(f =>
            f._id.toString() === fulfillmentId ? deliveryStatus === "Delivered" : f.deliveryStatus === "Delivered"
        );
        const anyShipped = allFulfillments.some(f =>
            f._id.toString() === fulfillmentId ? ["Shipped", "Delivered"].includes(deliveryStatus) : ["Shipped", "Delivered"].includes(f.deliveryStatus)
        );

        const newFulfillmentStatus: FulfillmentStatus = allDelivered ? "Delivered" : anyShipped ? "Shipped" : "Packed";
        const newOrderStatus = allDelivered ? "OrderDelivered" : anyShipped ? "OrderShipped" : "OrderProcessing";

        await db.collection("orders").updateOne(
            { _id: new ObjectId(id) },
            { $set: { fulfillmentStatus: newFulfillmentStatus, orderStatus: newOrderStatus, updatedAt: new Date() } }
        );

        return NextResponse.json({ message: "Fulfillment updated", fulfillmentStatus: newFulfillmentStatus });
    } catch (error: any) {
        console.error("Order fulfillment PATCH error:", error);
        return NextResponse.json({ error: "Failed to update fulfillment" }, { status: 500 });
    }
}
