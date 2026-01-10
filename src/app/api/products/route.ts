import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
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

        // Verify ownership
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Business not found or unauthorized' }, { status: 404 });
        }

        const products = await Product.find({ business: businessId }).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
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

        if (!businessId) {
            return NextResponse.json({ message: 'Business ID is required' }, { status: 400 });
        }

        await dbConnect();

        // Verify ownership
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Business not found or unauthorized' }, { status: 404 });
        }

        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({
            message: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
