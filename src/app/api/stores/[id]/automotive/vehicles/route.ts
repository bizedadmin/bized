import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/stores/[id]/automotive/vehicles - Get all vehicles for an automotive store
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const client = await clientPromise;
        const db = client.db();

        const vehicles = await db.collection("auto_vehicles")
            .find({ storeId: id })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ vehicles: vehicles.map(v => ({ ...v, id: v._id.toString() })) });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
    }
}

// POST /api/stores/[id]/automotive/vehicles - Create a new vehicle record
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { make, model, year, vin, plate, customerName, customerPhone } = body;

        const client = await clientPromise;
        const db = client.db();

        const vehicle = {
            storeId: id,
            make,
            model,
            year,
            vin,
            plate,
            customerName,
            customerPhone,
            status: "ready", // ready, in-service, awaiting-parts, completed
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("auto_vehicles").insertOne(vehicle);

        return NextResponse.json({
            id: result.insertedId.toString(),
            ...vehicle,
            message: "Vehicle record created successfully"
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create vehicle record" }, { status: 500 });
    }
}
