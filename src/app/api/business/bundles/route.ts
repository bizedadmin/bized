import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ServiceBundle from '@/models/ServiceBundle';
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

        const bundles = await ServiceBundle.find({ business: businessId }).populate('services.service').sort({ name: 1 });
        return NextResponse.json(bundles);
    } catch (error) {
        console.error('Error fetching bundles:', error);
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

        const bundle = await ServiceBundle.create(body);
        return NextResponse.json(bundle, { status: 201 });
    } catch (error) {
        console.error('Error creating bundle:', error);
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

        await ServiceBundle.deleteOne({ _id: id, business: businessId });
        return NextResponse.json({ message: 'Bundle deleted' });
    } catch (error) {
        console.error('Error deleting bundle:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
