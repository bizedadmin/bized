"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    BarChart3,
    ScrollText,
    ShieldCheck,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const sidebarItems = [
    {
        title: "Platform Overview",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Businesses",
        href: "/businesses",
        icon: Building2,
    },
    {
        title: "User Management",
        icon: Users,
        children: [
            { title: "Dashboard", href: "/users/overview" },
            { title: "Detailed List", href: "/users" },
            { title: "Privileged Users", href: "/admin-users" },
        ]
    },
    {
        title: "Operations & Trust",
        icon: ScrollText,
        children: [
            { title: "Audit Logs", href: "/audit" },
            { title: "API Logs", href: "/logs/errors" },
            { title: "Security Analytics", href: "/analytics" },
        ]
    },
    {
        title: "System Settings",
        href: "/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [openSections, setOpenSections] = useState<string[]>([]);

    // Auto-expand section if a child is active
    useEffect(() => {
        sidebarItems.forEach(item => {
            if (item.children?.some(child => pathname === child.href)) {
                setOpenSections(prev => prev.includes(item.title) ? prev : [...prev, item.title]);
            }
        });
    }, [pathname]);

    const toggleSection = (title: string) => {
        setOpenSections(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    return (
        <div className="hidden border-r bg-background md:block w-64 min-h-screen">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-zinc-100" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Bized Admin</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-2 pt-6">
                        {sidebarItems.map((item, idx) => {
                            const isOpen = openSections.includes(item.title);
                            const hasActiveChild = item.children?.some(child => pathname === child.href);

                            return (
                                <div key={idx} className="space-y-1">
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted/50",
                                                pathname === item.href
                                                    ? "bg-muted text-primary font-bold shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    ) : (
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => toggleSection(item.title)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group",
                                                    hasActiveChild ? "text-primary font-bold" : "text-muted-foreground hover:bg-muted/30"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                                                    <item.icon className="h-3.5 w-3.5" />
                                                    {item.title}
                                                </div>
                                                {isOpen ? (
                                                    <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                                ) : (
                                                    <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="pl-6 space-y-1 border-l-2 border-muted/50 ml-4 animate-in slide-in-from-top-1 duration-200">
                                                    {item.children?.map((child) => (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            className={cn(
                                                                "flex items-center gap-3 rounded-lg px-3 py-1.5 transition-all text-sm",
                                                                pathname === child.href
                                                                    ? "text-primary font-bold bg-muted/50"
                                                                    : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                                                            )}
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/30">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold">Admin Portal</span>
                            <span className="text-[10px] text-muted-foreground">v2.4.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
