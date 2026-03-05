import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * PATCH /api/hq/errors/[id]
 * Mark an error as resolved (or unresolve it).
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { resolved, resolvedBy } = body;

        const client = await clientPromise;
        const db = client.db();

        await db.collection("platform_errors").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    resolved: !!resolved,
                    resolvedAt: resolved ? new Date() : null,
                    resolvedBy: resolved ? (resolvedBy || "HQ Admin") : null,
                }
            }
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[HQ Error PATCH]", err);
        return NextResponse.json({ error: "Failed to update error" }, { status: 500 });
    }
}

/**
 * DELETE /api/hq/errors/[id]
 * Permanently delete an error log entry.
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = await clientPromise;
        const db = client.db();

        await db.collection("platform_errors").deleteOne({ _id: new ObjectId(id) });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[HQ Error DELETE]", err);
        return NextResponse.json({ error: "Failed to delete error" }, { status: 500 });
    }
}
