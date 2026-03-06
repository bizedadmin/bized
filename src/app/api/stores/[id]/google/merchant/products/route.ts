import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/encryption";
import { google } from "googleapis";

/**
 * GET /api/stores/[id]/google/merchant/products
 * 
 * Fetches local products and merges them with real-time status from GMC
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

        const localProducts = store.products || [];
        const { aiConfig, socialLinks } = store;
        const merchantId = socialLinks?.googleMerchantId;

        // If no GMC ID, just return local products with 'Never Synced' status
        if (!merchantId || !aiConfig?.googleAccessToken) {
            return NextResponse.json({
                products: localProducts.map((p: any) => ({
                    ...p,
                    gmcStatus: 'never_synced',
                    issues: []
                }))
            });
        }

        try {
            const googleAccessToken = decrypt(aiConfig.googleAccessToken);
            const googleRefreshToken = aiConfig?.googleRefreshToken ? decrypt(aiConfig.googleRefreshToken) : null;

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

            // Fetch GMC products with their statuses
            const response = await merchantProducts.accounts.products.list({
                parent: `accounts/${merchantId}`,
                auth: authClient,
                pageSize: 250
            });

            const gmcProducts = response.data.products || [];

            // Map statuses by offerId
            const statusMap = new Map();
            gmcProducts.forEach(p => {
                const status = (p as any).productStatus;
                const shoppingStatus = status?.destinationStatuses?.find((d: any) => d.destination === 'Shopping');

                // offerId in v1 is part of the name or a separate field
                const offerId = p.offerId;
                if (offerId) {
                    statusMap.set(offerId, {
                        status: shoppingStatus?.status?.toLowerCase() || 'pending',
                        issues: status?.itemLevelIssues || []
                    });
                }
            });

            // Merge local products
            const productsWithStatus = localProducts.map((p: any) => {
                const offerId = p.sku || `${store.slug}-${p.id}`;
                const gmcInfo = statusMap.get(offerId);

                return {
                    ...p,
                    offerId,
                    gmcStatus: gmcInfo?.status || 'never_synced',
                    issues: gmcInfo?.issues || []
                };
            });

            return NextResponse.json({ products: productsWithStatus });

        } catch (error: any) {
            console.error("GMC Products Sync Error (v1):", error?.response?.data || error.message);
            // Fallback to local
            return NextResponse.json({
                products: localProducts.map((p: any) => ({
                    ...p,
                    gmcStatus: 'error',
                    issues: []
                }))
            });
        }

    } catch (error: any) {
        console.error("Products Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
