import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { encrypt } from "@/lib/encryption";
import { logPlatformError } from "@/lib/errorReporter";

/**
 * GET /api/auth/callback/google
 * 
 * Handles the Google OAuth2 callback, exchanges code for tokens,
 * and saves them to the store.
 */
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is our Store ID

    if (!code || !state) {
        return NextResponse.redirect(new URL('/admin/storefront/google?error=missing_code', req.url));
    }

    try {
        const host = req.headers.get("host") || "";
        const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
        const origin = `${proto}://${host}`;
        const redirectUri = `${origin}/api/auth/callback/google`;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        );

        const { tokens } = await oauth2Client.getToken(code);

        // We only care about the refresh_token for persistent access
        // If it's not present (user already consented), we might need to prompt for consent again
        // but we'll try to use what we get.

        const client = await clientPromise;
        const db = client.db();

        // Save the access_token (or refresh_token if available) to the store
        // We'll encrypt it before saving
        const encryptedToken = encrypt(tokens.access_token || "");
        const refreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;

        await db.collection("stores").updateOne(
            { _id: new ObjectId(state) },
            {
                $set: {
                    "socialLinks.googleConnected": true,
                    "aiConfig.googleAccessToken": encryptedToken,
                    "aiConfig.googleRefreshToken": refreshToken,
                    "aiConfig.googleTokenExpiry": tokens.expiry_date,
                    // For backward compatibility with the existing sync route:
                    "aiConfig.googleApiKey": encryptedToken
                }
            }
        );

        return NextResponse.redirect(new URL('/admin/storefront/google?success=connected', req.url));
    } catch (error: any) {
        console.error("Google Auth Callback Error:", error);
        await logPlatformError({
            message: `Google OAuth Callback Failed: ${error?.message || "Unknown"}`,
            error,
            route: "/api/auth/callback/google",
            method: "GET",
            severity: "error",
            context: { state },
        });
        return NextResponse.redirect(new URL('/admin/storefront/google?error=auth_failed', req.url));
    }
}
