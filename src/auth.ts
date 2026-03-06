import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { initAdmin } from "@/lib/firebase-admin"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: MongoDBAdapter(clientPromise),
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

                try {
                    const admin = initAdmin()
                    const decodedToken = await admin.auth().verifyIdToken(credentials.idToken)

                    if (!decodedToken) return null

                    const client = await clientPromise
                    const db = client.db()
                    const users = db.collection("users")

                    // Use email claim or fallback to UID if it looks like an email (common for bridge tokens)
                    const rawEmail = decodedToken.email || (decodedToken.uid?.includes('@') ? decodedToken.uid : null);
                    const email = rawEmail?.toLowerCase().trim();

                    if (!email) {
                        console.warn("Authorize: No email found in token. DecodedToken:", decodedToken);
                        return null
                    }

                    const existingUser = await users.findOne({ email })

                    if (!existingUser) {
                        const newUser = {
                            email,
                            name: decodedToken.name || email.split("@")[0],
                            image: decodedToken.picture || "",
                            emailVerified: new Date(),
                            "@context": "https://schema.org",
                            "@type": "Person",
                            dateCreated: new Date(),
                            dateModified: new Date()
                        }
                        const result = await users.insertOne(newUser)
                        return {
                            id: result.insertedId.toString(),
                            email: newUser.email,
                            name: newUser.name,
                            image: newUser.image,
                            isSuperAdmin: false
                        }
                    }

                    return {
                        id: existingUser._id.toString(),
                        email: existingUser.email,
                        name: existingUser.name,
                        image: existingUser.image,
                        isSuperAdmin: existingUser.isSuperAdmin || false
                    }

                } catch (error) {
                    console.error("Firebase auth error:", error)
                    return null
                }
            }
        })
    ],
    // Override the generic config callbacks with one that hits DB to guarantee `isSuperAdmin` is fresh
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            let finalToken = token;
            if (authConfig.callbacks?.jwt) {
                finalToken = await (authConfig.callbacks.jwt as any)({ token, user, trigger, session }) || token;
            }

            // Explicitly verify super admin status via DB lookup to prevent stale JWTs
            if (finalToken?.email) {
                try {
                    const client = await clientPromise;
                    const db = client.db();
                    const dbUser = await db.collection("users").findOne({ email: finalToken.email });
                    if (dbUser) {
                        finalToken.isSuperAdmin = dbUser.isSuperAdmin === true;
                        if (!finalToken.sub || finalToken.sub !== dbUser._id.toString()) {
                            finalToken.sub = dbUser._id.toString();
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch fresh user JWT data", e);
                }
            }

            return finalToken;
        }
    }
})
