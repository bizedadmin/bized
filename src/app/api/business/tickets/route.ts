
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
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

        // Find the business associated with the user
        // Assuming user acts as business owner or has access. 
        // We first need to find which business belongs to this user.
        // For now, let's assume we pass businessId in query params or we find based on user email.
        // Or better, we can query bookings based on the business linked to the logged-in user.

        // This part depends on how you link User -> Business. 
        // If one user has one business:
        const business = await Business.findOne({ email: session.user.email });

        // If you are storing businessId in session or user has multiple businesses, you'd adjust this.
        // Let's assume for this "Business Tickets" page context we want ALL bookings for the logged-in user's business.

        // Alternative: Pass businessId as a query param if the frontend knows it.
        const { searchParams } = new URL(req.url);
        let businessId = searchParams.get('businessId');

        if (!businessId) {
            if (business) {
                businessId = business._id;
            } else {
                return NextResponse.json({ error: 'Business not found for this user' }, { status: 404 });
            }
        }

        const tickets = await Booking.find({ businessId })
            .sort({ createdAt: -1 })
            .populate('serviceId', 'name');

        return NextResponse.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
