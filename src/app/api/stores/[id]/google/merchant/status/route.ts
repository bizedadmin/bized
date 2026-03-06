import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/encryption";
import { google } from "googleapis";

/**
 * GET /api/stores/[id]/google/merchant/status
 * 
 * Fetches real-time product statistics from Google Merchant Center
 * using the latest Merchant API v1.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(id),
            ownerId: session.user.id,
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const { aiConfig, socialLinks } = store;
        const merchantId = socialLinks?.googleMerchantId;

        if (!merchantId) {
            return NextResponse.json({
                error: "Merchant ID not configured",
                stats: { total: 0, approved: 0, issues: 0 }
            });
        }

        const googleAccessToken = aiConfig?.googleAccessToken ? decrypt(aiConfig.googleAccessToken) : null;
        const googleRefreshToken = aiConfig?.googleRefreshToken ? decrypt(aiConfig.googleRefreshToken) : null;

        if (!googleAccessToken && !googleRefreshToken) {
            return NextResponse.json({
                error: "Google account not connected",
                stats: { total: 0, approved: 0, issues: 0 }
            });
        }

        try {
            const authClient = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );

            authClient.setCredentials({
                access_token: googleAccessToken,
                refresh_token: googleRefreshToken,
                expiry_date: aiConfig?.googleTokenExpiry
            });

            // Use Latest Merchant API (Products V1)
            const merchantProducts = google.merchantapi("products_v1");

            // Fetch products with their statuses
            const response = await merchantProducts.accounts.products.list({
                parent: `accounts/${merchantId}`,
                auth: authClient,
                pageSize: 250
            });

            const products = response.data.products || [];

            let total = products.length;
            let approved = 0;
            let issues = 0;

            products.forEach(product => {
                const status = (product as any).productStatus;
                if (!status) return;

                const destinationStatus = (status.destinationStatuses || []).find((ds: any) => ds.destination === 'Shopping');

                if (destinationStatus?.status === 'APPROVED') {
                    approved++;
                } else if (destinationStatus?.status === 'DISAPPROVED') {
                    issues++;
                }
            });

            const localProductsCount = store.products?.length || 0;

            return NextResponse.json({
                success: true,
                stats: {
                    total: Math.max(total, localProductsCount),
                    approved: approved,
                    issues: issues
                }
            });

        } catch (googleError: any) {
            console.error("Google Merchant Status Error (v1):", googleError?.response?.data || googleError.message);

            return NextResponse.json({
                success: false,
                error: googleError?.response?.data?.error?.message || "Could not retrieve real-time status from Google.",
                stats: {
                    total: store.products?.length || 0,
                    approved: 0,
                    issues: 0
                }
            });
        }

    } catch (error: any) {
        console.error("Merchant Status Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
