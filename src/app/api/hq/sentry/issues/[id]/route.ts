import { NextRequest, NextResponse } from "next/server";

const SENTRY_ORG = process.env.SENTRY_ORG_SLUG;
const SENTRY_TOKEN = process.env.SENTRY_AUTH_TOKEN;

export const dynamic = "force-dynamic";

/**
 * PATCH /api/hq/sentry/issues/[id]
 * Resolve or ignore a Sentry issue.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!SENTRY_TOKEN || !SENTRY_ORG) {
        return NextResponse.json({ error: "Sentry not configured" }, { status: 503 });
    }

    const { id } = await params;
    const body = await req.json();
    // body.status: "resolved" | "ignored" | "unresolved"
    const { status } = body;

    const res = await fetch(`https://sentry.io/api/0/organizations/${SENTRY_ORG}/issues/${id}/`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${SENTRY_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    });

    if (!res.ok) {
        return NextResponse.json({ error: `Sentry error: ${res.status}` }, { status: res.status });
    }

    return NextResponse.json({ ok: true });
}
