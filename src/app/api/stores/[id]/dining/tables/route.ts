import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/stores/[id]/dining/tables - Get all tables for a store
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

        const tables = await db.collection("dining_tables")
            .find({ storeId: id })
            .sort({ number: 1 })
            .toArray();

        return NextResponse.json({ tables: tables.map(t => ({ ...t, id: t._id.toString() })) });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
    }
}

// POST /api/stores/[id]/dining/tables - Create a new table
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { number, capacity } = body;

        const client = await clientPromise;
        const db = client.db();

        const table = {
            storeId: id,
            number,
            capacity: Number(capacity) || 2,
            status: "Available",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("dining_tables").insertOne(table);

        return NextResponse.json({
            id: result.insertedId.toString(),
            ...table,
            message: "Table created successfully"
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
    }
}
