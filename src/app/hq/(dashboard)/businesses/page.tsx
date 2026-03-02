import clientPromise from "@/lib/mongodb";
import Link from "next/link";
import { Search, Info, Ban, CheckCircle } from "lucide-react";
import { BusinessSearch } from "./_components/BusinessSearch";

async function getBusinesses(query?: string) {
    const client = await clientPromise;
    const db = client.db();

    let filter = {};
    if (query) {
        filter = {
            $or: [
                { name: { $regex: query, $options: "i" } },
                { subdomain: { $regex: query, $options: "i" } }
            ]
        };
    }

    const businesses = await db.collection("businesses").find(filter).sort({ createdAt: -1 }).toArray();

    // Fetch all payment methods for these businesses
    const storeIds = businesses.map(b => b._id.toString());
    const paymentMethods = await db.collection("store_payment_methods").find({
        storeId: { $in: storeIds }
    }).toArray();

    return businesses.map(b => {
        const methods = paymentMethods.filter(pm => pm.storeId === b._id.toString());
        return {
            id: b._id.toString(),
            name: b.name,
            subdomain: b.subdomain,
            status: b.isSuspended ? "suspended" : "active",
            createdAt: b.createdAt || b._id.getTimestamp(),
            gateways: methods.map(m => ({
                gateway: m.gateway,
                subaccount: m.connectedAccountId || m.gatewayAccountId || "Manual",
                status: m.onboardingStatus || (m.enabled ? "active" : "disabled")
            }))
        };
    });
}

export default async function BusinessesDirectory({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const sp = await searchParams;
    const query = sp.q || "";
    const businesses = await getBusinesses(query);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Business Directory</h1>
                <p className="text-zinc-400">Manage all businesses registered on the platform.</p>
            </div>

            <BusinessSearch initialQuery={query} />

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-300">
                        <tr>
                            <th className="px-6 py-4 font-medium">Business Name</th>
                            <th className="px-6 py-4 font-medium">Subdomain</th>
                            <th className="px-6 py-4 font-medium">Setup Gateways</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Created On</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {businesses.map((business) => (
                            <tr key={business.id} className="hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{business.name}</td>
                                <td className="px-6 py-4">{business.subdomain}.bized.app</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {business.gateways.length > 0 ? (
                                            business.gateways.map((gw, idx) => (
                                                <div key={idx} className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold text-white uppercase italic">{gw.gateway}</span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${gw.status === 'completed' || gw.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    </div>
                                                    <span className="text-[9px] font-mono opacity-50 truncate max-w-[100px]">{gw.subaccount}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-zinc-600 italic text-[10px]">No gateways configured</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {business.status === "active" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-400 bg-red-500/10 rounded-full border border-red-500/20">
                                            <Ban className="w-3.5 h-3.5" />
                                            Suspended
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(business.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/businesses/${business.id}`}
                                        className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                                    >
                                        <Info className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {businesses.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    No businesses found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
