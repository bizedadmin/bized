"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBusiness } from "@/contexts/BusinessContext";
import { SubscriptionNotice } from "@/components/admin/SubscriptionNotice";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { currentBusiness, isLoading } = useBusiness();

    // Redirect if no business selected
    useEffect(() => {
        if (!isLoading && !currentBusiness) {
            router.push("/businesses");
        }
    }, [currentBusiness, isLoading, router]);

    if (isLoading) {
        return null;
    }

    if (!currentBusiness) {
        return null;
    }

    const isRestricted = (currentBusiness.subscription?.status === "canceled" || currentBusiness.subscription?.status === "unpaid") &&
        !pathname.includes("/settings") && !pathname.includes("/billing");

    return (
        <div className="flex flex-col relative w-full h-full min-h-screen">
            <ImpersonationBanner />
            <SubscriptionNotice />

            <div className="flex flex-1 relative w-full h-full overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-[var(--color-surface)] overflow-y-auto">
                    {isRestricted ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                <AlertCircle size={40} />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h2 className="text-2xl font-black text-[var(--color-on-surface)] uppercase tracking-tight">Access Restricted</h2>
                                <p className="text-[var(--color-on-surface-variant)] opacity-60">
                                    Your subscription for <strong>{currentBusiness.name}</strong> is currently {currentBusiness.subscription?.status}.
                                    Please renew your plan to continue using the platform.
                                </p>
                            </div>
                            <Link href="/admin/billing" className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                                Go to Billing
                            </Link>
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    );
}
