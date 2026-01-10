import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
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

        const categories = await Category.find({ business: businessId }).sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
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
        const { business: businessId, name } = body;

        if (!businessId || !name) {
            return NextResponse.json({ message: 'Business ID and Name are required' }, { status: 400 });
        }

        await dbConnect();

        // Verify ownership
        const business = await Business.findOne({ _id: businessId, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Business not found or unauthorized' }, { status: 404 });
        }

        // Check for duplicates
        const existing = await Category.findOne({ business: businessId, name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return NextResponse.json({ message: 'Category already exists' }, { status: 409 });
        }

        const category = await Category.create(body);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({
            message: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
