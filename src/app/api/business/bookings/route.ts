
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth"; // Assuming authOptions is exported from here, verify path if needed

export async function POST(req: Request) {
    try {
        await dbConnect();

        // Optional: you might want to verify session if you require login, 
        // but for now we'll allow public bookings or handle it based on requirements.
        // const session = await getServerSession(authOptions);

        const body = await req.json();
        const {
            businessId,
            serviceId,
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            date,
            startTime,
            endTime,
            totalPrice,
            currency,
            notes
        } = body;

        // Basic validation
        if (!businessId || !serviceId || !customerName || !customerEmail || !date || !startTime) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newBooking = await Booking.create({
            businessId,
            serviceId,
            customerId, // Optional
            customerName,
            customerEmail,
            customerPhone,
            date: new Date(date),
            startTime,
            endTime,
            totalPrice,
            currency: currency || 'KES',
            notes,
            status: 'pending' // Default status
        });

        return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: 'Failed to create booking', details: error.message },
            { status: 500 }
        );
    }
}
