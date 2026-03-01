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

        // Get all payment methods for user's stores in one shot for performance
        const storeIds = stores.map(s => s._id.toString());
        const allMethods = await db.collection("store_payment_methods")
            .find({ storeId: { $in: storeIds } })
            .sort({ sortOrder: 1 })
            .toArray();

        // Group methods by storeId
        const methodsByStore = allMethods.reduce((acc: any, pm: any) => {
            const sid = pm.storeId;
            if (!acc[sid]) acc[sid] = [];

            const method = { ...pm, id: pm.id || pm._id.toString() };
            delete method._id;
            delete method.storeId;
            if (method.apiKey) method.apiKey = "••••••••";
            if (method.publicKey) method.publicKey = "••••••••";
            if (method.webhookSecret) method.webhookSecret = "••••••••";

            acc[sid].push(method);
            return acc;
        }, {});

        return NextResponse.json({
            stores: stores.map((s) => {
                const sid = s._id.toString();
                const store = {
                    ...s,
                    _id: sid,
                    paymentMethods: methodsByStore[sid] || []
                } as any;

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
        const storeId = result.insertedId.toString();

        // Seed default Chart of Accounts with standard codes immediately
        const defaultAccounts = [
            { storeId, code: "1000", name: "Cash on Hand", type: "Asset", category: "Current Asset", status: "active", "@type": "BankAccount" },
            { storeId, code: "1200", name: "Accounts Receivable", type: "Asset", category: "Current Asset", status: "active", "@type": "AccountingService" },
            { storeId, code: "2000", name: "Accounts Payable", type: "Liability", category: "Current Liability", status: "active", "@type": "AccountingService" },
            { storeId, code: "4000", name: "Sales Revenue", type: "Revenue", category: "Operating Revenue", status: "active", "@type": "AccountingService" },
            { storeId, code: "5000", name: "Cost of Goods Sold", type: "Expense", category: "Cost of Sales", status: "active", "@type": "AccountingService" },
            { storeId, code: "3000", name: "Owner's Equity", type: "Equity", category: "Equity", status: "active", "@type": "AccountingService" }
        ].map(acc => ({ ...acc, createdAt: new Date(), updatedAt: new Date() }));

        await db.collection("finance_accounts").insertMany(defaultAccounts);

        return NextResponse.json(
            {
                id: storeId,
                slug: sanitizedSlug,
                message: "Store created successfully with default ledger accounts"
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
