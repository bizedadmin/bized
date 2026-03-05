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
 * using the Content API for Shopping.
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

            const content = google.content({
                version: 'v2.1',
                auth: authClient
            });

            // Get product statuses
            const response = await content.productstatuses.list({
                merchantId: merchantId,
                maxResults: 250
            });

            const productStatuses = response.data.resources || [];

            let total = productStatuses.length;
            let approved = 0;
            let issues = 0;

            productStatuses.forEach(status => {
                const destinationStatuses = status.destinationStatuses || [];
                const shoppingAdStatus = destinationStatuses.find(ds => ds.destination === 'Shopping');

                if (shoppingAdStatus?.status === 'approved') {
                    approved++;
                } else if (shoppingAdStatus?.status === 'disapproved') {
                    issues++;
                }
            });

            // If the local database has products, but GMC is empty, total should reflect total potential
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
            console.error("Google Merchant Status Error:", googleError?.response?.data || googleError.message);

            // Fallback to local stats if Google API fails or permissions are missing
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
