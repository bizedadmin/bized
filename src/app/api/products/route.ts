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

        const id = searchParams.get('id');
        if (id) {
            const product = await Product.findOne({ _id: id, business: businessId });
            if (!product) {
                return NextResponse.json({ message: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json(product);
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

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, business: businessId } = body;

        if (!id || !businessId) {
            return NextResponse.json({ message: 'Product ID and Business ID are required' }, { status: 400 });
        }

        await dbConnect();

        // Verify ownership
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Business not found or unauthorized' }, { status: 404 });
        }

        const product = await Product.findOneAndUpdate(
            { _id: id, business: businessId },
            body,
            { new: true }
        );

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({
            message: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
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

        if (!id || !businessId) {
            return NextResponse.json({ message: 'Product ID and Business ID are required' }, { status: 400 });
        }

        await dbConnect();

        // Verify ownership
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Business not found or unauthorized' }, { status: 404 });
        }

        const product = await Product.findOneAndDelete({ _id: id, business: businessId });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({
            message: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
