import clientPromise from "@/lib/mongodb";
import Link from "next/link";
import { Search, UserPlus, ShieldAlert, Key } from "lucide-react";

async function getPlatformStaff() {
    const client = await clientPromise;
    const db = client.db();

    // Find all users who are currently designated as super admins
    const staff = await db.collection("users").find({ isSuperAdmin: true }).toArray();

    return staff.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.platformRole || "SUPER_ADMIN",
        createdAt: u.dateCreated || new Date(),
    }));
}

export default async function PlatformStaffDirectory() {
    const staffMembers = await getPlatformStaff();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Platform Staff</h1>
                <p className="text-zinc-400">Manage internal users with access to Bized HQ.</p>
            </div>

            <div className="flex justify-between items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search staff by name or email..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                    <UserPlus className="w-4 h-4" /> Invite Staff
                </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-300">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Added On</th>
                            <th className="px-6 py-4 font-medium text-right">Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {staffMembers.map((staff) => (
                            <tr key={staff.id} className="hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                                        {staff.name.charAt(0).toUpperCase()}
                                    </div>
                                    {staff.name}
                                </td>
                                <td className="px-6 py-4">{staff.email}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        {staff.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(staff.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
                                        title="Revoke Access"
                                    >
                                        <Key className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {staffMembers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    No platform staff found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
