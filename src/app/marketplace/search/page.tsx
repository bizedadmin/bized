"use client"

import { Suspense } from 'react';
import { Compass } from 'lucide-react';
import ClientPortalShell from "@/components/portal/ClientPortalShell";
import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch";

export default function MarketplaceSearchPage() {
    const marketplaceNavItems = [
        {
            id: 'discover',
            label: 'Discover',
            icon: Compass,
            onClick: () => { }
        }
    ]

    return (
        <ClientPortalShell activeTab="marketplace" customNavItems={marketplaceNavItems}>
            <div className="p-4 sm:p-8 space-y-10 pb-32">
                <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-2xl" />}>
                    <MarketplaceSearch />
                </Suspense>
            </div>
        </ClientPortalShell>
    );
}
