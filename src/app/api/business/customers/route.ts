import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Business from "@/models/Business";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        let businessId = searchParams.get('businessId');

        if (!businessId) {
            const business = await Business.findOne({ email: session.user.email });
            if (business) {
                businessId = business._id;
            } else {
                return NextResponse.json({ error: 'Business not found' }, { status: 404 });
            }
        }

        const customers = await Customer.find({ businessId })
            .sort({ createdAt: -1 });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await req.json();

        if (!data.businessId) {
            const business = await Business.findOne({ email: session.user.email });
            if (business) {
                data.businessId = business._id;
            } else {
                return NextResponse.json({ error: 'Business not found' }, { status: 404 });
            }
        }

        // Generate identifier if not provided
        if (!data.identifier) {
            const count = await Customer.countDocuments({ businessId: data.businessId });
            data.identifier = `CUST-${(count + 1).toString().padStart(4, '0')}`;
        }

        const customer = await Customer.create(data);
        return NextResponse.json(customer, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Customer with this email already exists' }, { status: 400 });
        }
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
