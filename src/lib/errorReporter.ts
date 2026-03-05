/**
 * Platform Error Reporter
 *
 * Call this utility throughout the app (API routes, server actions)
 * to log errors to the centralised HQ error tracker.
 *
 * Usage:
 *   import { logPlatformError } from "@/lib/errorReporter";
 *   await logPlatformError({ message: "Something broke", route: "/api/stores/sync", error: err });
 */

interface LogErrorOptions {
    message: string;
    error?: unknown;
    route?: string;
    method?: string;
    storeId?: string;
    userId?: string;
    severity?: "error" | "warn" | "info";
    context?: Record<string, unknown>;
}

export async function logPlatformError(opts: LogErrorOptions): Promise<void> {
    const { message, error, route, method, storeId, userId, severity = "error", context } = opts;

    let stack: string | undefined;
    if (error instanceof Error) {
        stack = error.stack;
    }

    // Determine the base URL for the internal API call
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        await fetch(`${baseUrl}/api/hq/errors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                stack,
                route,
                method,
                storeId,
                userId,
                severity,
                context,
            }),
        });
    } catch (fetchErr) {
        // Never throw — logging must never break the main flow
        console.error("[errorReporter] Failed to report error:", fetchErr);
    }
}
