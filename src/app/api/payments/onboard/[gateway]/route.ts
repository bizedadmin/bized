import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { getPlatformSettings } from "@/lib/platform-settings";
import Stripe from "stripe";

/**
 * INITIATE PROGRAMMATIC ONBOARDING
 * Redirects the business owner to the gateway's hosted onboarding page.
 * Path: /api/payments/onboard/[gateway]
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ gateway: string }> }
) {
    const { gateway } = await params;
    const session = await auth();

    // 1. Auth check
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    if (!storeId) {
        return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }

    const platform = await getPlatformSettings();

    try {
        if (gateway === "stripe") {
            const stripeSecret = platform.platformPartnerKeys?.stripe?.secretKey;
            if (!stripeSecret) {
                return NextResponse.json({ error: "Stripe platform configuration missing" }, { status: 500 });
            }

            const stripe = new Stripe(stripeSecret);

            // Create atau Ambil Account
            // For now, we create a new Express account
            // In production, you might check if they already have one
            const account = await stripe.accounts.create({
                type: 'express',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    storeId,
                    userId: session.user.id || "",
                }
            });

            // Create Account Link (The Onboarding URL)
            const accountLink = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${req.nextUrl.origin}/admin/settings?onboard=refresh&gateway=stripe&storeId=${storeId}`,
                return_url: `${req.nextUrl.origin}/api/payments/callback/stripe?accountId=${account.id}&storeId=${storeId}`,
                type: 'account_onboarding',
            });

            // Save the pending ID to the database
            const client = await clientPromise;
            const db = client.db();

            await db.collection("store_payment_methods").updateOne(
                { storeId, gateway: "Stripe" },
                {
                    $set: {
                        connectedAccountId: account.id,
                        onboardingStatus: "pending"
                    }
                }
            );

            return NextResponse.redirect(accountLink.url);
        }

        // Add other gateways here (Paystack, etc.)

        return NextResponse.json({ error: "Gateway not supported for programmatic onboarding yet" }, { status: 400 });

    } catch (error: any) {
        console.error(`Onboarding error [${gateway}]:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
