import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/stores/[id]/med/patients - Get all patients for a medical store
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

        const patients = await db.collection("med_patients")
            .find({ storeId: id })
            .sort({ lastName: 1 })
            .toArray();

        return NextResponse.json({ patients: patients.map(p => ({ ...p, id: p._id.toString() })) });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
    }
}

// POST /api/stores/[id]/med/patients - Create a new patient record
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { firstName, lastName, dob, gender, phone, email, bloodGroup } = body;

        const client = await clientPromise;
        const db = client.db();

        const patient = {
            storeId: id,
            firstName,
            lastName,
            dob,
            gender,
            phone,
            email,
            bloodGroup,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("med_patients").insertOne(patient);

        return NextResponse.json({
            id: result.insertedId.toString(),
            ...patient,
            message: "Patient record created successfully"
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create patient record" }, { status: 500 });
    }
}
