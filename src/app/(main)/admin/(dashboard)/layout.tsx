"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/contexts/BusinessContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { currentBusiness, isLoading } = useBusiness();

    // Redirect if no business selected
    useEffect(() => {
        if (!isLoading && !currentBusiness) {
            router.push("/admin/stores");
        }
    }, [currentBusiness, isLoading, router]);

    if (isLoading) {
        return null;
    }

    if (!currentBusiness) {
        return null;
    }

    return (
        <div className="flex relative w-full h-full">
            {/* Main Content Area */}
            <main className="flex-1 min-w-0 bg-[var(--color-surface)]">
                {children}
            </main>
        </div>
    );
}
