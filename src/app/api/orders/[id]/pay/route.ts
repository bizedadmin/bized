import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { StripeAdapter, PaystackAdapter, MpesaAdapter, DpoAdapter } from "@/lib/gateways";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/pay
 * Initiates an online payment session (Stripe, Paystack, M-Pesa, DPO).
 * Returns the redirection URL or request ID.
 */
export async function POST(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { paymentMethodId, successUrl, cancelUrl, customerEmail, phoneNumber } = body;

        if (!paymentMethodId) return NextResponse.json({ error: "paymentMethodId required" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        // 1. Fetch the Order
        const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // 2. Fetch the Payment Method Configuration
        const paymentMethod = await db.collection("store_payment_methods").findOne({
            storeId: order.storeId,
            id: paymentMethodId
        });

        if (!paymentMethod || !paymentMethod.enabled) {
            return NextResponse.json({ error: "Selected payment method is unavailable." }, { status: 400 });
        }

        const gatewayName = paymentMethod.gateway?.toLowerCase();
        if (!gatewayName) {
            return NextResponse.json({ error: "Selected method is not an online gateway." }, { status: 400 });
        }

        const totalAmount = order.totalPayable || order.total || 0;
        const currency = order.currency || order.priceCurrency || "USD";

        // 3. Initiate Gateway Session
        switch (gatewayName) {
            case "stripe": {
                const stripe = new StripeAdapter(paymentMethod as any);
                const session = await stripe.createCheckoutSession({
                    orderId: id,
                    amount: totalAmount,
                    currency,
                    customerEmail: customerEmail || order.customer?.email || "",
                    successUrl: successUrl || `${req.nextUrl.origin}/admin/orders/${id}?status=success`,
                    cancelUrl: cancelUrl || `${req.nextUrl.origin}/admin/orders/${id}?status=cancelled`,
                });
                return NextResponse.json({ url: session.url, sessionId: session.id });
            }

            case "paystack": {
                const paystack = new PaystackAdapter(paymentMethod as any);
                const session = await paystack.initializeTransaction({
                    orderId: id,
                    amount: totalAmount,
                    currency,
                    email: customerEmail || order.customer?.email || "customer@example.com",
                    callbackUrl: successUrl || `${req.nextUrl.origin}/admin/orders/${id}?status=success`,
                });
                return NextResponse.json({ url: session.authorization_url, reference: session.reference });
            }

            case "m-pesa":
            case "mpesa": {
                if (!phoneNumber && !order.customer?.telephone) {
                    return NextResponse.json({ error: "Phone number required for M-Pesa." }, { status: 400 });
                }
                const mpesa = new MpesaAdapter(paymentMethod as any);
                const session = await mpesa.initiateStkPush({
                    orderId: id,
                    amount: totalAmount,
                    phoneNumber: phoneNumber || order.customer?.telephone || "",
                    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/api/webhooks/mpesa`,
                });
                return NextResponse.json({ message: "STK Push sent to your phone.", checkoutRequestId: session.CheckoutRequestID });
            }

            case "dpo": {
                const dpo = new DpoAdapter(paymentMethod as any);
                const session = await dpo.createToken({
                    orderId: id,
                    amount: totalAmount,
                    currency,
                    customerEmail: customerEmail || order.customer?.email || "",
                    redirectUrl: successUrl || `${req.nextUrl.origin}/admin/orders/${id}?status=success`,
                    backUrl: cancelUrl || `${req.nextUrl.origin}/admin/orders/${id}?status=cancelled`,
                });
                return NextResponse.json({ url: session.redirectUrl, token: session.token });
            }

            default:
                return NextResponse.json({ error: "Unsupported gateway integration." }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Order payment initialization error:", error);
        return NextResponse.json({ error: error.message || "Failed to initialize payment" }, { status: 500 });
    }
}
