import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
        }

        // 1. Verify the Firebase ID Token
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        await dbConnect();

        // 2. Find or Create User in MongoDB
        // Note: We use the Firebase UID as the MongoDB _id if possible, or we store the firebaseUid field.
        // Since _id changes are hard, we'll try to find by email first.
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            // We use the Firebase UID as the _id to make it easy to match later
            user = await User.create({
                _id: uid,
                name: name || email?.split('@')[0] || 'User',
                email,
                image: picture,
                role: email === 'admin@bized.app' ? 'admin' : 'user', // <--- Auto-assign admin role
                provider: 'firebase-google',
            });
        } else {
            // Update existing user with latest info if needed
            // If the user existed but didn't have a firebase link, we essentially trust the email match
        }

        // 3. We are not setting a cookie here because NextAuth runs on the client/middleware.
        // The client will use this success response to know "Okay, the server knows me".
        // HOWEVER, NextAuth needs its own session.
        // The cleanest way is to use a Custom Credentials Provider on the server that takes this ID Token.

        return NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Firebase Login Error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
}
