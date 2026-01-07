import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Business from '@/models/Business';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Verify business ownership
        const business = await Business.findById(id);
        if (!business || business.owner.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const products = await Product.find({ business: id }).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Verify business ownership
        const business = await Business.findById(id);
        if (!business || business.owner.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const product = await Product.create({
            ...body,
            business: id,
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
