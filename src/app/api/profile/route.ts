import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, jobTitle, bio, website, image } = body;

        await dbConnect();

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            {
                name,
                jobTitle,
                bio,
                website,
                image
            },
            { new: true, runValidators: true }
        ).select('-password');

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
