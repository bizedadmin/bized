import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
    const url = request.nextUrl;
    const searchParams = url.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''
        }`;

    // Get hostname (e.g. admin.localhost:3000)
    const hostname = request.headers.get('host');
    if (!hostname) return NextResponse.next();

    const subdomain = hostname.split('.')[0];

    // Admin Subdomain Handling
    if (subdomain === 'admin') {
        // 1. Check Authentication for Admin routes
        //    We allow /admin/login to be accessed without auth
        //    We also allow /api/auth routes (handled by NextAuth)
        //    Note: The rewrite happens later, so we check url.pathname which is the *visible* path.
        //    Actually, we should probably check if we are targeting the login page.

        // Check if the user is trying to access the login page or public assets/api
        const isPublicPath =
            url.pathname.startsWith('/login') ||
            url.pathname.startsWith('/api') ||
            url.pathname.startsWith('/_next') ||
            url.pathname.includes('.');

        if (!isPublicPath) {
            // Check for session token
            const token = await getToken({
                req: request,
                secret: process.env.NEXTAUTH_SECRET
            });

            if (!token) {
                // Redirect to login if not authenticated
                // Use the absolute URL for the admin subdomain
                // const loginUrl = new URL('/login', request.url); <-- this would enable admin.localhost/login
                // We want to redirect to /login on the admin subdomain.
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }

        // Rewrite to /admin internal folder
        // Note: If the user visits admin.localhost/login, we rewrite to /admin/login
        return NextResponse.rewrite(new URL(`/admin${path}`, request.url));
    }

    // Allow other requests to proceed normally (main site)
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
