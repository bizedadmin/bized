import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Order, OrderStatus, FulfillmentStatus, PaymentStatus } from "@/lib/orders";

/**
 * GET /api/orders?storeId=...&status=...&channel=...&from=...&to=...
 * Returns all orders for the store, with optional filters.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = req.nextUrl;
        const storeId = searchParams.get("storeId");
        if (!storeId)
            return NextResponse.json({ error: "storeId is required" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store)
            return NextResponse.json({ error: "Store not found" }, { status: 404 });

        // Build filter
        const filter: Record<string, any> = { storeId };
        const status = searchParams.get("status");
        const channel = searchParams.get("channel");
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (status) filter.orderStatus = status;
        if (channel) filter.orderChannel = channel;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        const orders = await db.collection("orders")
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            orders: orders.map(o => ({ ...o, _id: o._id.toString() }))
        });
    } catch (error) {
        console.error("Orders GET error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

/**
 * POST /api/orders
 * Creates a new order (schema.org/Order compliant).
 * Also creates the first invoice for the order if totalPayable > 0.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const {
            storeId,
            customer,
            orderedItem,
            price,
            priceCurrency = "USD",
            taxTotal = 0,
            discountTotal = 0,
            shippingCost = 0,
            deliveryAddress,
            deliveryMode = "Delivery",
            orderChannel = "Online",
            notes,
            tags,
            paymentMethod,
        } = body;

        if (!storeId || !customer?.name || !orderedItem?.length || price == null) {
            return NextResponse.json({ error: "Missing required fields: storeId, customer.name, orderedItem[], price" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store)
            return NextResponse.json({ error: "Store not found" }, { status: 404 });

        const totalPayable = price + taxTotal + shippingCost - discountTotal;

        // Generate order number: ORD-YYYYMMDD-NNNN
        const today = new Date();
        const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
        const count = await db.collection("orders").countDocuments({ storeId });
        const orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, "0")}`;

        const order = {
            "@context": "https://schema.org",
            "@type": "Order",
            orderNumber,
            storeId,
            orderStatus: "OrderPaymentDue" as OrderStatus,
            customer: {
                "@type": customer["@type"] ?? "Person",
                name: customer.name,
                telephone: customer.telephone ?? null,
                email: customer.email ?? null,
                address: customer.address ?? null,
            },
            orderedItem: (orderedItem as any[]).map(item => ({
                "@type": "OrderItem",
                productId: item.productId ?? null,
                name: item.name,
                sku: item.sku ?? null,
                image: item.image ?? null,
                orderQuantity: item.orderQuantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal ?? item.orderQuantity * item.unitPrice,
                lineDiscount: item.lineDiscount ?? 0,
                taxRate: item.taxRate ?? 0,
                orderItemStatus: "OrderProcessing" as OrderStatus,
                requiresBooking: item.requiresBooking ?? false,
                bookingTime: item.bookingTime ?? null,
                scheduledTime: item.scheduledTime ?? null,
                deliveryMode: item.deliveryMode ?? deliveryMode,
            })),
            price,
            priceCurrency,
            taxTotal,
            discountTotal,
            shippingCost,
            totalPayable,
            amountPaid: 0,
            amountDue: totalPayable,
            paymentStatus: "PaymentDue" as PaymentStatus,
            deliveryAddress: deliveryAddress ?? null,
            deliveryMode,
            fulfillmentStatus: "Pending" as FulfillmentStatus,
            orderChannel,
            seller: {
                "@type": "Organization",
                storeId,
                name: store.name,
            },
            notes: notes ?? null,
            tags: tags ?? [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: session.user.id,
        };

        const result = await db.collection("orders").insertOne(order);
        const orderId = result.insertedId.toString();

        // ─── Payment Gateway Integration ──────────────────────────────────────────
        let checkoutUrl: string | null = null;
        if (paymentMethod && ["Stripe", "Paystack", "M-Pesa", "DPO", "Adyen", "PayPal"].includes(paymentMethod)) {
            try {
                const { getGatewayAdapter } = await import("@/lib/gateways");
                const adapter = await getGatewayAdapter(storeId, paymentMethod, db);

                const host = req.headers.get("host") || "localhost:3000";
                const protocol = host.includes("localhost") ? "http" : "https";
                const baseUrl = `${protocol}://${host}`;

                if (paymentMethod === "Stripe") {
                    const session = await (adapter as any).createCheckoutSession({
                        orderId,
                        amount: totalPayable,
                        currency: priceCurrency,
                        customerEmail: customer.email,
                        successUrl: `${baseUrl}/${store.slug}/checkout?status=success&orderId=${orderId}`,
                        cancelUrl: `${baseUrl}/${store.slug}/checkout?status=cancel&orderId=${orderId}`,
                    });
                    checkoutUrl = session.url;
                } else if (paymentMethod === "PayPal") {
                    const session = await (adapter as any).createOrder({
                        orderId,
                        amount: totalPayable,
                        currency: priceCurrency,
                        returnUrl: `${baseUrl}/${store.slug}/checkout?status=success&orderId=${orderId}`,
                        cancelUrl: `${baseUrl}/${store.slug}/checkout?status=cancel&orderId=${orderId}`,
                    });
                    checkoutUrl = session.url;
                } else if (paymentMethod === "Adyen") {
                    const session = await (adapter as any).createSessions({
                        orderId,
                        amount: totalPayable,
                        currency: priceCurrency,
                        returnUrl: `${baseUrl}/${store.slug}/checkout?status=success&orderId=${orderId}`,
                    });
                    checkoutUrl = session.url;
                } else if (paymentMethod === "Paystack") {
                    const session = await (adapter as any).initializeTransaction({
                        orderId,
                        amount: totalPayable,
                        currency: priceCurrency,
                        email: customer.email || "customer@example.com",
                        callbackUrl: `${baseUrl}/${store.slug}/checkout?status=success&orderId=${orderId}`,
                    });
                    checkoutUrl = session.authorization_url;
                } else if (paymentMethod === "DPO") {
                    const session = await (adapter as any).createToken({
                        orderId,
                        amount: totalPayable,
                        currency: priceCurrency,
                        customerEmail: customer.email || "customer@example.com",
                        redirectUrl: `${baseUrl}/${store.slug}/checkout?status=success&orderId=${orderId}`,
                        backUrl: `${baseUrl}/${store.slug}/checkout?status=cancel&orderId=${orderId}`,
                    });
                    checkoutUrl = session.redirectUrl;
                } else if (paymentMethod === "M-Pesa") {
                    await (adapter as any).initiateStkPush({
                        orderId,
                        amount: totalPayable,
                        phoneNumber: customer.telephone || "",
                        callbackUrl: `${baseUrl}/api/webhooks/mpesa?orderId=${orderId}`,
                    });
                    // M-Pesa is async on phone, no checkoutUrl needed
                }
            } catch (gatewayError) {
                console.error(`Error initializing ${paymentMethod} checkout:`, gatewayError);
                // We still created the order, so we continue but without a checkoutUrl
            }
        }

        // Auto-create the first Invoice for this order
        const invoiceNumber = `INV-${orderNumber}`;
        await db.collection("finance_invoices").insertOne({
            "@type": "Invoice",
            orderId,
            storeId,
            orderNumber,
            invoiceNumber,
            customerName: customer.name,
            customerEmail: customer.email ?? null,
            paymentStatus: "PaymentDue" as PaymentStatus,
            totalPaymentDue: totalPayable,
            paymentDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
            priceCurrency,
            description: `Invoice for order ${orderNumber}`,
            lineItems: (orderedItem as any[]).map(i => ({
                description: `${i.name} × ${i.orderQuantity}`,
                amount: i.lineTotal ?? i.orderQuantity * i.unitPrice,
            })),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: session.user.id,
        });

        return NextResponse.json({
            id: orderId,
            orderNumber,
            checkoutUrl,
            message: "Order created successfully"
        }, { status: 201 });
    } catch (error: any) {
        console.error("Orders POST error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
