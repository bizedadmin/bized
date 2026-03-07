import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET /api/onboarding/session?id=...
 * Fetch session (flow_token) data from Phase 1.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing session ID" }, { status: 400 });

    try {
        const client = await clientPromise;
        const db = client.db();

        // Check leads/businesses collected in Phase 1 (WhatsApp Flow 1)
        const session = await db.collection("leads").findOne({ flowToken: id });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({ businessName: session.businessName });
    } catch (e) {
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }
}
