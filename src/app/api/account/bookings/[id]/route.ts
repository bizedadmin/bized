import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Booking from "@/models/Booking"
import Business from "@/models/Business"
import Service from "@/models/Service"

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookingId } = await context.params
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'businessId',
                select: 'name slug logo themeColor address industry description'
            })
            .populate({
                path: 'serviceId',
                select: 'name description duration image category unit'
            })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        // Ideally check if the booking belongs to the current user
        // Using email since customerId might not be set for all bookings
        if (booking.customerEmail !== session.user.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        return NextResponse.json(booking)
    } catch (error) {
        console.error("Error fetching booking detail:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
