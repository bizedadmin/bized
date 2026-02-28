"use client";

import React from "react";
import { Compass, User as UserIcon, Inbox, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const accountNavItems = [
    { label: "Explore", icon: Compass, href: "/explore" },
    { label: "You", icon: UserIcon, href: "/you" },
    { label: "Inbox", icon: Inbox, href: "/inbox" },
    { label: "Business", icon: Store, href: "/businesses" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[var(--color-surface)] flex flex-col max-w-[1400px] mx-auto w-full relative pb-[72px] md:pb-0">
            {/* Main Content Area */}
            <main className="flex-1 w-full min-w-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[var(--color-surface)]/90 backdrop-blur-md border-t border-[var(--color-outline-variant)]/10 flex items-center justify-around px-2 z-50 sm:pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                {accountNavItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                isActive
                                    ? "text-[var(--color-primary)]"
                                    : "text-[var(--color-on-surface-variant)] opacity-70 hover:opacity-100"
                            )}
                        >
                            <div className={cn(
                                "flex items-center justify-center w-12 h-8 rounded-full transition-all",
                                isActive ? "bg-[var(--color-primary)]/10" : "bg-transparent"
                            )}>
                                <item.icon size={20} className={isActive ? "" : "opacity-80"} />
                            </div>
                            <span className={cn(
                                "text-[10px] tracking-wide",
                                isActive ? "font-bold" : "font-medium"
                            )}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
