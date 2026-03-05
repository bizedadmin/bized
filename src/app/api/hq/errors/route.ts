import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * POST /api/hq/errors
 * Ingests a platform error from anywhere in the app.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            message,
            stack,
            route,
            method,
            storeId,
            userId,
            severity = "error", // 'error' | 'warn' | 'info'
            context, // arbitrary extra data
        } = body;

        if (!message) {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        await db.collection("platform_errors").insertOne({
            message,
            stack: stack || null,
            route: route || req.headers.get("referer") || null,
            method: method || null,
            storeId: storeId || null,
            userId: userId || null,
            severity,
            context: context || null,
            resolved: false,
            resolvedAt: null,
            resolvedBy: null,
            createdAt: new Date(),
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[HQ Error Logger]", err);
        return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
    }
}

/**
 * GET /api/hq/errors
 * Fetch platform errors for the HQ admin.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const severity = searchParams.get("severity") || null;
        const resolved = searchParams.get("resolved");
        const search = searchParams.get("search") || null;

        const client = await clientPromise;
        const db = client.db();

        const filter: Record<string, any> = {};
        if (severity) filter.severity = severity;
        if (resolved !== null && resolved !== "") filter.resolved = resolved === "true";
        if (search) filter.message = { $regex: search, $options: "i" };

        const [errors, total] = await Promise.all([
            db.collection("platform_errors")
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray(),
            db.collection("platform_errors").countDocuments(filter)
        ]);

        return NextResponse.json({
            errors: errors.map(e => ({ ...e, _id: e._id.toString() })),
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error("[HQ Errors GET]", err);
        return NextResponse.json({ error: "Failed to fetch errors" }, { status: 500 });
    }
}
