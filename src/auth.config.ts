import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Export only the providers and callbacks here for middleware
// Do NOT include the MongoDB adapter here as it contains Node-specific modules like 'crypto'

export const authConfig = {
    providers: [
        Credentials({
            name: "Firebase",
            credentials: {
                idToken: { label: "ID Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.idToken || typeof credentials.idToken !== "string") {
                    return null
                }

                // Note: The actual Firebase validation and MongoDB user fetching happens 
                // in the node environment (src/auth.ts), but we need the provider definition
                // here for typing. However, because authorize() might be called in edge,
                // we'll handle the actual heavy lifting in the node auth.ts override.
                return null;
            },
        }),
    ],
    trustHost: true,
    pages: {
        signIn: '/signin',
        error: '/signin',
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
                // @ts-ignore
                session.user.isSuperAdmin = token.isSuperAdmin === true;
            }
            return session
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id
                token.isSuperAdmin = (user as any).isSuperAdmin === true;
            }
            return token
        }
    }
} satisfies NextAuthConfig;
