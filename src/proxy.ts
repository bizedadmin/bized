import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export async function proxy(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // Define the subdomain we are looking for
    const isPlatformSubdomain =
        hostname.startsWith("platform.") || hostname === "platform.localhost:3000";

    // Check authentication using next-auth
    const session = await auth();

    if (isPlatformSubdomain) {
        // If accessing the platform subdomain and NOT logged in, redirect to platform login
        if (!session && url.pathname !== "/login") {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // If logged in, check if they have the super admin role
        if (session) {
            // NOTE: We need to ensure the `isSuperAdmin` flag is added to the user's session in auth.ts
            const isSuperAdmin = (session.user as any)?.isSuperAdmin === true;

            // Ensure that `/login` does not cause a redirect loop if already super admin
            if (!isSuperAdmin && url.pathname !== "/login") {
                // Not a super admin, deny access
                return new NextResponse("Unauthorized. Super Admin Access Required.", {
                    status: 403,
                });
            }

            if (isSuperAdmin && url.pathname === "/login") {
                // Already logged in, redirect away from login
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // Rewrite to our hidden platform route group
        // Example: platform.bized.app/dashboard -> bized.app/hq/dashboard
        const targetUrl = req.nextUrl.clone();
        targetUrl.pathname = `/hq${url.pathname === "/" ? "" : url.pathname}`;

        return NextResponse.rewrite(targetUrl);
    }

    // Not a platform request, allow it to continue normally
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
