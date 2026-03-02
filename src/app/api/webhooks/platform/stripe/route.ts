import { NextRequest, NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform-settings";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature");
    const platform = await getPlatformSettings();
    const webhookSecret = platform.platformPartnerKeys?.stripe?.webhookSecret;

    if (!sig || !webhookSecret) {
        return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    let event;
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(platform.platformPartnerKeys?.stripe?.secretKey || "");

    try {
        const body = await req.text();
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as any;
            const { storeId, planId } = session.metadata;

            if (storeId && planId) {
                await db.collection("stores").updateOne(
                    { _id: new ObjectId(storeId) },
                    {
                        $set: {
                            subscription: {
                                planId,
                                status: "active",
                                gateway: "Stripe",
                                externalSubscriptionId: session.subscription,
                                externalCustomerId: session.customer,
                                cancelAtPeriodEnd: false,
                                updatedAt: new Date()
                            }
                        }
                    }
                );
            }
            break;
        }
        case "customer.subscription.deleted": {
            const subscription = event.data.object as any;
            await db.collection("stores").updateOne(
                { "subscription.externalSubscriptionId": subscription.id },
                {
                    $set: {
                        "subscription.status": "canceled",
                        "subscription.updatedAt": new Date()
                    }
                }
            );
            break;
        }
        case "customer.subscription.updated": {
            const subscription = event.data.object as any;
            await db.collection("stores").updateOne(
                { "subscription.externalSubscriptionId": subscription.id },
                {
                    $set: {
                        "subscription.status": subscription.status,
                        "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
                        "subscription.cancelAtPeriodEnd": subscription.cancel_at_period_end,
                        "subscription.updatedAt": new Date()
                    }
                }
            );
            break;
        }
    }

    return NextResponse.json({ received: true });
}
