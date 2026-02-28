import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

// GET /api/stores — list all stores for the current user
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        const stores = await db
            .collection("stores")
            .find({ ownerId: session.user.id })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            stores: stores.map((s) => {
                const store = { ...s, _id: s._id.toString() } as any;
                if (store.aiConfig) {
                    const keysToHandle = ['openaiApiKey', 'googleApiKey'];
                    for (const key of keysToHandle) {
                        if (store.aiConfig[key]) {
                            store.aiConfig[key] = "••••••••";
                        }
                    }
                }
                return store;
            }),
        });
    } catch (error) {
        console.error("List stores error:", error);
        return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, slug, industry, customIndustry, businessType } = body;

        // Validate required fields
        if (!name || !slug || !industry || !businessType) {
            return NextResponse.json(
                { error: "Missing required fields: name, slug, industry, businessType" },
                { status: 400 }
            );
        }

        // Sanitize slug
        const sanitizedSlug = slug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

        if (!sanitizedSlug) {
            return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const stores = db.collection("stores");

        // Check slug uniqueness
        const existingStore = await stores.findOne({ slug: sanitizedSlug });
        if (existingStore) {
            return NextResponse.json(
                { error: "This store link is already taken. Please choose a different one." },
                { status: 409 }
            );
        }

        // Create store document
        const store = {
            name,
            slug: sanitizedSlug,
            industry: industry === "Other" ? (customIndustry || "Other") : industry,
            businessType,
            ownerId: session.user.id,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await stores.insertOne(store);

        return NextResponse.json(
            {
                id: result.insertedId.toString(),
                slug: sanitizedSlug,
                message: "Store created successfully"
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Store creation error:", error);
        return NextResponse.json(
            { error: "Failed to create store. Please try again." },
            { status: 500 }
        );
    }
}
