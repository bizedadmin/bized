import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToFirebaseAdmin } from '@/lib/firebase-admin-upload';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const businessId = formData.get('businessId') as string;

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        if (!businessId) {
            return NextResponse.json({ message: 'Business ID is required' }, { status: 400 });
        }

        await dbConnect();
        const business = await Business.findById(businessId);

        if (!business || !business.slug) {
            return NextResponse.json({ message: 'Business not found' }, { status: 404 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}.webp`;
        const publicUrl = await uploadToFirebaseAdmin(buffer, `${business.slug}/${filename}`);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                message: 'Internal Server Error',
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
            },
            { status: 500 }
        );
    }
}
