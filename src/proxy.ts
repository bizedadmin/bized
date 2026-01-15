import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
    const url = request.nextUrl;

    // Get hostname (e.g. admin.localhost:3000)
    const hostname = request.headers.get('host') || "";

    // Simple logic for development and prod:
    const isAdminSubdomain = hostname.startsWith("admin.");

    if (isAdminSubdomain) {
        // Rewrite all requests to the /admin folder
        // But first, check Auth Protection

        // API Routes -> Pass through to allow NextAuth to handle them on the main domain logic
        if (url.pathname.startsWith('/api')) {
            return NextResponse.next();
        }

        // Public Assets -> Pass through
        if (
            url.pathname.startsWith('/_next') ||
            url.pathname.startsWith('/static') ||
            url.pathname.includes('.')
        ) {
            return NextResponse.next();
        }

        // Allow Login Page
        if (url.pathname.startsWith('/login')) {
            return NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url));
        }

        // --- PROTECTED ADMIN ROUTES ---
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        // 1. Not Logged In -> Redirect to Login
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // 2. Logged In, But WRONG Role -> Block
        if (token.role !== 'admin' && token.email !== 'admin@bized.app') {
            return NextResponse.redirect(new URL('/login?error=AccessDenied', request.url));
        }

        // 3. Authorized Admin -> Rewrite to Internal Folder
        return NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url));
    }

    // Main Site Handling (No subdomain / www)
    return NextResponse.next();
}

// Configure Matcher
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
