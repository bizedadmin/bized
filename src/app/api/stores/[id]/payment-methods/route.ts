import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { postJournalEntry, getAccountByCode } from "@/lib/finance";
import { encrypt, decrypt } from "@/lib/encryption";

type Params = { params: Promise<{ id: string }> };

/**
 * Payment Method definition.
 * Each enabled payment method maps to a dedicated COA ledger account.
 * This is the authoritative source for which payment channels the business accepts,
 * displayed on checkout, POS, and used for double-entry journal routing.
 *
 * Schema.org alignment: PaymentMethod (https://schema.org/PaymentMethod)
 */
export interface PaymentMethodConfig {
    id: string;           // stable slug: "cash", "card", "bank_transfer", "mobile_money", etc.
    name: string;         // display label: "Cash on Hand", "Credit / Debit Card"
    type: "Cash" | "CreditCard" | "BankTransfer" | "MobileMoney" | "Crypto" | "Cheque" | "Other";
    enabled: boolean;
    coaCode: string;      // maps to finance_accounts.code — e.g. "1000" for Cash
    gateway?: string;     // optional processor: "Stripe", "Paystack", "M-Pesa", etc.
    gatewayAccountId?: string; // merchant ID / account number of the gateway
    apiKey?: string;      // Secret key for the processor
    publicKey?: string;   // Public key for the processor
    webhookSecret?: string; // Webhook signing secret
    description?: string;
    icon?: string;        // emoji or icon name for UI
    sortOrder: number;
    settings?: Record<string, any>; // extra config like currency, testMode, etc.
}

/** Default payment method configurations - seeded on first GET if none exist */
const DEFAULT_PAYMENT_METHODS: Omit<PaymentMethodConfig, "id">[] = [
    {
        name: "Cash on Hand",
        type: "Cash",
        enabled: true,
        coaCode: "1000",
        description: "Physical cash payments received in person",
        icon: "💵",
        sortOrder: 1,
    },
    {
        name: "Credit / Debit Card (Stripe)",
        type: "CreditCard",
        enabled: false,
        coaCode: "1010",
        gateway: "Stripe",
        description: "Card payments via Stripe (Global)",
        icon: "💳",
        sortOrder: 2,
    },
    {
        name: "Paystack (Africa)",
        type: "CreditCard",
        enabled: false,
        coaCode: "1015",
        gateway: "Paystack",
        description: "Payments via Paystack (Nigeria, Ghana, Kenya, SA)",
        icon: "🇳🇬",
        sortOrder: 3,
    },
    {
        name: "Bank Transfer",
        type: "BankTransfer",
        enabled: false,
        coaCode: "1020",
        description: "Direct bank-to-bank transfers and wire payments",
        icon: "🏦",
        sortOrder: 4,
    },
    {
        name: "M-Pesa Express (Kenya)",
        type: "MobileMoney",
        enabled: false,
        coaCode: "1030",
        gateway: "M-Pesa",
        description: "Lipa na M-Pesa STK Push payments",
        icon: "📱",
        sortOrder: 5,
    },
    {
        name: "DPO Group (Africa)",
        type: "CreditCard",
        enabled: false,
        coaCode: "1035",
        gateway: "DPO",
        description: "Direct Pay Online - Cards and Mobile Money",
        icon: "🌍",
        sortOrder: 6,
    },
    {
        name: "Cheque",
        type: "Cheque",
        enabled: false,
        coaCode: "1040",
        description: "Cheque payments deposited to business bank account",
        icon: "📄",
        sortOrder: 7,
    },
    {
        name: "Cryptocurrency",
        type: "Crypto",
        enabled: false,
        coaCode: "1050",
        description: "Bitcoin, USDT and other digital currency payments",
        icon: "₿",
        sortOrder: 8,
    },
];

/**
 * Ensures a COA account exists for each payment method.
 * Optimized to perform a single batch check instead of N queries.
 */
async function ensurePaymentMethodAccounts(db: any, storeId: string, methods: PaymentMethodConfig[]) {
    const enabledMethods = methods.filter(m => m.enabled);
    if (enabledMethods.length === 0) return;

    const codes = enabledMethods.map(m => m.coaCode);
    const existingAccounts = await db.collection("finance_accounts")
        .find({ storeId, code: { $in: codes } })
        .toArray();

    const existingCodes = new Set(existingAccounts.map((a: any) => a.code));
    const missingMethods = enabledMethods.filter(m => !existingCodes.has(m.coaCode));

    if (missingMethods.length > 0) {
        const toInsert = missingMethods.map(method => ({
            storeId,
            code: method.coaCode,
            name: method.name,
            type: "Asset",
            category: "Current Asset",
            status: "active",
            "@type": method.type === "Cash" ? "BankAccount" : "AccountingService",
            paymentMethodId: method.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        await db.collection("finance_accounts").insertMany(toInsert);
    }
}

/**
 * GET /api/stores/[id]/payment-methods
 * Returns all payment method configurations for the store.
 * Auto-seeds defaults on first call.
 */
export async function GET(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({ _id: new ObjectId(id), ownerId: session.user.id });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        let methods = await db.collection("store_payment_methods")
            .find({ storeId: id })
            .sort({ sortOrder: 1 })
            .toArray();

        // Seed or Sync missing defaults
        const existingGateways = new Set(methods.map((m: any) => m.gateway).filter(Boolean));
        const missingDefaults = DEFAULT_PAYMENT_METHODS.filter(d =>
            d.gateway && !existingGateways.has(d.gateway)
        );

        if (methods.length === 0 || missingDefaults.length > 0) {
            const toInsert = (methods.length === 0 ? DEFAULT_PAYMENT_METHODS : missingDefaults).map((m, i) => ({
                ...m,
                id: `pm_${m.gateway?.toLowerCase() || m.type.toLowerCase()}_${Date.now()}_${i}`,
                storeId: id,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            if (toInsert.length > 0) {
                await db.collection("store_payment_methods").insertMany(toInsert as any);
                methods = await db.collection("store_payment_methods")
                    .find({ storeId: id })
                    .sort({ sortOrder: 1 })
                    .toArray();
            }
        }

        // Clean up: If a method has a gateway, ensure its name is specific (Degrouping)
        const bulkOps = [];
        for (const m of methods as any[]) {
            const oldName = m.name;
            if (m.gateway === "Stripe" && m.name.includes("Credit / Debit Card")) m.name = "Stripe";
            if (m.gateway === "M-Pesa" && m.name === "Mobile Money") m.name = "M-Pesa Express";

            if (m.name !== oldName) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: m._id },
                        update: { $set: { name: m.name } }
                    }
                });
            }
        }
        if (bulkOps.length > 0) await db.collection("store_payment_methods").bulkWrite(bulkOps);

        // Ensure COA accounts exist for each enabled method
        await ensurePaymentMethodAccounts(db, id, methods as unknown as PaymentMethodConfig[]);


        // Mask sensitive fields for the UI
        const maskedMethods = methods.map((m: any) => ({
            ...m,
            _id: m._id?.toString(),
            apiKey: m.apiKey ? "********************" : undefined,
            webhookSecret: m.webhookSecret ? "********************" : undefined,
        }));

        return NextResponse.json({ methods: maskedMethods });
    } catch (error) {
        console.error("Payment methods GET error:", error);
        return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
    }
}

