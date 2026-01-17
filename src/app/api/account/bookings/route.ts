
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Business from "@/models/Business"; // Ensure Business model is registered
import Service from "@/models/Service";   // Ensure Service model is registered

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch bookings for the logged-in user with populated Business and Service details
        const bookings = await Booking.find({ customerEmail: session.user.email })
            .sort({ date: -1 })
            .populate('businessId', 'name slug logo')
            .populate('serviceId', 'name price currency duration');

        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
