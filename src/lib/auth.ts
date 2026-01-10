import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from './db';
import User from '../models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/business.manage",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                await dbConnect();
                try {
                    // Try to find user by their Google ID (which we use as _id)
                    const existingUser = await User.findById(user.id);

                    if (!existingUser) {
                        // Create new user with Google ID as the MongoDB _id
                        const newUser = await User.create({
                            _id: user.id, // Explicitly set _id to Google ID
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: 'user', // Default role
                        });
                        user.id = newUser._id.toString();
                        user.role = newUser.role;
                    } else {
                        user.id = existingUser._id.toString();
                        user.role = existingUser.role;
                    }
                    return true;
                } catch (error) {
                    console.error("Error creating user from Google login:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                // @ts-ignore
                session.accessToken = token.accessToken;
            }
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
