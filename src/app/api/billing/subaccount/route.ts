import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getPlatformSettings } from "@/lib/platform-settings";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { storeId, gateway, bankCode, accountNumber, businessName, accountName } = body;

        if (!storeId || !gateway) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();
        const platform = await getPlatformSettings();

        // 1. Verify store ownership
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        let gatewayAccountId = "";

        if (gateway === "Paystack") {
            const secretKey = platform.platformPartnerKeys?.paystack?.secretKey;
            if (!secretKey) return NextResponse.json({ error: "Platform Paystack not configured" }, { status: 500 });

            const res = await fetch("https://api.paystack.co/subaccount", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    business_name: businessName || store.name,
                    settlement_bank: bankCode,
                    account_number: accountNumber,
                    percentage_charge: platform.platformCommission || 5,
                    description: `Bized Subaccount for ${store.name}`
                })
            });

            const data = await res.json();
            if (!data.status) throw new Error(data.message || "Paystack subaccount creation failed");
            gatewayAccountId = data.data.subaccount_code;
        }
        else if (gateway === "Stripe") {
            const secretKey = platform.platformPartnerKeys?.stripe?.secretKey;
            if (!secretKey) return NextResponse.json({ error: "Platform Stripe not configured" }, { status: 500 });

            const Stripe = (await import("stripe")).default;
            const stripe = new Stripe(secretKey);

            // Create a Standard Connect Account for simplicity (merchants manage their own dashboard)
            const account = await stripe.accounts.create({
                type: 'standard',
                email: session.user.email as string,
                business_profile: { name: store.name },
                metadata: { storeId }
            });

            gatewayAccountId = account.id;

            // Generate onboarding link
            const accountLink = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${req.nextUrl.origin}/admin/settings?tab=payments&status=refresh`,
                return_url: `${req.nextUrl.origin}/admin/settings?tab=payments&status=success`,
                type: 'account_onboarding',
            });

            return NextResponse.json({ gatewayAccountId, onboardingUrl: accountLink.url });
        }

        // Update the payment method for this store
        await db.collection("store_payment_methods").updateOne(
            { storeId: storeId, gateway: gateway },
            { $set: { gatewayAccountId, updatedAt: new Date() } }
        );

        return NextResponse.json({ gatewayAccountId, message: "Subaccount linked successfully" });

    } catch (error: any) {
        console.error("Subaccount creation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
