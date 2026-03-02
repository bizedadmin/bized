"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Coins, Wallet, LayoutGrid, Palette, Search, Languages, Clock, CreditCard, ShieldAlert, LucideIcon } from "lucide-react";

interface TabItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

const TABS: TabItem[] = [
    { id: "currency", label: "Default Currency", icon: Coins },
    { id: "financials", label: "Financials", icon: Wallet },
    { id: "gateways", label: "Payment Gateways", icon: CreditCard },
    { id: "partner-keys", label: "Partner Keys", icon: ShieldAlert },
    { id: "system", label: "System & Features", icon: LayoutGrid },
    { id: "branding", label: "Branding & Support", icon: Palette },
    { id: "seo", label: "SEO & Localization", icon: Search },
    { id: "languages", label: "Languages", icon: Languages },
    { id: "timezones", label: "Timezones", icon: Clock },
    { id: "danger", label: "Danger Zone", icon: ShieldAlert },
];

export function VariablesTabs() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const activeTab = searchParams.get("tab") || "currency";

    return (
        <aside className="w-full md:w-64 space-y-1">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <Link
                        key={tab.id}
                        href={`${pathname}?tab=${tab.id}`}
                        scroll={false}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                            ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-900"}
                        `}
                    >
                        <span className={isActive ? "text-white" : "text-zinc-500 group-hover:text-indigo-400 transition-colors"}>
                            <Icon className="w-4 h-4" />
                        </span>
                        {tab.label}
                    </Link>
                );
            })}
        </aside>
    );
}
