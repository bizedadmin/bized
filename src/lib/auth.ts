import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import dbConnect from './db';
import User from '../models/User';
import { adminAuth } from './firebase-admin';
import { AuditService } from './audit';

export const authOptions: NextAuthOptions = {
    providers: [
        // 1. Firebase Credentials Provider (For "Login with Google" via Firebase)
        CredentialsProvider({
            id: 'firebase-google',
            name: 'Firebase Google',
            credentials: {
                idToken: { label: 'ID Token', type: 'text' },
                accessToken: { label: 'Access Token', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.idToken) return null;

                try {
                    // Verify the Firebase ID Token
                    const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
                    const { uid, email, name, picture } = decodedToken;

                    await dbConnect();

                    // Find or Create User in MongoDB
                    let user = await User.findOne({ email });

                    if (!user) {
                        user = await User.create({
                            _id: uid,
                            name: name || email?.split('@')[0] || 'User',
                            email,
                            image: picture,
                            role: 'user',
                            provider: 'firebase',
                        });
                    }

                    // Return user object for NextAuth session
                    const sessionUser = {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        accessToken: credentials.accessToken,
                    };

                    // AUDIT LOG: Successful Login
                    await AuditService.log({
                        actor: {
                            id: sessionUser.id,
                            email: sessionUser.email,
                            role: sessionUser.role,
                            // IP/UserAgent not easily accessible in authorize() without complex request passing
                            // but we log the core event
                        },
                        action: {
                            type: 'AUTH_LOGIN',
                            description: 'User logged in via Firebase/Google',
                        },
                        status: 'SUCCESS',
                        severity: 'INFO'
                    });

                    return sessionUser;
                } catch (error) {
                    console.error('Firebase Auth Error:', error);
                    return null;
                }
            }
        }),

        // 2. Legacy/Fallback Email Provider (Optional, if you want email/pass)
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // ... Implementation for email/pass if needed, 
                // but for now we focus on Firebase Google
                return null;
            }
        }),

        // Keeping these for legacy reference, but they won't work without keys
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "legacy-placeholder",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "legacy-placeholder",
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || "legacy-placeholder",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "legacy-placeholder",
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            try {
                await dbConnect();
                const dbUser = await User.findOne({ email: user.email });
                if (dbUser && dbUser.status === 'suspended') {
                    return false; // SOC 2: Block access for suspended accounts
                }
                if (dbUser) {
                    dbUser.lastActive = new Date();
                    await dbUser.save();
                }
                return true;
            } catch (error) {
                console.error("SignIn Callback Error:", error);
                return true; // Allow sign in as fallback
            }
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                if ((user as any).accessToken) {
                    token.accessToken = (user as any).accessToken;
                }
            }
            // Dynamic update if session is updated
            if (trigger === "update") {
                if (session?.role) token.role = session.role;
                if (session?.accessToken) token.accessToken = session.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            // @ts-ignore
            session.accessToken = token.accessToken;
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
