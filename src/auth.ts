
import NextAuth from "next-auth" // v5
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb" // Adjust path as needed
import { initAdmin } from "@/lib/firebase-admin"
import { MongoClient } from "mongodb"

export const { handlers, auth, signIn, signOut } = NextAuth({
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

                    // Check if user exists in MongoDB, if not create/update
                    const client = await clientPromise
                    const db = client.db()
                    const users = db.collection("users")

                    const email = decodedToken.email
                    if (!email) {
                        return null
                    }

                    const existingUser = await users.findOne({ email })

                    if (!existingUser) {
                        // Create new user
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
                            image: newUser.image
                        }
                    } else {
                        // User found
                    }

                    return {
                        id: existingUser._id.toString(),
                        email: existingUser.email,
                        name: existingUser.name,
                        image: existingUser.image
                    }

                } catch (error) {
                    console.error("Firebase auth error:", error)
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: "jwt", // Credentials provider requires JWT
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
            }
            return token
        }
    },
    pages: {
        signIn: '/signin',
        error: '/signin', // Error code passed in query string as ?error=
    }
})
