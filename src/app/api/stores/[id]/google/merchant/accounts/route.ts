import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/encryption";
import { google } from "googleapis";

/**
 * GET /api/stores/[id]/google/merchant/accounts
 * 
 * Programmatically discovers Google Merchant Center accounts 
 * accessible to the authorized user using the latest Merchant API v1.
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

        const { aiConfig } = store;
        const googleAccessToken = aiConfig?.googleAccessToken ? decrypt(aiConfig.googleAccessToken) : null;
        const googleRefreshToken = aiConfig?.googleRefreshToken ? decrypt(aiConfig.googleRefreshToken) : null;

        if (!googleAccessToken && !googleRefreshToken) {
            return NextResponse.json({
                error: "Google account not connected",
                accounts: []
            });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: googleAccessToken,
            refresh_token: googleRefreshToken,
            expiry_date: aiConfig?.googleTokenExpiry
        });

        // Use Latest Merchant API (Accounts V1)
        const merchantAccounts = google.merchantapi("accounts_v1");

        // List accounts accessible to this user
        const response = await merchantAccounts.accounts.list({
            auth: oauth2Client
        });

        const accounts = (response.data.accounts || []).map(acc => ({
            id: acc.name?.split('/').pop(),
            name: acc.accountName || `Merchant Account ${acc.name?.split('/').pop()}`,
            fullName: acc.name,
            isAggregator: (acc as any).accountManagementType === 'AGGREGATOR'
        }));

        return NextResponse.json({
            success: true,
            accounts
        });

    } catch (error: any) {
        console.error("Merchant Account Discovery Error:", error?.response?.data || error.message);
        return NextResponse.json({
            error: error?.response?.data?.error?.message || error.message || "Failed to discover accounts",
            accounts: []
        }, { status: 500 });
    }
}

// POST /api/stores/[id]/google/merchant/accounts endpoint removed.
// Tenants now create their own accounts at merchants.google.com and link them to Bized.
