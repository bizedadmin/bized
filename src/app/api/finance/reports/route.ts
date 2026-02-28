import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET /api/finance/reports?storeId=...&from=...&to=...
 *
 * Aggregates balances live from finance_transactions (source of truth).
 * Balances are NEVER stored on finance_accounts — this is IFRS/GAAP compliant.
 *
 * Returns:
 *  - Profit & Loss (Revenue/Expense accounts, period-scoped)
 *  - Balance Sheet (Asset/Liability/Equity accounts, cumulative to date)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const storeId = searchParams.get("storeId");
        if (!storeId) {
            return NextResponse.json({ error: "storeId is required" }, { status: 400 });
        }

        // Optional date range (for P&L). Defaults to current month.
        const now = new Date();
        const fromParam = searchParams.get("from");
        const toParam = searchParams.get("to");
        const from = fromParam ? new Date(fromParam) : new Date(now.getFullYear(), now.getMonth(), 1);
        const to = toParam ? new Date(toParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const client = await clientPromise;
        const db = client.db();

        // Verify ownership
        const store = await db.collection("stores").findOne({
            _id: new ObjectId(storeId),
            ownerId: session.user.id
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // Fetch all accounts for this store (structural directory only)
        const accounts = await db
            .collection("finance_accounts")
            .find({ storeId })
            .toArray();

        // Aggregate all transactions for this store
        const allTransactions = await db
            .collection("finance_transactions")
            .find({ storeId })
            .toArray();

        // Period transactions (for P&L — Revenue and Expenses are period-scoped)
        const periodTransactions = allTransactions.filter(t => {
            const d = new Date(t.date);
            return d >= from && d <= to;
        });

        /**
         * Calculate the net balance for an account from transactions.
         * Credit = positive, Debit = negative (standard double-entry accounting).
         */
        const calcBalance = (accountId: string, txns: typeof allTransactions) => {
            return txns
                .filter(t => t.accountId === accountId)
                .reduce((sum, t) => {
                    return sum + (t.type === "Credit" ? t.amount : -t.amount);
                }, 0);
        };

        // Build P&L (period-scoped for Revenue/Expense)
        const revenue = accounts
            .filter(a => a.type === "Revenue")
            .map(a => ({
                code: a.code,
                name: a.name,
                balance: calcBalance(a._id.toString(), periodTransactions)
            }));

        const expenses = accounts
            .filter(a => a.type === "Expense")
            .map(a => ({
                code: a.code,
                name: a.name,
                balance: calcBalance(a._id.toString(), periodTransactions)
            }));

        const totalRevenue = revenue.reduce((s, a) => s + a.balance, 0);
        const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);
        const netIncome = totalRevenue - totalExpenses;

        // Build Balance Sheet (cumulative — all time up to "to" date)
        const cumulativeTxns = allTransactions.filter(t => new Date(t.date) <= to);

        const assets = accounts
            .filter(a => a.type === "Asset")
            .map(a => ({
                code: a.code,
                name: a.name,
                balance: calcBalance(a._id.toString(), cumulativeTxns)
            }));

        const liabilities = accounts
            .filter(a => a.type === "Liability")
            .map(a => ({
                code: a.code,
                name: a.name,
                balance: calcBalance(a._id.toString(), cumulativeTxns)
            }));

        const equity = accounts
            .filter(a => a.type === "Equity")
            .map(a => ({
                code: a.code,
                name: a.name,
                balance: calcBalance(a._id.toString(), cumulativeTxns)
            }));

        const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
        const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
        const totalEquity = equity.reduce((s, a) => s + a.balance, 0);

        return NextResponse.json({
            period: { from: from.toISOString(), to: to.toISOString() },
            profitAndLoss: {
                revenue,
                expenses,
                totalRevenue,
                totalExpenses,
                grossProfit: totalRevenue - (expenses.find(e => e.name === "Cost of Goods Sold")?.balance ?? 0),
                netIncome,
            },
            balanceSheet: {
                assets,
                liabilities,
                equity,
                totalAssets,
                totalLiabilities,
                totalEquity,
                // Assets = Liabilities + Equity (accounting equation check)
                balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity + netIncome)) < 0.01,
            }
        });
    } catch (error) {
        console.error("Finance reports error:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
