import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
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

        const invoices = await Invoice.find({ provider: businessId })
            .sort({ createdAt: -1 });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
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

        const payload = { ...data };

        // Generate identifier if not provided
        if (!payload.identifier) {
            const count = await Invoice.countDocuments({ provider: payload.provider });
            payload.identifier = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        }

        const invoice = await Invoice.create(payload);
        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
