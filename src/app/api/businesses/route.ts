import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const businesses = await Business.find({ owner: session.user.id }).sort({ createdAt: -1 });

        return NextResponse.json(businesses);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, slug } = body;


        if (!name || !slug) {
            return NextResponse.json({ message: 'Name and slug are required' }, { status: 400 });
        }

        await dbConnect();

        // Check slug uniqueness (only for non-draft businesses)
        const existing = await Business.findOne({ slug, isDraft: { $ne: true } });
        if (existing) {
            return NextResponse.json({ message: 'Business with this slug already exists' }, { status: 400 });
        }

        // Delete any existing draft for this user before creating the final business
        await Business.deleteMany({ owner: session.user.id, isDraft: true });

        const business = await Business.create({
            ...body,
            owner: session.user.id,
            pages: [
                { title: 'Profile', slug: 'profile', type: 'profile', enabled: true },
                { title: 'Bookings', slug: 'bookings', type: 'bookings', enabled: true },
                { title: 'Shop', slug: 'shop', type: 'shop', enabled: true },
                { title: 'Quote', slug: 'quote', type: 'quote', enabled: true },
            ]
        });

        return NextResponse.json(business, { status: 201 });
    } catch (error) {
        console.error('Error creating business:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error('Error details:', errorMessage, errorStack);
        return NextResponse.json({
            message: errorMessage || 'Internal Server Error',
            details: error instanceof Error ? error.toString() : String(error)
        }, { status: 500 });
    }
}
