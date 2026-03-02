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

        if (gateway === "paystack") {
            const secretKey = platform.platformPartnerKeys?.paystack?.secretKey;
            if (!secretKey) {
                return NextResponse.json({ error: "Paystack platform configuration missing" }, { status: 500 });
            }

            // Paystack requires bank info to create a subaccount.
            // If Missing, we redirect back with an error or show a form.
            const bankCode = searchParams.get("bankCode");
            const accountNo = searchParams.get("accountNumber");
            const businessName = searchParams.get("businessName") || "Bized Store";

            if (!bankCode || !accountNo) {
                // Redirect back to settings with a flag to show bank setup
                return NextResponse.redirect(`${req.nextUrl.origin}/admin/settings?setup=paystack_bank&storeId=${storeId}`);
            }

            const response = await fetch("https://api.paystack.co/subaccount", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    business_name: businessName,
                    settlement_bank: bankCode,
                    account_number: accountNo,
                    percentage_charge: platform.platformCommission || 0,
                }),
            });

            const data = await response.json();
            if (!data.status) {
                throw new Error(data.message || "Failed to create Paystack subaccount");
            }

            // Save subaccount code
            const client = await clientPromise;
            const db = client.db();
            await db.collection("store_payment_methods").updateOne(
                { storeId, gateway: "Paystack" },
                { $set: { connectedAccountId: data.data.subaccount_code, onboardingStatus: "completed", enabled: true } }
            );

            return NextResponse.redirect(`${req.nextUrl.origin}/admin/settings?onboard=success&gateway=paystack`);
        }

        if (gateway === "paypal") {
            const clientId = (platform.platformPartnerKeys?.paypal as any)?.clientId;
            const secret = (platform.platformPartnerKeys?.paypal as any)?.secretKey;

            if (!clientId || !secret) {
                return NextResponse.json({ error: "PayPal platform configuration missing" }, { status: 500 });
            }

            // PayPal Partner Referral logic (Simplified redirect for demo)
            // In real app, you'd call /v2/customer/partner-referrals
            return NextResponse.json({
                error: "PayPal requires Partner Referral API approval. Please contact support to link your account."
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error(`Onboarding error [${gateway}]:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
