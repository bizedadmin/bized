import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        console.log("TEST SESSION API:", JSON.stringify(session, null, 2));
        return NextResponse.json({ session });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
