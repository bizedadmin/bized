import { NextRequest, NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform-settings";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    const platform = await getPlatformSettings();
    const secretKey = platform.platformPartnerKeys?.paystack?.secretKey;
    if (!secretKey) return NextResponse.json({ error: "Missing secret key" }, { status: 400 });

    const body = await req.json();
    const hash = crypto.createHmac('sha512', secretKey).update(JSON.stringify(body)).digest('hex');

    if (hash !== req.headers.get('x-paystack-signature')) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { event, data } = body;
    const client = await clientPromise;
    const db = client.db();

    switch (event) {
        case "subscription.create":
        case "charge.success": {
            // For Paystack, we check metadata or reference
            const { storeId, planId, type } = data.metadata || {};
            if (type === "subscription" && storeId && planId) {
                await db.collection("stores").updateOne(
                    { _id: new ObjectId(storeId) },
                    {
                        $set: {
                            subscription: {
                                planId,
                                status: "active",
                                gateway: "Paystack",
                                externalSubscriptionId: data.subscription_code || data.reference,
                                externalCustomerId: data.customer.customer_code,
                                cancelAtPeriodEnd: false,
                                updatedAt: new Date()
                            }
                        }
                    }
                );
            }
            break;
        }
        case "subscription.disable": {
            await db.collection("stores").updateOne(
                { "subscription.externalSubscriptionId": data.subscription_code },
                {
                    $set: {
                        "subscription.status": "canceled",
                        "subscription.updatedAt": new Date()
                    }
                }
            );
            break;
        }
    }

    return NextResponse.json({ received: true });
}
