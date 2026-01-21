"use client"

import { Suspense } from "react"
import { Compass, ShoppingBag, User, Store, Calendar } from "lucide-react"
import ClientPortalShell from "@/components/portal/ClientPortalShell"
import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch"

export default function MarketplacePage() {
    // Generate Sidebar Items for Marketplace
    const marketplaceNavItems = [
        {
            id: 'discover',
            label: 'Discover',
            icon: Compass,
            onClick: () => { } // Handled by internal state/URL usually, or we can force reset 
        }
    ]

    return (
        <ClientPortalShell
            activeTab="marketplace"
            customNavItems={marketplaceNavItems}
        >
            <div className="p-4 sm:p-8 space-y-10 pb-32">
                {/* Hero Section */}
                <section className="relative rounded-[32px] overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm p-8 md:p-12 text-center">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Find local <span className="text-blue-600">favorites</span><br />
                            <span className="opacity-40">Book & Shop Instantly.</span>
                        </h1>
                    </div>
                </section>

                <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-2xl" />}>
                    <MarketplaceSearch />
                </Suspense>
            </div>
        </ClientPortalShell>
    )
}
