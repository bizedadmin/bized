"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
    LayoutDashboard,
    Store,
    Package,
    Ticket,
    ShoppingBag,
    Users,
    MessageSquare,
    CreditCard,
    Landmark,
    Settings,
    User,
    LogOut,
    History,
    CheckCircle2,
    Clock,
    UserPlus,
    Tags,
    Receipt,
    Wallet,
    FilePieChart,
    BarChartHorizontal,
    FileText,
    BarChart3,
    ChevronRight,
    Instagram,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AiChatSheet } from "@/components/admin/AiChatSheet";
import { HelpCenterProvider } from "@/components/admin/HelpCenter";

type NavItem = {
    label: string;
    icon?: React.ElementType;
    href: string;
    items?: NavItem[];
};

const subNavItems: Record<string, NavItem[]> = {
    "Store": [
        { label: "Pages", href: "/admin/storefront/pages", icon: FileText },
        { label: "Whatsapp", href: "/admin/storefront/whatsapp", icon: MessageSquare },
        { label: "Google", href: "/admin/storefront/google", icon: Search },
        { label: "Instagram", href: "/admin/storefront/instagram", icon: Instagram },
    ],
    "Catalog": [
        { label: "Overview", href: "/admin/products", icon: LayoutDashboard },
        { label: "All Products", href: "/admin/products/all", icon: Package },
        { label: "Categories", href: "/admin/products/categories", icon: FileText },
        { label: "Inventory", href: "/admin/products/inventory", icon: BarChart3 },
    ],
    "Tickets": [
        { label: "Overview", href: "/admin/calendar", icon: LayoutDashboard },
        { label: "Availability", href: "/admin/calendar/availability", icon: Clock },
        { label: "History", href: "/admin/calendar/history", icon: History },
    ],
    "Orders": [
        { label: "Overview", href: "/admin/orders", icon: LayoutDashboard },
        { label: "Active", href: "/admin/orders/active", icon: ShoppingBag },
        { label: "Completed", href: "/admin/orders/completed", icon: CheckCircle2 },
    ],
    "Customers": [
        { label: "Overview", href: "/admin/customers", icon: LayoutDashboard },
        { label: "All Customers", href: "/admin/customers/all", icon: Users },
        { label: "Groups", href: "/admin/customers/groups", icon: Tags },
    ],
    "POS": [
        { label: "Register", href: "/admin/pos", icon: CreditCard },
        { label: "History", href: "/admin/pos/history", icon: Receipt },
        { label: "Sales", href: "/admin/pos/sales", icon: BarChartHorizontal },
    ],
    "Finance": [
        { label: "Overview", href: "/admin/finance", icon: LayoutDashboard },
        { label: "Payouts", href: "/admin/finance/payouts", icon: Wallet },
        { label: "Tax Reports", href: "/admin/finance/tax", icon: FilePieChart },
    ],
};

