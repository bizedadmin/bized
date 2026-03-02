import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getPlatformSettings } from "@/lib/platform-settings";
import Stripe from "stripe";

/**
 * STRIPE ONBOARDING CALLBACK
 * Finalizes the connection after the user returns from Stripe.
 * Path: /api/payments/callback/stripe
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const storeId = searchParams.get("storeId");

    if (!accountId || !storeId) {
        return NextResponse.redirect(`${req.nextUrl.origin}/admin/settings?error=missing_params`);
    }

    try {
        const platform = await getPlatformSettings();
        const stripeSecret = platform.platformPartnerKeys?.stripe?.secretKey;

        if (!stripeSecret) throw new Error("Stripe platform credentials not found");

        const stripe = new Stripe(stripeSecret);
        const account = await stripe.accounts.retrieve(accountId);

        if (account.details_submitted) {
            const client = await clientPromise;
            const db = client.db();

            await db.collection("store_payment_methods").updateOne(
                { storeId, gateway: "Stripe" },
                {
                    $set: {
                        onboardingStatus: "completed",
                        enabled: true
                    }
                }
            );

            return NextResponse.redirect(`${req.nextUrl.origin}/admin/settings?onboard=success&gateway=stripe`);
        } else {
            return NextResponse.redirect(`${req.nextUrl.origin}/admin/settings?onboard=incomplete&gateway=stripe`);
        }

    } catch (error: any) {
        console.error("Stripe callback error:", error.message);
        return NextResponse.redirect(`${req.nextUrl.origin}/admin/settings?error=stripe_callback_failed`);
    }
}
