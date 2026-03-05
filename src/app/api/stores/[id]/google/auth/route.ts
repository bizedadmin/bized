import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

/**
 * GET /api/stores/[id]/google/auth
 * 
 * Generates the Google OAuth2 authorization URL for the store.
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

        const host = req.headers.get("host") || "";
        const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
        const origin = `${proto}://${host}`;
        const redirectUri = `${origin}/api/auth/callback/google`;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        );

        const scopes = [
            'https://www.googleapis.com/auth/business.manage',
            'https://www.googleapis.com/auth/content',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ];

        const { id } = await params;
        const searchParams = req.nextUrl.searchParams;
        const loginHint = searchParams.get('login_hint') || (session.user?.email as string);

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: id, // Pass store ID in state to recover it in callback
            login_hint: loginHint
        });

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Auth URL generation error:", error);
        return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
    }
}
