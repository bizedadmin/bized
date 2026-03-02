import { Check, Plus, AlertCircle } from "lucide-react";

// For MVP, we'll hardcode the tiers and mimic the view, 
// eventually this will be driven by MongoDB `platform_settings` or Stripe API.
const subscriptionTiers = [
    {
        id: "free",
        name: "Free Tier",
        price: "$0",
        interval: "forever",
        description: "Perfect for new businesses getting started.",
        features: ["Up to 50 Products", "1 Staff Account", "Basic WhatsApp Ordering", "Community Support"],
        status: "active",
        businessCount: 2
    },
    {
        id: "starter",
        name: "Starter",
        price: "$19",
        interval: "per month",
        description: "For growing teams needing more scale.",
        features: ["Up to 500 Products", "5 Staff Accounts", "Custom Subdomain", "Email Support", "Advanced Analytics"],
        status: "active",
        businessCount: 1
    },
    {
        id: "pro",
        name: "Pro",
        price: "$49",
        interval: "per month",
        description: "Unlimited scale for power sellers.",
        features: ["Unlimited Products", "Unlimited Staff", "Custom Domain Support", "Priority 24/7 Support", "API Access"],
        status: "draft",
        businessCount: 0
    }
];

export default function PlatformSubscriptions() {
    return (
        <div className="space-y-8">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Subscription Management</h1>
                    <p className="text-zinc-400">Configure the pricing tiers and limits available to businesses.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                    <Plus className="w-4 h-4" /> Create New Tier
                </button>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                    <h3 className="text-sm font-semibold text-yellow-500">Subscription Engine is Mocked</h3>
                    <p className="text-xs text-yellow-500/80 mt-1">
                        Currently displaying static tiers for UI development. In Phase 4, this will sync with Stripe and the `platform_settings` MongoDB collection.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionTiers.map(tier => (
                    <div
                        key={tier.id}
                        className={`rounded-xl border p-6 flex flex-col h-full bg-zinc-900/50 ${tier.status === "draft" ? "border-zinc-800 opacity-70" : "border-indigo-500/30"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                                <p className="text-sm text-zinc-400 mt-1">{tier.description}</p>
                            </div>
                            {tier.status === "draft" && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Draft</span>
                            )}
                        </div>

                        <div className="mt-2 mb-6">
                            <span className="text-3xl font-bold text-white">{tier.price}</span>
                            <span className="text-sm text-zinc-500 ml-1">/ {tier.interval}</span>
                        </div>

                        <div className="flex-1 space-y-3 mb-8">
                            {tier.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-zinc-500 uppercase font-semibold">Active Tenants</span>
                                <span className="text-lg font-bold text-white">{tier.businessCount}</span>
                            </div>
                            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition">
                                Edit Limits
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
