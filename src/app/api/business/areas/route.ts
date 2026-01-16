import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ServiceArea from '@/models/ServiceArea';
import Business from '@/models/Business';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        await dbConnect();
        const areas = await ServiceArea.find({ business: businessId }).sort({ name: 1 });
        return NextResponse.json(areas);
    } catch (error) {
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
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) return NextResponse.json({ message: 'Unauthorized' }, { status: 404 });

        const area = await ServiceArea.create(body);
        return NextResponse.json(area, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const businessId = searchParams.get('businessId');

        await dbConnect();
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) return NextResponse.json({ message: 'Unauthorized' }, { status: 404 });

        await ServiceArea.deleteOne({ _id: id, business: businessId });
        return NextResponse.json({ message: 'Area deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
