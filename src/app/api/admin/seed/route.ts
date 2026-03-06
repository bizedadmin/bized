import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { initAdmin } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    // Mock the POST request payload for a quick GET trigger via browser
    req.json = async () => ({ email: 'admin@bized.app', password: 'BizeD@1036' });
    return POST(req);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        let { email, password } = body;
        email = email.toLowerCase().trim();

        if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

        // Create/Update in Firebase
        const admin = initAdmin();
        let uid = '';
        try {
            const user = await admin.auth().createUser({ email, password });
            uid = user.uid;
        } catch (e: any) {
            if (e.code === 'auth/email-already-exists') {
                const user = await admin.auth().getUserByEmail(email);
                await admin.auth().updateUser(user.uid, { password });
                uid = user.uid;
            } else {
                throw e;
            }
        }

        // Create/Update in MongoDB
        const client = await clientPromise;
        const db = client.db();
        const users = db.collection('users');

        const existing = await users.findOne({ email });
        if (existing) {
            await users.updateOne({ email }, { $set: { isSuperAdmin: true } });
        } else {
            await users.insertOne({
                email,
                name: 'System Admin',
                isSuperAdmin: true,
                dateCreated: new Date(),
                dateModified: new Date()
            });
        }

        return NextResponse.json({ success: true, message: `Super admin ${email} seeded and synced.` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
