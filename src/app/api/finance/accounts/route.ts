import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

// Schema.org mapping:
// We align closely with "AccountingService" and "BankAccount" concepts for the Chart of Accounts.

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const storeId = req.nextUrl.searchParams.get("storeId");
        if (!storeId) {
            return NextResponse.json({ error: "storeId is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Ensure the store belongs to the user
        const store = await db.collection("stores").findOne({ _id: new (require('mongodb').ObjectId)(storeId), ownerId: session.user.id });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const accounts = await db
            .collection("finance_accounts")
            .find({ storeId })
            .sort({ name: 1 })
            .toArray();

        // If no accounts exist yet, we might want to seed default ones based on standard Chart of Accounts.
        if (accounts.length === 0) {
            const defaultAccounts = [
                { storeId, code: "1000", name: "Cash on Hand", type: "Asset", category: "Current Asset", status: "active", "@type": "BankAccount" },
                { storeId, code: "1200", name: "Accounts Receivable", type: "Asset", category: "Current Asset", status: "active", "@type": "AccountingService" },
                { storeId, code: "2000", name: "Accounts Payable", type: "Liability", category: "Current Liability", status: "active", "@type": "AccountingService" },
                { storeId, code: "4000", name: "Sales Revenue", type: "Revenue", category: "Operating Revenue", status: "active", "@type": "AccountingService" },
                { storeId, code: "5000", name: "Cost of Goods Sold", type: "Expense", category: "Cost of Sales", status: "active", "@type": "AccountingService" },
                { storeId, code: "3000", name: "Owner's Equity", type: "Equity", category: "Equity", status: "active", "@type": "AccountingService" }
            ].map(acc => ({ ...acc, createdAt: new Date(), updatedAt: new Date() }));

            await db.collection("finance_accounts").insertMany(defaultAccounts);
            return NextResponse.json({ accounts: defaultAccounts.map((a: any) => ({ ...a, _id: a._id?.toString() })) });
        }

        // Backfill logic for existing accounts missing codes
        const codeMap: Record<string, string> = {
            "Cash on Hand": "1000",
            "Accounts Receivable": "1200",
            "Accounts Payable": "2000",
            "Sales Revenue": "4000",
            "Cost of Goods Sold": "5000",
            "Owner's Equity": "3000"
        };

        const accountsWithBackfill = await Promise.all(accounts.map(async (acc) => {
            if (!acc.code && codeMap[acc.name]) {
                const code = codeMap[acc.name];
                await db.collection("finance_accounts").updateOne(
                    { _id: acc._id },
                    { $set: { code, updatedAt: new Date() } }
                );
                return { ...acc, code, _id: acc._id.toString() };
            }
            return { ...acc, _id: acc._id.toString() };
        }));

        return NextResponse.json({
            accounts: accountsWithBackfill
        });
    } catch (error) {
        console.error("List finance_accounts error:", error);
        return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { storeId, code, name, type, category, status = "active" } = body;

        if (!storeId || !name || !type || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({ _id: new (require('mongodb').ObjectId)(storeId), ownerId: session.user.id });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const accounts = db.collection("finance_accounts");

        // Based on Schema.org, we define relevant @types.
        let schemaType = "AccountingService";
        if (type === "Asset" && (name.includes("Bank") || name.toLowerCase().includes("cash"))) {
            schemaType = "BankAccount";
        }

        const account = {
            storeId,
            code,
            name,
            type,
            category,
            status,
            "@type": schemaType,
            createdBy: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await accounts.insertOne(account);

        return NextResponse.json(
            { id: result.insertedId.toString(), message: "Account created successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Account creation error:", error);
        return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, storeId, ...updateData } = body;

        if (!id || !storeId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const ObjectId = (require('mongodb').ObjectId);

        // Verify store ownership
        const store = await db.collection("stores").findOne({ _id: new ObjectId(storeId), ownerId: session.user.id });
        if (!store) {
            return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 404 });
        }

        // Check for duplicate code if code is being updated
        if (updateData.code) {
            const existingWithCode = await db.collection("finance_accounts").findOne({
                storeId,
                code: updateData.code,
                _id: { $ne: new ObjectId(id) }
            });
            if (existingWithCode) {
                return NextResponse.json({ error: "Account code already in use." }, { status: 409 });
            }
        }

        const result = await db.collection("finance_accounts").updateOne(
            { _id: new ObjectId(id), storeId },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Account updated successfully" });
    } catch (error: any) {
        console.error("Account update error:", error);
        return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
    }
}

