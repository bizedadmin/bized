import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET /api/customers?storeId=...
 * Returns all customers for a store.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = req.nextUrl;
        const storeId = searchParams.get("storeId");
        if (!storeId)
            return NextResponse.json({ error: "storeId is required" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        // Security check: ensure user owns the store
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store)
            return NextResponse.json({ error: "Store not found" }, { status: 404 });

        const customers = await db.collection("customers")
            .find({ storeId })
            .sort({ updatedAt: -1 })
            .toArray();

        return NextResponse.json({
            customers: customers.map(c => ({ ...c, _id: c._id.toString() }))
        });
    } catch (error) {
        console.error("Customers GET error:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

/**
 * POST /api/customers
 * Creates a new customer (schema.org/Person compliant).
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { storeId, name, telephone, email, address } = body;

        if (!storeId || !name) {
            return NextResponse.json({ error: "Missing required fields: storeId, name" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store)
            return NextResponse.json({ error: "Store not found" }, { status: 404 });

        const customer = {
            "@context": "https://schema.org",
            "@type": "Person",
            storeId,
            name,
            telephone: telephone || null,
            email: email || null,
            address: address || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: session.user.id,
        };

        const result = await db.collection("customers").insertOne(customer);

        return NextResponse.json({
            id: result.insertedId.toString(),
            message: "Customer created successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Customers POST error:", error);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}
