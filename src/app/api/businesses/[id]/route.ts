import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        await dbConnect();

        const business = await Business.findOne({
            _id: resolvedParams.id,
            owner: session.user.id
        }).lean();

        if (!business) {
            return NextResponse.json({ message: 'Business not found' }, { status: 404 });
        }

        return NextResponse.json(business);
    } catch (error) {
        console.error('Error fetching business:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const params = await props.params;
        const body = await req.json();

        console.log(`[PUT Business] Updating business ${params.id} for user ${session.user.id}`);
        console.log(`[PUT Business] Payload:`, body);

        // Prevent updating critical fields
        delete body.owner;
        delete body._id;
        delete body.createdAt;
        delete body.updatedAt;
        delete body.slug; // Prevent slug updates to avoid unique index issues and broken links

        await dbConnect();

        console.log('[PUT Business] DB Connected, attempting update...');

        const business = await Business.findOneAndUpdate(
            { _id: params.id, owner: session.user.id },
            { $set: body },
            { new: true, runValidators: true, strict: false }
        );

        if (!business) {
            console.log('[PUT Business] Business not found or user not owner');
            return NextResponse.json({ message: 'Business not found' }, { status: 404 });
        }

        console.log('[PUT Business] Update successful');
        return NextResponse.json(business);
    } catch (error) {
        console.error('Error updating business:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
    }
}
