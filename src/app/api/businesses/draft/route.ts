import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Business from '@/models/Business';

// Create or update draft business
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();

        // Remove empty industry to avoid validation error
        const cleanBody = { ...body }
        if (cleanBody.industry === '') {
            delete cleanBody.industry
        }

        // Check if user already has a draft
        const existingDraft = await Business.findOne({
            owner: session.user.id,
            isDraft: true
        });

        if (existingDraft) {
            // Update existing draft
            Object.assign(existingDraft, cleanBody);
            await existingDraft.save();
            return NextResponse.json(existingDraft);
        }

        // Create new draft
        const draft = await Business.create({
            ...cleanBody,
            owner: session.user.id,
            isDraft: true,
            setupCompleted: false
        });

        return NextResponse.json(draft, { status: 201 });
    } catch (error) {
        console.error('Error saving draft:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Get user's draft
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const draft = await Business.findOne({
            owner: session.user.id,
            isDraft: true
        });

        if (!draft) {
            return NextResponse.json({ message: 'No draft found' }, { status: 404 });
        }

        return NextResponse.json(draft);
    } catch (error) {
        console.error('Error fetching draft:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
