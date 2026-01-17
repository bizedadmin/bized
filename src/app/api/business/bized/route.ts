import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Hardcoded slug for the Bized platform business
        const business = await Business.findOne({ slug: 'bized' });

        if (!business) {
            return NextResponse.json({ message: 'Business not found' }, { status: 404 });
        }

        return NextResponse.json(business);
    } catch (error) {
        console.error('Error fetching bized business:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
