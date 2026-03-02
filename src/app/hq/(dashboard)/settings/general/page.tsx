import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { Settings, ShieldAlert, Power } from "lucide-react";

interface PlatformSettings {
    _id: string;
    maintenanceMode: boolean;
}

async function getPlatformSettings(): Promise<PlatformSettings> {
    const client = await clientPromise;
    const db = client.db();

    // Default fallback if document doesn't exist
    let settings = await db.collection<PlatformSettings>("platform_settings").findOne({ _id: "global" as any });
    if (!settings) {
        settings = { _id: "global", maintenanceMode: false };
    }
    return settings;
}

export default async function GlobalSettingsPage() {
    const settings = await getPlatformSettings();

    const toggleMaintenanceMode = async () => {
        "use server";
        const client = await clientPromise;
        const db = client.db();

        await db.collection("platform_settings").updateOne(
            { _id: "global" as any },
            { $set: { maintenanceMode: !settings.maintenanceMode } },
            { upsert: true }
        );

        revalidatePath("/hq/settings/general");
    };

    return (
        <div className="space-y-8">

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Settings className="w-8 h-8" /> General Settings
                </h1>
                <p className="text-zinc-400">Manage global platform configurations and operational states.</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden max-w-3xl">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-white mb-2">System Status</h2>
                    <p className="text-sm text-zinc-400 mb-6">Manage system-wide maintenance locks. Enabling maintenance mode will prevent all non-Super Admin users from accessing any business dashboard or storefront.</p>

                    <form action={toggleMaintenanceMode}>
                        <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-zinc-950">
                            <div>
                                <div className="flex items-center gap-2 font-medium text-white">
                                    <ShieldAlert className="w-4 h-4 text-red-400" /> Maintenance Mode
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Currently {settings.maintenanceMode ? "Enabled" : "Disabled"}</p>
                            </div>

                            <button
                                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors border ${settings.maintenanceMode
                                        ? "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                                        : "bg-red-900/20 hover:bg-red-900/50 text-red-500 border-red-900/50 hover:border-red-500"
                                    }`}
                            >
                                <Power className="w-4 h-4" />
                                {settings.maintenanceMode ? "Disable Maintenance" : "Engage Maintenance"}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
