import { NextRequest, NextResponse } from "next/server";
import { getWabaProfile, getWabaAccounts, getWabaPhoneNumbers } from "@/lib/meta";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    try {
        const { accessToken, sessionId } = await req.json();

        // 1. Fetch WABA ID and Phone ID for this token
        const accounts = await getWabaAccounts(accessToken);
        const wabaId = accounts.data[0]?.id;

        const phones = await getWabaPhoneNumbers(wabaId, accessToken);
        const phoneNumberId = phones.data[0]?.id;

        // 2. Phase 3: Zero-Input Profile Harvest
        const profile = await getWabaProfile(phoneNumberId, accessToken);

        // 3. Update MongoDB
        const client = await clientPromise;
        const db = client.db();

        // Find the lead from Phase 1 and upgrade to a business
        const lead = await db.collection("leads").findOne({ flowToken: sessionId });

        await db.collection("businesses").updateOne(
            { wabaId: wabaId },
            {
                $set: {
                    name: lead?.businessName || profile.name,
                    wabaId: wabaId,
                    phoneNumberId: phoneNumberId,
                    accessToken: accessToken, // Encrypt in production
                    address: profile.address,
                    email: profile.email,
                    vertical: profile.vertical,
                    about: profile.about,
                    profilePicture: profile.profile_picture_url,
                    onboardingPhase: 4,
                    status: "PROVISIONED"
                }
            },
            { upsert: true }
        );

        // 4. Trigger Phase 4: Operational Config Flow
        // This is typically a POST to /messages with the operational_config_v1 template

        return NextResponse.json({ success: true, businessId: wabaId });

    } catch (error: any) {
        console.error("Provisioning Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
