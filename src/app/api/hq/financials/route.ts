import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { PlatformPlan } from "@/lib/subscriptions";

/**
 * GET /api/hq/financials
 * Aggregates platform-wide financial data for HQ dashboard.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        // HQ auth check — assume role 'admin' for now or platform owner email
        // Based on other HQ files, they often check session?.user?.id
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        // 1. Fetch all plans for pricing reference
        const plans = await db.collection("platform_plans").find({ status: "active" }).toArray() as unknown as PlatformPlan[];
        const planMap = plans.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, PlatformPlan>);

        // 2. Aggregate stores by subscription status and plan
        const storeStats = await db.collection("stores").aggregate([
            {
                $group: {
                    _id: {
                        status: "$subscription.status",
                        planId: "$subscription.planId",
                        gateway: "$subscription.gateway"
                    },
                    count: { $sum: 1 },
                    totalProducts: { $sum: { $size: { $ifNull: ["$products", []] } } }
                }
            }
        ]).toArray();

        // 3. Process MRR and Growth
        let totalMrr = 0;
        let activeSubscriptions = 0;
        let trialingSubscriptions = 0;
        const revenueByPlan: Record<string, { count: number, mrr: number }> = {};

        storeStats.forEach(stat => {
            const { status, planId } = stat._id || {};
            if (!status || !planId) return;

            const plan = planMap[planId];
            if (!plan) return;

            if (status === "active") {
                const mrr = (plan.price || 0) * stat.count;
                totalMrr += mrr;
                activeSubscriptions += stat.count;

                if (!revenueByPlan[planId]) revenueByPlan[planId] = { count: 0, mrr: 0 };
                revenueByPlan[planId].count += stat.count;
                revenueByPlan[planId].mrr += mrr;
            } else if (status === "trialing") {
                trialingSubscriptions += stat.count;
            }
        });

        // 4. Latest transactions/payouts health (if any)
        // For now, let's get recently updated stores
        const recentActivity = await db.collection("stores")
            .find({ "subscription.status": "active" })
            .sort({ "subscription.updatedAt": -1 })
            .limit(5)
            .project({ name: 1, slug: 1, subscription: 1 })
            .toArray();

        // 5. Calculate Churn (approximate: canceled in last 30 days vs total)
        const canceledCount = await db.collection("stores").countDocuments({
            "subscription.status": "canceled",
            "subscription.updatedAt": { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        return NextResponse.json({
            summary: {
                totalMrr,
                activeSubscriptions,
                trialingSubscriptions,
                churnRate30d: activeSubscriptions > 0 ? (canceledCount / activeSubscriptions) * 100 : 0
            },
            revenueByPlan,
            recentActivity,
            plans: plans.map(p => ({ id: p.id, name: p.name, price: p.price }))
        });

    } catch (error: any) {
        console.error("HQ Financials Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
