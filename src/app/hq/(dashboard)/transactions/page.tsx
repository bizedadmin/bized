import clientPromise from "@/lib/mongodb";
import { CreditCard, ArrowRight, DollarSign, ExternalLink } from "lucide-react";

async function getTransactions() {
    const client = await clientPromise;
    const db = client.db();

    // Fetch platform commissions sorted by newest
    const commissions = await db.collection("platform_commissions").find({}).sort({ createdAt: -1 }).limit(50).toArray();

    // Gather store IDs and order IDs for joining
    const storeIds = [...new Set(commissions.map(c => c.storeId))];
    const businesses = await db.collection("businesses").find({ _id: { $in: storeIds.map(id => typeof id === 'string' ? id : (id as any).toString()) } as any }).toArray();

    const storeMap = Object.fromEntries(businesses.map(b => [b._id.toString(), b.name]));

    return commissions.map(c => ({
        id: c._id.toString(),
        storeName: storeMap[c.storeId] || "Unknown Store",
        orderId: c.orderId.toString(),
        totalAmount: c.totalAmount || 0,
        commissionAmount: c.amount || 0,
        currency: c.currency || "USD",
        percentage: c.percentage || 0,
        gateway: c.gateway || "Unknown",
        status: c.status || "Recorded",
        createdAt: c.createdAt
    }));
}

export default async function TransactionsPage() {
    const transactions = await getTransactions();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-indigo-500" />
                    Platform Transactions
                </h1>
                <p className="text-zinc-400">Monitor all payment gateway transactions and platform revenue.</p>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Processing</div>
                    <div className="text-3xl font-black text-white flex items-center gap-2">
                        <span className="text-indigo-500">$</span>
                        {transactions.reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString()}
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/10 border border-indigo-500">
                    <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Platform Revenue</div>
                    <div className="text-3xl font-black text-white flex items-center gap-2">
                        <span>$</span>
                        {transactions.reduce((sum, t) => sum + t.commissionAmount, 0).toLocaleString()}
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Fee Avg</div>
                    <div className="text-3xl font-black text-white">
                        {transactions.length > 0 ? (transactions.reduce((sum, t) => sum + t.percentage, 0) / transactions.length).toFixed(1) : 0}
                        <span className="text-indigo-500 text-xl ml-1">%</span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-300">
                        <tr>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Timestamp</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Business</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Gateway</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Order Value</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Commission</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-zinc-800/50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-[11px] opacity-60">
                                    {new Date(t.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{t.storeName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-md bg-zinc-950 border border-zinc-800 font-bold text-[10px] text-zinc-300">
                                        {t.gateway}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-white">
                                    {t.currency} {t.totalAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                                            <DollarSign size={10} />
                                            {t.commissionAmount.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] opacity-40 font-bold uppercase tracking-tight">({t.percentage}%)</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all shadow-sm">
                                        <ExternalLink size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                        <CreditCard size={48} />
                                        <div className="font-medium text-lg">No platform transactions found yet</div>
                                        <p className="text-sm max-w-[300px] mx-auto text-zinc-500">Commisions will appear here once orders are processed through gateways like Stripe or Paystack.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
