import { Db } from "mongodb";

/**
 * postJournalEntry
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared utility to write an immutable journal entry to `finance_transactions`.
 * All financial events in the system (Invoice paid, Bill paid, manual entry)
 * must funnel through this function to guarantee ledger consistency.
 *
 * @param db         - MongoDB Db instance
 * @param storeId    - The store this entry belongs to
 * @param accountId  - The `finance_accounts._id` (as string) being debited/credited
 * @param type       - "Credit" (money in) or "Debit" (money out)
 * @param amount     - Positive number
 * @param description - Human-readable journal memo
 * @param opts       - Optional metadata (category, referenceId, referenceType, date)
 */
export async function postJournalEntry(
    db: Db,
    storeId: string,
    accountId: string,
    type: "Credit" | "Debit",
    amount: number,
    description: string,
    opts?: {
        category?: string;
        referenceId?: string;
        referenceType?: "Invoice" | "Bill" | "Order" | "Manual";
        date?: Date;
        createdBy?: string;
    }
) {
    const entry = {
        storeId,
        accountId,
        type,
        amount: Math.abs(amount),
        description,
        category: opts?.category ?? "General",
        referenceId: opts?.referenceId ?? null,
        referenceType: opts?.referenceType ?? "Manual",
        date: opts?.date ?? new Date(),
        "@type": "TransferAction", // schema.org
        createdBy: opts?.createdBy ?? "system",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    return db.collection("finance_transactions").insertOne(entry);
}

/**
 * getAccountByCode
 * ─────────────────────────────────────────────────────────────────────────────
 * Looks up a finance_account by its COA code (e.g. "1200" for AR).
 * Returns null if not found — callers should handle gracefully.
 */
export async function getAccountByCode(db: Db, storeId: string, code: string) {
    return db.collection("finance_accounts").findOne({ storeId, code });
}
