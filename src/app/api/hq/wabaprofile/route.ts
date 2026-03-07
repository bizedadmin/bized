import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWabaProfile, updateWabaProfile, getWabaPhoneNumbers, getWabaAccountDetails } from "@/lib/meta";

// Helper to resolve Phone Number ID from environment ID (which could be WABA or Phone ID)
async function resolvePhoneNumberId(id: string, accessToken: string) {
    const profile = await getWabaProfile(id, accessToken);
    if (!profile.error) return id;

    const phoneNumbers = await getWabaPhoneNumbers(id, accessToken);
    if (phoneNumbers.data && phoneNumbers.data.length > 0) {
        return phoneNumbers.data[0].id;
    }
    return null;
}

/**
 * GET /api/hq/wabaprofile
 * Fetch the platform's WhatsApp Business profile.
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id || !(session.user as any).isSuperAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const accessToken = process.env.TEST!;
        const initialId = process.env.NUM_ID!;

        if (!accessToken || !initialId) {
            return NextResponse.json({
                error: "Platform WABA not configured in environment.",
                details: "Missing TEST (token) or NUM_ID (WABA or Phone ID)"
            }, { status: 500 });
        }

        const phoneNumberId = await resolvePhoneNumberId(initialId, accessToken);
        if (!phoneNumberId) {
            return NextResponse.json({ error: "Could not resolve a valid Phone Number ID." }, { status: 400 });
        }

        const data = await getWabaProfile(phoneNumberId, accessToken);

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        // Fetch phone number details for confirmation
        const phoneNumbers = await getWabaPhoneNumbers(initialId, accessToken);
        const currentPhone = phoneNumbers.data?.find((p: any) => p.id === phoneNumberId);

        // Fetch WABA account details (Real business name, etc)
        const account = await getWabaAccountDetails(initialId, accessToken);

        return NextResponse.json({
            ...(data.data[0] || {}),
            display_phone_number: currentPhone?.display_phone_number || null,
            quality_rating: currentPhone?.quality_rating || null,
            status: currentPhone?.status || null,
            business_name: account?.name || null,
            timezone_id: account?.timezone_id || null,
            currency: account?.currency || null
        });
    } catch (error: any) {
        console.error("HQ WABA Profile Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST /api/hq/wabaprofile
 * Update the platform's WhatsApp Business profile.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || !(session.user as any).isSuperAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const accessToken = process.env.TEST!;
        const initialId = process.env.NUM_ID!;

        if (!accessToken || !initialId) {
            return NextResponse.json({ error: "Platform WABA not configured in environment." }, { status: 500 });
        }

        const phoneNumberId = await resolvePhoneNumberId(initialId, accessToken);
        if (!phoneNumberId) {
            return NextResponse.json({ error: "Could not resolve a valid Phone Number ID." }, { status: 400 });
        }

        const body = await req.json();

        // Clean up empty fields
        const profileUpdates: any = {
            messaging_product: "whatsapp",
            about: body.about,
            address: body.address,
            description: body.description,
            email: body.email,
            vertical: body.vertical,
            websites: body.websites || []
        };

        const result = await updateWabaProfile(phoneNumberId, accessToken, profileUpdates);

        if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error("HQ WABA Profile Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
