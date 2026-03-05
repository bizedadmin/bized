import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/encryption";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * GET /api/stores/[id]/google/profiles
 *
 * Fetches all Google Business Profile accounts and their locations.
 * Results are cached in MongoDB for 10 minutes to avoid rate limits.
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
        const forceRefresh = req.nextUrl.searchParams.get("refresh") === "1";

        const client = await clientPromise;
        const db = client.db();
        const store = await db.collection("stores").findOne({ _id: new ObjectId(id) });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // --- Return cached profiles if available and fresh ---
        const cachedAt: number | undefined = store.aiConfig?.gbpProfilesCachedAt;
        const cachedProfiles = store.aiConfig?.gbpProfilesCache;

        if (!forceRefresh && cachedAt && cachedProfiles && (Date.now() - cachedAt) < CACHE_TTL_MS) {
            return NextResponse.json({ accounts: cachedProfiles, cached: true, cachedAt });
        }

        const encryptedAccessToken = store.aiConfig?.googleAccessToken;
        const encryptedRefreshToken = store.aiConfig?.googleRefreshToken;

        if (!encryptedAccessToken) {
            return NextResponse.json({ error: "Google account not connected" }, { status: 400 });
        }

        const host = req.headers.get("host") || "";
        const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
        const redirectUri = `${proto}://${host}/api/auth/callback/google`;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        );

        const accessToken = decrypt(encryptedAccessToken);
        const refreshToken = encryptedRefreshToken ? decrypt(encryptedRefreshToken) : null;

        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
            expiry_date: store.aiConfig?.googleTokenExpiry,
        });

        // Fetch accounts
        const mybusinessaccountmanagement = google.mybusinessaccountmanagement({ version: "v1", auth: oauth2Client });
        let accountsRes;
        try {
            accountsRes = await mybusinessaccountmanagement.accounts.list();
        } catch (err: any) {
            const isQuota = err?.message?.toLowerCase().includes("quota");
            const isRateLimit = err?.code === 429 || err?.status === 429;

            if (isQuota || isRateLimit) {
                // Return cached if we have any (even stale), better than nothing
                if (cachedProfiles) {
                    return NextResponse.json({
                        accounts: cachedProfiles,
                        cached: true,
                        cachedAt,
                        warning: "quota_exceeded"
                    });
                }
                return NextResponse.json({
                    error: "quota_exceeded",
                    message: "Google API rate limit reached. Please wait a minute and try again. If this persists, you may need to increase your quota in Google Cloud Console."
                }, { status: 429 });
            }
            throw err;
        }

        const accounts = accountsRes.data.accounts || [];

        // Fetch locations per account (sequential to respect rate limits)
        const mybusiness = google.mybusinessbusinessinformation({ version: "v1", auth: oauth2Client });
        const accountsWithLocations = [];

        for (const account of accounts) {
            try {
                const locationRes = await mybusiness.accounts.locations.list({
                    parent: account.name!,
                    readMask: "name,title,storefrontAddress,websiteUri,regularHours,phoneNumbers",
                });
                accountsWithLocations.push({
                    accountId: account.name,
                    accountName: account.accountName,
                    type: account.type,
                    locations: locationRes.data.locations || [],
                });
                // Small delay between location fetches to reduce quota pressure
                await new Promise(r => setTimeout(r, 300));
            } catch {
                accountsWithLocations.push({
                    accountId: account.name,
                    accountName: account.accountName,
                    type: account.type,
                    locations: [],
                });
            }
        }

        // Cache results in MongoDB
        await db.collection("stores").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    "aiConfig.gbpProfilesCache": accountsWithLocations,
                    "aiConfig.gbpProfilesCachedAt": Date.now(),
                }
            }
        );

        return NextResponse.json({ accounts: accountsWithLocations, cached: false });
    } catch (error: any) {
        console.error("GBP Profiles Fetch Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch Google profiles" },
            { status: 500 }
        );
    }
}