const railItems: NavItem[] = [
    { label: "Home", icon: LayoutDashboard, href: "/admin" },
    { label: "Store", icon: Store, href: "/admin/storefront" },
    { label: "Catalog", icon: Package, href: "/admin/products" },
    { label: "Tickets", icon: Ticket, href: "/admin/calendar" },
    { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { label: "Customers", icon: Users, href: "/admin/customers" },
    { label: "POS", icon: CreditCard, href: "/admin/pos" },
    { label: "Finance", icon: Landmark, href: "/admin/finance" },
];

const NavigationRailItem = ({
    item,
    isActive,
    onItemClick,
    onMouseEnter,
    onMouseLeave
}: {
    item: NavItem;
    isActive: boolean;
    onItemClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}) => {
    return (
        <Link
            href={item.href}
            onClick={onItemClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                "flex flex-col items-center justify-center gap-0 w-16 h-14 rounded-2xl transition-all duration-300 group",
                isActive
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg shadow-[var(--color-primary)]/20 scale-105"
                    : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)] hover:text-[var(--color-on-surface)]"
            )}
        >
            {item.icon && (
                <item.icon
                    size={22}
                    className={cn(
                        "transition-transform",
                        isActive ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"
                    )}
                />
            )}
            <span className={cn(
                "text-[11px] font-medium tracking-wide text-center px-1",
                isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            )}>
                {item.label}
            </span>
        </Link>
    );
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [hoveredRailItem, setHoveredRailItem] = useState<string | null>(null);
    const [isHoveringFlyout, setIsHoveringFlyout] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Close profile menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRailMouseEnter = (label: string) => {
        if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
        setHoveredRailItem(label);
    };

    const handleRailMouseLeave = () => {
        flyoutTimerRef.current = setTimeout(() => {
            if (!isHoveringFlyout) {
                setHoveredRailItem(null);
            }
        }, 100);
    };

    const handleFlyoutMouseEnter = () => {
        if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
        setIsHoveringFlyout(true);
    };

    const handleFlyoutMouseLeave = () => {
        setIsHoveringFlyout(false);
        setHoveredRailItem(null);
    };

    const activeRailItemLabel = railItems.find(item =>
        pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
    )?.label || (pathname?.startsWith("/admin/storefront") ? "Store" : pathname?.startsWith("/admin/products") ? "Catalog" : "Home");

    const activePersistentSection = (activeRailItemLabel === "Store" || activeRailItemLabel === "Catalog") ? activeRailItemLabel : null;

    return (
        <HelpCenterProvider>
            <div className={cn(
                "min-h-screen bg-[var(--color-surface)] relative transition-all duration-300",
                activePersistentSection ? "md:pl-[336px]" : "md:pl-20"
            )}>
                {/* Desktop Navigation Rail - Fixed to absolute top */}
                <aside
                    className="hidden md:flex flex-col w-20 bg-[var(--color-surface-container-low)] border-r border-[var(--color-outline-variant)]/30 fixed top-0 left-0 h-screen z-[100] pb-4 items-center gap-1 shrink-0 transition-transform duration-300"
                >
                    <Link href="/admin" onMouseEnter={() => setHoveredRailItem(null)}>
                        <div className="w-20 h-16 flex items-center justify-center">
                            <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center border border-[var(--color-primary)]/20 shadow-sm overflow-hidden">
                                <img src="/logo.png" alt="Bized" className="w-7 h-7 object-contain" />
                            </div>
                        </div>
                    </Link>

                    {railItems.map((item) => (
                        <NavigationRailItem
                            key={item.label}
                            item={item}
                            isActive={activeRailItemLabel === item.label}
                            onMouseEnter={() => handleRailMouseEnter(item.label)}
                            onMouseLeave={handleRailMouseLeave}
                        />
                    ))}

                    <div className="mt-auto pb-4 flex flex-col items-center gap-2">
                        <NavigationRailItem
                            item={{ label: "Settings", icon: Settings, href: "/admin/settings" }}
                            isActive={pathname === "/admin/settings"}
                            onMouseEnter={() => handleRailMouseEnter("Settings")}
                            onMouseLeave={handleRailMouseLeave}
                        />

                        {/* User Profile Trigger */}
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all overflow-hidden border-2 shadow-sm",
                                isProfileMenuOpen ? "border-[var(--color-primary)] scale-105" : "border-transparent hover:border-[var(--color-outline-variant)]"
                            )}
                        >
                            {session?.user?.image ? (
                                <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] font-bold">
                                    {session?.user?.name?.[0]?.toUpperCase() || <User size={20} />}
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Profile Menu Dropdown */}
                    <AnimatePresence>
                        {isProfileMenuOpen && (
                            <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                className="absolute bottom-6 left-[calc(100%+8px)] w-64 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                            >
                                <div className="p-4 border-b border-[var(--color-outline-variant)]/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] shrink-0 font-bold overflow-hidden">
                                            {session?.user?.image ? (
                                                <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
                                            ) : (
                                                session?.user?.name?.[0]?.toUpperCase() || <User size={20} />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-[var(--color-on-surface)] truncate">{session?.user?.name || "User"}</span>
                                            <span className="text-xs text-[var(--color-on-surface-variant)] opacity-60 truncate">{session?.user?.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-[var(--color-surface-container-high)] transition-all">
                                        <User size={18} />
                                        <span>Account</span>
                                    </button>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/5 transition-all"
                                    >
                                        <LogOut size={18} />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>

                {/* Persistent Sub-menu */}
                <AnimatePresence mode="popLayout">
                    {activePersistentSection && subNavItems[activePersistentSection] && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="hidden md:flex fixed left-20 top-16 h-[calc(100vh-64px)] w-64 bg-[var(--color-surface-container-low)] border-r border-[var(--color-outline-variant)]/10 z-[40] flex-col overflow-hidden"
                        >
                            <div className="p-6 pb-2">
                                <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest opacity-60">
                                    {activePersistentSection}
                                </span>
                            </div>
                            <nav className="flex-1 p-3 space-y-1">
                                {subNavItems[activePersistentSection].map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 py-2.5 px-3 rounded-full transition-all group",
                                            pathname === item.href
                                                ? "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] font-bold"
                                                : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]"
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon size={18} className={pathname === item.href ? "text-[var(--color-on-secondary-container)]" : "opacity-70 group-hover:opacity-100"} />
                                        )}
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Flyout Sub-menu */}
                <AnimatePresence>
                    {hoveredRailItem && subNavItems[hoveredRailItem] && hoveredRailItem !== activePersistentSection && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onMouseEnter={handleFlyoutMouseEnter}
                            onMouseLeave={handleFlyoutMouseLeave}
                            className="fixed left-20 top-16 h-[calc(100vh-64px)] w-64 bg-[var(--color-surface-container)] border-r border-[var(--color-outline-variant)]/10 shadow-2xl z-[110] flex flex-col overflow-hidden rounded-r-[2rem]"
                        >
                            <div className="p-6 pb-2">
                                <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest opacity-60">
                                    {hoveredRailItem}
                                </span>
                            </div>
                            <nav className="flex-1 p-3 space-y-1">
                                {subNavItems[hoveredRailItem].map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setHoveredRailItem(null)}
                                        className={cn(
                                            "flex items-center gap-3 py-2.5 px-3 rounded-full transition-all group",
                                            pathname === item.href
                                                ? "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] font-bold"
                                                : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]"
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon size={18} className={pathname === item.href ? "text-[var(--color-on-secondary-container)]" : "opacity-70 group-hover:opacity-100"} />
                                        )}
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AiChatSheet />
                {/* Background Ambient Blobs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-[var(--color-tertiary)]/5 rounded-full blur-[100px]" />
                </div>

                <main className="min-h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </HelpCenterProvider>
    );
}
