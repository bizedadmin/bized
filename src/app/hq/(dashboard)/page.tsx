import { Activity, Server, ShieldCheck, Users } from "lucide-react";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function getPlatformStats() {
    const client = await clientPromise;
    const db = client.db();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
        totalBusinesses,
        totalUsers,
        settings,
        gmvAggregation,
        mrrAggregation,
        recentBusinessesCount,
        topBusinessesAgg,
        recentActivity
    ] = await Promise.all([
        db.collection("businesses").countDocuments(),
        db.collection("users").countDocuments(),
        db.collection("platform_settings").findOne({ _id: "global" as any }),
        // Calculate Total GMV (Gross Merchandise Value) from all completed/processing orders across all stores
        db.collection("orders").aggregate([
            { $match: { orderStatus: { $nin: ["Cancelled", "Returned", "Refunded"] } } },
            { $group: { _id: null, totalGMV: { $sum: "$totalPayable" } } }
        ]).toArray(),
        // Calculate MRR from active subscriptions (Preparation for Phase 7)
        db.collection("subscriptions").aggregate([
            { $match: { status: "active" } },
            { $group: { _id: null, totalMRR: { $sum: "$monthlyPrice" } } }
        ]).toArray(),
        // Calculate Growth (New signups past 30 days)
        db.collection("businesses").countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        }),
        // Top Growing Businesses (by GMV volume)
        db.collection("orders").aggregate([
            { $match: { orderStatus: { $nin: ["Cancelled", "Returned", "Refunded"] } } },
            { $group: { _id: "$storeId", totalGMV: { $sum: "$totalPayable" }, orderCount: { $sum: 1 } } },
            { $sort: { totalGMV: -1 } },
            { $limit: 5 }
        ]).toArray(),
        // Recent Platform Activity (Latest business registrations)
        db.collection("businesses").find().sort({ createdAt: -1 }).limit(5).toArray()
    ]);

    // Format Top Businesses by joining with business data
    const topBusinesses = [];
    for (const agg of topBusinessesAgg) {
        if (!agg._id) continue;
        const business = await db.collection("businesses").findOne({ _id: new ObjectId(agg._id) });
        if (business) {
            topBusinesses.push({
                name: business.name,
                gmv: agg.totalGMV,
                id: agg._id.toString()
            });
        }
    }

    const gmv = gmvAggregation[0]?.totalGMV || 0;
    const mrr = mrrAggregation[0]?.totalMRR || 0;

    return {
        totalBusinesses,
        totalUsers,
        gmv,
        mrr,
        recentBusinessesCount,
        topBusinesses,
        recentActivity: recentActivity.map((b: any) => ({
            id: b._id.toString(),
            name: b.name,
            createdAt: b.createdAt || b._id.getTimestamp()
        })),
        maintenanceMode: settings?.maintenanceMode || false
    };
}

export default async function PlatformOverview() {
    const stats = await getPlatformStats();

    return (
        <div className="space-y-6">

            {stats.maintenanceMode && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-medium text-red-500">
                        System Maintenance Mode is currently active. Standard users cannot log into their businesses.
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Platform Overview</h1>
                <p className="text-zinc-400">System metrics and high-level health.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Businesses"
                    value={stats.totalBusinesses.toString()}
                    icon={<Server className="w-4 h-4 text-zinc-400" />}
                    trend={`+${stats.recentBusinessesCount} in the last 30 days`}
                    trendUp={stats.recentBusinessesCount > 0}
                />
                <StatCard
                    title="Platform MRR"
                    value={`$${stats.mrr.toLocaleString()}`}
                    icon={<Activity className="w-4 h-4 text-zinc-400" />}
                    trend="From active subscriptions"
                    trendUp={stats.mrr > 0}
                />
                <StatCard
                    title="Total GMV Processed"
                    value={`$${stats.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<Activity className="w-4 h-4 text-zinc-400" />}
                    trend="Across all platform stores"
                    trendUp={stats.gmv > 0}
                />
                <StatCard
                    title="System Status"
                    value="Healthy"
                    icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
                    trend="All services operational"
                    trendUp={true}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
                    <h3 className="font-semibold text-white mb-4">Recent Business Signups</h3>
                    <div className="flex flex-col gap-3 flex-1">
                        {stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                            <Server className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{activity.name}</p>
                                            <p className="text-xs text-zinc-500">New business registered</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {new Date(activity.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-zinc-400 h-full flex items-center justify-center">No recent activity detected.</div>
                        )}
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
                    <h3 className="font-semibold text-white mb-4">Top Grossing Businesses</h3>
                    <div className="flex flex-col gap-3 flex-1">
                        {stats.topBusinesses.length > 0 ? (
                            stats.topBusinesses.map((bz, idx) => (
                                <div key={bz.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400 flex items-center justify-center">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm font-medium text-white">{bz.name}</p>
                                    </div>
                                    <div className="text-sm font-bold text-emerald-400">
                                        ${bz.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-zinc-400 h-full flex items-center justify-center">No transaction data yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-zinc-400">{title}</h3>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className={`text-xs mt-1 ${trendUp ? "text-emerald-500" : "text-red-500"}`}>
                    {trend}
                </p>
            </div>
        </div>
    );
}
