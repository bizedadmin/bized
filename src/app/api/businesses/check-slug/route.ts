import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
        }

        await dbConnect();

        const existing = await Business.findOne({ slug });

        return NextResponse.json({ available: !existing });
    } catch (error) {
        console.error('Error checking slug:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
