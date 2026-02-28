import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { encrypt } from "@/lib/encryption";

// GET /api/stores/[id] — fetch a single store by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(id),
            ownerId: session.user.id,
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        if (store.aiConfig) {
            if (store.aiConfig.openaiApiKey) store.aiConfig.openaiApiKey = "••••••••";
            if (store.aiConfig.googleApiKey) store.aiConfig.googleApiKey = "••••••••";
        }

        return NextResponse.json({
            store: { ...store, _id: store._id.toString() },
        });
    } catch (error) {
        console.error("Fetch store error:", error);
        return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 });
    }
}

// PATCH /api/stores/[id] — update specific fields on a store
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
        }

        const body = await req.json();

        // Allowed fields for update
        const allowedFields = [
            // Bio
            "name", "slug", "description", "title", "subtitle",
            // Category
            "industry", "businessType",
            // Theme & Appearance
            "themeColor", "secondaryColor", "coverPhotoUrl", "logoUrl",
            // Contact
            "phone", "email", "website",
            // Location
            "address", "city", "country", "locationAreas",
            // Business Info
            "openingHours", "facilities", "about",
            // Social
            "socialLinks",
            // Regional Settings & Rates
            "currency", "dateFormat", "numberFormat", "taxes",
            // Footer / Legal
            "privacyPolicyUrl", "termsUrl", "footerText",
            // List data (arrays)
            "products", "services", "reviews", "faq", "productCategories",
            // AI Configuration
            "aiConfig",
        ];

        const client = await clientPromise;
        const db = client.db();

        // Fetch existing store to handle sensitive AI fields correctly
        const existingStore = await db.collection("stores").findOne({
            _id: new ObjectId(id),
            ownerId: session.user.id,
        });

        if (!existingStore) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const updateFields: Record<string, any> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                if (key === "aiConfig") {
                    const incomingAiConfig = { ...body[key] };
                    const currentAiConfig = existingStore.aiConfig || {};
                    const mergedAiConfig = { ...currentAiConfig, ...incomingAiConfig };

                    // Handle keys: only encrypt if it's a NEW real key.
                    // If it's the masked string "••••••••", keep the existing encrypted key.
                    const keysToHandle = ['openaiApiKey', 'googleApiKey'];
                    keysToHandle.forEach(keyName => {
                        if (incomingAiConfig[keyName] === "••••••••") {
                            // Preserve existing encrypted key
                            mergedAiConfig[keyName] = currentAiConfig[keyName];
                        } else if (incomingAiConfig[keyName]) {
                            // Encrypt new key
                            mergedAiConfig[keyName] = encrypt(incomingAiConfig[keyName]);
                        }
                    });

                    updateFields[key] = mergedAiConfig;
                } else {
                    updateFields[key] = body[key];
                }
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        // If slug is being updated, sanitize and check uniqueness
        if (updateFields.slug) {
            updateFields.slug = updateFields.slug
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");

            if (!updateFields.slug) {
                return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
            }

            const existingWithSlug = await db.collection("stores").findOne({
                slug: updateFields.slug,
                _id: { $ne: new ObjectId(id) },
            });
            if (existingWithSlug) {
                return NextResponse.json(
                    { error: "This store link is already taken." },
                    { status: 409 }
                );
            }
        }

        updateFields.updatedAt = new Date();

        const result = await db.collection("stores").findOneAndUpdate(
            { _id: new ObjectId(id), ownerId: session.user.id },
            { $set: updateFields },
            { returnDocument: "after" }
        );

        if (!result) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        if (result.aiConfig) {
            if (result.aiConfig.openaiApiKey) result.aiConfig.openaiApiKey = "••••••••";
            if (result.aiConfig.googleApiKey) result.aiConfig.googleApiKey = "••••••••";
        }

        return NextResponse.json({
            store: { ...result, _id: result._id.toString() },
            message: "Store updated successfully",
        });
    } catch (error) {
        console.error("Update store error:", error);
        return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
    }
}
