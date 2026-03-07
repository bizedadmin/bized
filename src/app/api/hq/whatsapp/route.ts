import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

/**
 * GET /api/hq/whatsapp
 * Fetch all businesses that have connected WhatsApp Business API
 * restricted to Super Admins (HQ)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Basic check for super admin (assuming session.user has this field based on existing HQ patterns)
        if (!session?.user?.id || !(session.user as any).isSuperAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        const connectedBusinesses = await db.collection("businesses")
            .find({
                $or: [
                    { "socialLinks.whatsappConnected": true },
                    { "socialLinks.whatsappBusiness": { $exists: true } }
                ]
            })
            .project({
                _id: 1,
                name: 1,
                slug: 1,
                "socialLinks.whatsappBusiness": 1,
                "socialLinks.whatsappConnected": 1,
                "socialLinks.whatsappWabaId": 1,
                ownerId: 1
            })
            .toArray();

        return NextResponse.json({
            businesses: connectedBusinesses,
            total: connectedBusinesses.length,
            metaAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
            configId: process.env.NEXT_PUBLIC_META_COMMERCE_CONFIG_ID
        });
    } catch (error) {
        console.error("HQ WhatsApp Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
