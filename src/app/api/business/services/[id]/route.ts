import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import Business from '@/models/Business';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const service = await Service.findById(id);
        if (!service) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }

        // Verify ownership via business
        const business = await Business.findOne({ _id: service.business, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        await dbConnect();

        const service = await Service.findById(id);
        if (!service) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }

        // Verify ownership via business
        const business = await Business.findOne({ _id: service.business, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const updatedService = await Service.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const service = await Service.findById(id);
        if (!service) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }

        // Verify ownership via business
        const business = await Business.findOne({ _id: service.business, owner: session.user.id });
        if (!business) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await Service.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
