import { NextRequest, NextResponse } from "next/server";

const SENTRY_ORG = process.env.SENTRY_ORG_SLUG;        // e.g. "bized"
const SENTRY_PROJECT = process.env.SENTRY_PROJECT_SLUG; // e.g. "bized-production"
const SENTRY_TOKEN = process.env.SENTRY_AUTH_TOKEN;     // Internal integration token

export const dynamic = "force-dynamic";

/**
 * GET /api/hq/sentry/issues
 * Proxies Sentry Issues API to the HQ dashboard.
 */
export async function GET(req: NextRequest) {
    if (!SENTRY_TOKEN || !SENTRY_ORG || !SENTRY_PROJECT) {
        return NextResponse.json(
            { error: "Sentry is not configured. Please set SENTRY_ORG_SLUG, SENTRY_PROJECT_SLUG and SENTRY_AUTH_TOKEN in your .env." },
            { status: 503 }
        );
    }

    const { searchParams } = req.nextUrl;
    const query = searchParams.get("query") || "is:unresolved";
    const cursor = searchParams.get("cursor") || "";
    const limit = searchParams.get("limit") || "25";
    const environment = searchParams.get("environment") || "";

    const params = new URLSearchParams({
        query,
        limit,
        ...(cursor && { cursor }),
        ...(environment && { environment }),
    });

    const sentryUrl = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?${params}`;

    try {
        const res = await fetch(sentryUrl, {
            headers: {
                Authorization: `Bearer ${SENTRY_TOKEN}`,
                "Content-Type": "application/json",
            },
            next: { revalidate: 60 }, // cache for 60s
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: `Sentry API error: ${res.status}`, detail: text }, { status: res.status });
        }

        const data = await res.json();

        // Forward Sentry's pagination link header
        const link = res.headers.get("link");

        return NextResponse.json({ issues: data }, {
            headers: link ? { "x-sentry-link": link } : {}
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
