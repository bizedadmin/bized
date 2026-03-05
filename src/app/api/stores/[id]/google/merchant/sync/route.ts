import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/encryption";
import { google } from "googleapis";
import { logPlatformError } from "@/lib/errorReporter";

/**
 * POST /api/stores/[id]/google/merchant/sync
 * 
 * Synchronizes the products from the Bized database directly to 
 * Google Merchant Center using the Content API for Shopping via custombatch.
 */
export async function POST(
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

        const { aiConfig, socialLinks, products, name: storeName, slug, currency } = store;
        const merchantId = socialLinks?.googleMerchantId;

        if (!merchantId) {
            return NextResponse.json({
                error: "Google Merchant ID not configured. Please enter your Merchant ID first."
            }, { status: 400 });
        }

        const googleAccessToken = aiConfig?.googleAccessToken ? decrypt(aiConfig.googleAccessToken) : null;
        const googleRefreshToken = aiConfig?.googleRefreshToken ? decrypt(aiConfig.googleRefreshToken) : null;

        if (!googleAccessToken && !googleRefreshToken) {
            return NextResponse.json({
                error: "Google Connection missing. Please 'Connect Google' first."
            }, { status: 400 });
        }

        if (!products || products.length === 0) {
            return NextResponse.json({ message: "No products to sync" });
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

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${slug}.bized.app`;

            // Prepare custombatch entries
            const entries = products.map((product: any, index: number) => {
                return {
                    batchId: index,
                    merchantId: merchantId,
                    method: 'insert',
                    product: {
                        offerId: `${slug}-${product.id}`,
                        title: product.name || 'Product',
                        description: product.description || product.name || 'Product description coming soon.',
                        link: `${baseUrl}/product/${product.id}`,
                        imageLink: product.image || '',
                        contentLanguage: 'en',
                        targetCountry: 'KE',
                        feedLabel: 'KE',
                        channel: 'online',
                        availability: product.isSoldOut ? 'out of stock' : 'in stock',
                        price: {
                            value: (product.price || 0).toString(),
                            currency: currency || 'KES'
                        },
                        brand: storeName || 'Bized Store',
                        condition: 'new'
                    }
                };
            });

            // Content API limits custombatch to 1000 items. 
            // We'll process in chunks of 250 just to be safe.
            const chunkSize = 250;
            let results: any[] = [];

            for (let i = 0; i < entries.length; i += chunkSize) {
                const chunk = entries.slice(i, i + chunkSize);
                const response = await content.products.custombatch({
                    requestBody: {
                        entries: chunk
                    }
                });
                results.push(...(response.data.entries || []));
            }

            const failures = results.filter(r => r.errors);
            const successCount = results.length - failures.length;

            // Log time of last merchant sync
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await db.collection("stores").updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        "socialLinks.googleMerchantSync": timestamp,
                        updatedAt: new Date()
                    }
                }
            );

            return NextResponse.json({
                success: true,
                message: `Successfully synchronized ${successCount} products.`,
                failures: failures.length > 0 ? failures.length : undefined,
                lastSynced: timestamp
            });

        } catch (googleError: any) {
            const errorMessage = googleError?.response?.data?.error?.message || "Google Merchant authentication failed.";
            console.error("Google GMC Sync Error:", googleError?.response?.data || googleError.message);

            await logPlatformError({
                message: `Merchant Sync Failed: ${errorMessage}`,
                error: googleError,
                route: `/api/stores/${id}/google/merchant/sync`,
                method: "POST",
                storeId: id,
                severity: "error",
            });

            return NextResponse.json({
                error: errorMessage,
                details: googleError?.response?.data
            }, { status: 502 });
        }

    } catch (error: any) {
        console.error("Internal Sync Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
