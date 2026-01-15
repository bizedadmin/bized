import dbConnect from "@/lib/db";
import SystemError from "@/models/SystemError";

export async function logApiError(req: Request, error: any, status: number = 500, metadata: any = {}) {
    try {
        await dbConnect();

        const url = new URL(req.url);
        const path = url.pathname;
        const method = req.method;

        let message = "Unknown error";
        let stack = undefined;

        if (error instanceof Error) {
            message = error.message;
            stack = error.stack;
        } else if (typeof error === "string") {
            message = error;
        } else {
            message = JSON.stringify(error);
        }

        await SystemError.create({
            path,
            method,
            status,
            message,
            stack,
            metadata,
        });

        console.error(`[API Error] ${method} ${path} (${status}):`, message);
    } catch (logError) {
        console.error("Failed to log API error:", logError);
    }
}
