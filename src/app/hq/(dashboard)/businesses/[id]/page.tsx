import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Ban, ShieldCheck, CheckCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getBusiness(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const rawBusiness = await db.collection("businesses").findOne({ _id: new ObjectId(id) });

        if (!rawBusiness) return null;

        // Try to find the primary owner (usually the first user who created it)
        const owner = await db.collection("users").findOne({ businessId: id, role: "owner" })
            || await db.collection("users").findOne({ businessId: id });

        // Merge original document with new owner fields, bypass TS document checking
        const business: any = {
            ...rawBusiness,
            ownerName: owner?.name || "Unknown Owner",
            ownerEmail: owner?.email || rawBusiness.email || "N/A"
        };
        return business;
    } catch (e) {
        return null;
    }
}

async function getBusinessStats(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const [ordersCount, productsCount] = await Promise.all([
            db.collection("orders").countDocuments({ businessId: id }),
            db.collection("products").countDocuments({ businessId: id })
        ]);

        return { ordersCount, productsCount };
    } catch (e) {
        return { ordersCount: 0, productsCount: 0 };
    }
}

export default async function BusinessDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const business = await getBusiness(id);
    const stats = await getBusinessStats(id);

    if (!business) {
        notFound();
    }

    // Define server actions directly in the component for simplicity
    const toggleSuspendStatus = async () => {
        "use server";
        const client = await clientPromise;
        const db = client.db();

        // Toggle the suspend flag
        await db.collection("businesses").updateOne(
            { _id: new ObjectId(id) },
            { $set: { isSuspended: !business.isSuspended } }
        );

        revalidatePath(`/hq/businesses/${id}`);
        revalidatePath(`/hq/businesses`);
    };

    const impersonateBusiness = async () => {
        "use server";
        console.log(`[AUDIT] Super Admin impersonating business: ${business.name} (${id})`);

        // Use the native Edge/Node cookies API to set an impersonation token
        const cookieStore = await cookies();

        // Determine domain for the cookie. On localhost, omit to allow default behavior, 
        // or explicitly set to 'localhost' to share across subdomains. In prod, use '.bized.app'
        const domain = process.env.NODE_ENV === "production" ? '.bized.app' : 'localhost';

        // Set a secure, HTTP-only cookie that lives for the session
        cookieStore.set('bized_impersonate', id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            path: '/', // Accessible across the whole domain
            domain
        });

        // Redirect out of HQ into the main business dashboard
        redirect(`http://localhost:3000/admin`);
    };

    return (
        <div className="space-y-6">

            {/* Header & Back Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/hq/businesses"
                        className="p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            {business.name}
                            {business.isSuspended ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-red-500 bg-red-500/10 rounded border border-red-500/20">
                                    <Ban className="w-3.5 h-3.5" /> Suspended
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 rounded border border-emerald-500/20">
                                    <CheckCircle className="w-3.5 h-3.5" /> Active
                                </span>
                            )}
                        </h1>
                        <p className="text-zinc-400">{business.subdomain}.bized.app</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form action={toggleSuspendStatus}>
                        <button className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors border ${business.isSuspended
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                            : "bg-zinc-900 hover:bg-red-900/50 text-red-500 border-zinc-800 hover:border-red-800"
                            }`}>
                            {business.isSuspended ? (
                                <>
                                    <ShieldCheck className="w-4 h-4" /> Unsuspend Account
                                </>
                            ) : (
                                <>
                                    <Ban className="w-4 h-4" /> Suspend Account
                                </>
                            )}
                        </button>
                    </form>

                    <form action={impersonateBusiness}>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors border border-indigo-500">
                            <RefreshCw className="w-4 h-4" /> Impersonate
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Core Stats */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                            <h3 className="text-sm font-medium text-zinc-400">Total Products</h3>
                            <div className="text-3xl font-bold text-white mt-1">{stats.productsCount}</div>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                            <h3 className="text-sm font-medium text-zinc-400">Total Orders Processing</h3>
                            <div className="text-3xl font-bold text-white mt-1">{stats.ordersCount}</div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Account Information</h2>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div className="text-zinc-500">Business Owner</div>
                            <div className="text-white font-medium">{business.ownerName}</div>
                            <div className="text-zinc-500">Contact Email</div>
                            <div className="text-white">{business.ownerEmail}</div>
                            <div className="text-zinc-500">Phone Number</div>
                            <div className="text-white">{business.phone || 'N/A'}</div>
                            <div className="text-zinc-500">Country Code</div>
                            <div className="text-white">{business.countryCode || 'N/A'}</div>
                            <div className="text-zinc-500">Database ID</div>
                            <div className="text-zinc-400 font-mono text-xs">{business._id.toString()}</div>
                        </div>
                    </div>
                </div>

                {/* Subscription Panel */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Subscription</h2>

                        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950 mb-4">
                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Current Plan</div>
                            <div className="text-xl font-bold text-indigo-400">Free Tier</div>
                        </div>

                        <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg text-sm transition">
                            Manage Subscription
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
