import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AddOn from '@/models/AddOn';
import Business from '@/models/Business';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ message: 'Business ID is required' }, { status: 400 });
        }

        await dbConnect();

        const addons = await AddOn.find({ business: businessId }).sort({ name: 1 });
        return NextResponse.json(addons);
    } catch (error) {
        console.error('Error fetching addons:', error);
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
        const { business: businessId } = body;

        await dbConnect();

        // Verify ownership
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Business not found or unauthorized' }, { status: 404 });
        }

        const addon = await AddOn.create(body);
        return NextResponse.json(addon, { status: 201 });
    } catch (error) {
        console.error('Error creating addon:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const businessId = searchParams.get('businessId');

        await dbConnect();

        // Verify ownership
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Business not found or unauthorized' }, { status: 404 });
        }

        await AddOn.deleteOne({ _id: id, business: businessId });
        return NextResponse.json({ message: 'Add-on deleted' });
    } catch (error) {
        console.error('Error deleting addon:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