/**
 * PATCH /api/stores/[id]/payment-methods
 * Update one or more payment method configurations.
 * When a method is enabled, its COA account is auto-created.
 *
 * Body: { updates: Partial<PaymentMethodConfig>[] } — each must include `id`
 */
export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { updates } = body as { updates: (Partial<PaymentMethodConfig> & { id: string })[] };

        if (!updates || !Array.isArray(updates))
            return NextResponse.json({ error: "updates array required" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({ _id: new ObjectId(id), ownerId: session.user.id });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        // Apply each update
        for (const update of updates) {
            const { id: methodId, ...fields } = update;

            // Encrypt sensitive fields if provided
            if (fields.apiKey && !fields.apiKey.includes("****")) {
                fields.apiKey = encrypt(fields.apiKey);
            }
            if (fields.webhookSecret && !fields.webhookSecret.includes("****")) {
                fields.webhookSecret = encrypt(fields.webhookSecret);
            }

            await db.collection("store_payment_methods").updateOne(
                { storeId: id, id: methodId },
                { $set: { ...fields, updatedAt: new Date() } }
            );
        }

        // Fetch updated methods and ensure COA accounts
        const methods = await db.collection("store_payment_methods")
            .find({ storeId: id })
            .sort({ sortOrder: 1 })
            .toArray();

        await ensurePaymentMethodAccounts(db, id, methods as unknown as PaymentMethodConfig[]);

        return NextResponse.json({ success: true, count: updates.length });
    } catch (error) {
        console.error("Payment methods PATCH error:", error);
        return NextResponse.json({ error: "Failed to update payment methods" }, { status: 500 });
    }
}

/**
 * POST /api/stores/[id]/payment-methods
 * Create a custom payment method (beyond the defaults).
 */
export async function POST(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, type, coaCode, gateway, apiKey, publicKey, webhookSecret, description, icon } = body;

        if (!name || !type || !coaCode)
            return NextResponse.json({ error: "name, type, coaCode required" }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({ _id: new ObjectId(id), ownerId: session.user.id });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        // Check COA code not already taken
        const existingAccount = await db.collection("finance_accounts").findOne({ storeId: id, code: coaCode });
        if (existingAccount)
            return NextResponse.json({ error: `COA code ${coaCode} is already in use by account "${existingAccount.name}"` }, { status: 409 });

        const count = await db.collection("store_payment_methods").countDocuments({ storeId: id });
        const methodId = `pm_custom_${Date.now()}`;

        const method: PaymentMethodConfig & { storeId: string; createdAt: Date; updatedAt: Date } = {
            id: methodId,
            storeId: id,
            name,
            type,
            enabled: true,
            coaCode,
            gateway,
            apiKey: apiKey ? encrypt(apiKey) : undefined,
            publicKey, // Public keys don't need encryption
            webhookSecret: webhookSecret ? encrypt(webhookSecret) : undefined,
            description,
            icon: icon || "💰",
            sortOrder: count + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("store_payment_methods").insertOne(method);
        await ensurePaymentMethodAccounts(db, id, [method]);

        return NextResponse.json({ id: methodId, message: "Payment method created" }, { status: 201 });
    } catch (error) {
        console.error("Payment methods POST error:", error);
        return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 });
    }
}

/**
 * DELETE /api/stores/[id]/payment-methods?methodId=...
 * Removes a custom payment method (protects built-in defaults).
 */
export async function DELETE(req: NextRequest, { params }: Params) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const methodId = req.nextUrl.searchParams.get("methodId");
        if (!methodId) return NextResponse.json({ error: "methodId required" }, { status: 400 });

        if (!methodId.startsWith("pm_custom_"))
            return NextResponse.json({ error: "Built-in payment methods cannot be deleted. Disable them instead." }, { status: 403 });

        const client = await clientPromise;
        const db = client.db();

        const store = await db.collection("stores").findOne({ _id: new ObjectId(id), ownerId: session.user.id });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        await db.collection("store_payment_methods").deleteOne({ storeId: id, id: methodId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Payment methods DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 });
    }
}
