"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import {
    Menu,
    X,
    ChevronDown,
    Store,
    Calendar,
    ClipboardList,
    MessageCircle,
    LogOut,
    User,
    ChevronRight,
    Slash,
    Bot,
    Bell,
    MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAi } from "@/contexts/AiContext";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const menuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: 10, display: "none" },
        visible: { opacity: 1, y: 0, display: "block", transition: { duration: 0.2 } },
    };

    const features = [
        {
            title: "Online Store",
            description: "Sell products seamlessly.",
            href: "/features/online-store",
            icon: <Store className="w-5 h-5 text-blue-600" />,
            color: "bg-blue-50",
        },
        {
            title: "Scheduling",
            description: "Book appointments easily.",
            href: "/features/scheduling",
            icon: <Calendar className="w-5 h-5 text-purple-600" />,
            color: "bg-purple-50",
        },
        {
            title: "Order Management",
            description: "Track and fulfill orders.",
            href: "/features/order-management",
            icon: <ClipboardList className="w-5 h-5 text-emerald-600" />,
            color: "bg-emerald-50",
        },
        {
            title: "WhatsApp Integrated",
            description: "Chat and sell directly.",
            href: "/features/whatsapp",
            icon: <MessageCircle className="w-5 h-5 text-green-600" />,
            color: "bg-green-50",
        },
    ];

    const pathname = usePathname();
    const { data: session } = useSession();
    const { currentBusiness } = useBusiness();
    const { setIsChatOpen } = useAi();
    const isAdmin = pathname?.startsWith("/admin");

    return (
        <header className="sticky top-0 z-50 w-full bg-[var(--color-surface-container-low)]/80 backdrop-blur-md border-b border-[var(--color-outline-variant)]/10">
            <div className="w-full h-16 flex items-center">
                {/* Logo Area - Hidden in Admin as it's in the Rail */}
                {!isAdmin && (
                    <div className="h-full flex items-center px-4 md:px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo className="w-11 h-11" />
                            <span className="text-xl font-bold text-[var(--color-primary)]">Bized.app</span>
                        </Link>
                    </div>
                )}

                <div className={cn(
                    "flex-1 h-full flex items-center justify-between px-4 md:px-6",
                    isAdmin && "md:pl-20" // Fixed legacy rail width offset
                )}>
                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Store Selector & Breadcrumbs */}
                        {isAdmin && (
                            <div className="flex items-center gap-3">
                                {/* Store Selector */}
                                <Link href="/admin/stores" className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-[var(--color-surface-container-high)] transition-colors group border border-transparent hover:border-[var(--color-outline-variant)]/10">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] shadow-sm">
                                        {currentBusiness?.logoUrl ? (
                                            <img src={currentBusiness.logoUrl} alt={currentBusiness.name} className="w-8 h-8 rounded-lg object-cover" />
                                        ) : (
                                            <Store size={16} />
                                        )}
                                    </div>
                                    <div className="hidden md:flex flex-col">
                                        <span className="text-sm font-bold text-[var(--color-on-surface)] leading-none max-w-[150px] truncate">{currentBusiness?.name || "Select Store"}</span>
                                        <span className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60 leading-none mt-1">switch store</span>
                                    </div>
                                    <ChevronDown size={14} className="text-[var(--color-on-surface-variant)] opacity-50 group-hover:opacity-100 transition-opacity ml-1" />
                                </Link>

                                {/* Breadcrumbs */}
                                {pathname && pathname.split('/').filter(Boolean).length > 1 && (
                                    <>
                                        <Slash size={16} className="text-[var(--color-on-surface-variant)]/20 -rotate-12" />
                                        <div className="flex items-center gap-2">
                                            {pathname.split('/').filter(Boolean).slice(1).map((segment, index, array) => {
                                                const isLast = index === array.length - 1;
                                                return (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-sm font-medium capitalize",
                                                            isLast ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)]"
                                                        )}>
                                                            {segment.replace(/-/g, ' ')}
                                                        </span>
                                                        {!isLast && <span className="text-[var(--color-on-surface-variant)]/40">/</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation - Hidden in Admin */}
                    {!isAdmin && (
                        <nav className="hidden md:flex items-center gap-8">
                            {/* Features Dropdown */}
                            <div
                                className="relative group h-16 flex items-center"
                                onMouseEnter={() => setIsFeaturesOpen(true)}
                                onMouseLeave={() => setIsFeaturesOpen(false)}
                            >
                                <button className="flex items-center gap-1 text-sm font-medium text-[var(--color-on-surface)]/80 hover:text-[var(--color-primary)] transition-colors focus:outline-none">
                                    Features
                                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isFeaturesOpen && "rotate-180")} />
                                </button>

                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate={isFeaturesOpen ? "visible" : "hidden"}
                                    className="absolute top-16 left-0 w-[600px] bg-[var(--color-surface-container-low)] rounded-xl border border-[var(--color-outline-variant)]/10 shadow-xl p-2"
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        {features.map((feature, index) => (
                                            <Link
                                                key={index}
                                                href={feature.href}
                                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--color-surface-container)] transition-colors group/item"
                                                onClick={() => setIsFeaturesOpen(false)}
                                            >
                                                <div className={cn("mt-1 w-10 h-10 rounded-lg flex items-center justify-center shrink-0", feature.color)}>
                                                    {feature.icon}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-[var(--color-on-surface)] group-hover/item:text-[var(--color-primary)] transition-colors">
                                                        {feature.title}
                                                    </div>
                                                    <div className="text-xs text-[var(--color-on-surface)]/60">
                                                        {feature.description}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            <Link href="/#pricing" className="text-sm font-medium text-[var(--color-on-surface)]/80 hover:text-[var(--color-primary)] transition-colors">
                                Pricing
                            </Link>
                        </nav>
                    )}



                    {/* Desktop Auth/Session Buttons - Hidden in Admin as they moved to sidebar */}
                    {!isAdmin && (
                        <div className="hidden md:flex items-center gap-4">
                            {!session ? (
                                <>
                                    <Link href="/signin">
                                        <Button variant="text" className="px-4">Log in</Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button className="px-4">Start free</Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end mr-2">
                                        <span className="text-xs font-bold leading-tight">{session.user?.name}</span>
                                        <span className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-tighter">Pro Workspace</span>
                                    </div>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="p-2.5 rounded-xl border border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-error)]/5 hover:text-[var(--color-error)] transition-colors group"
                                    >
                                        <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {isAdmin && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-all group border border-transparent hover:border-[var(--color-primary)]/20"
                            >
                                <Bot size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">AI AGENT</span>
                            </button>

                            <div className="h-8 w-[1px] bg-[var(--color-outline-variant)]/20 mx-1 hidden sm:block" />

                            <Link
                                href="/admin/chats"
                                className="p-2 rounded-xl text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)] transition-all group relative"
                                title="Chats"
                            >
                                <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-primary)] rounded-full border-2 border-[var(--color-surface-container-low)]" />
                            </Link>

                            <Link
                                href="/admin/notifications"
                                className="p-2 rounded-xl text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)] transition-all group relative"
                                title="Notifications"
                            >
                                <Bell size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-error)] rounded-full border-2 border-[var(--color-surface-container-low)]" />
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-[var(--color-on-surface)]"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="md:hidden absolute top-16 left-0 w-full bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]/10 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto"
                    >
                        <div className="container px-4 py-6 flex flex-col gap-4">
                            <div className="py-2 border-b border-[var(--color-outline-variant)]/10">
                                <div className="text-sm font-semibold text-[var(--color-on-surface)]/50 mb-4 uppercase tracking-wider">Features</div>
                                <div className="grid grid-cols-1 gap-4 pl-2">
                                    {features.map((feature, index) => (
                                        <Link
                                            key={index}
                                            href={feature.href}
                                            className="flex items-center gap-3"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", feature.color)}>
                                                {feature.icon}
                                            </div>
                                            <div className="text-base font-medium text-[var(--color-on-surface)]">
                                                {feature.title}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href="/#pricing"
                                className="text-base font-medium text-[var(--color-on-surface)] py-2 border-b border-[var(--color-outline-variant)]/10"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="#"
                                className="text-base font-medium text-[var(--color-on-surface)] py-2 border-b border-[var(--color-outline-variant)]/10"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </Link>
                            <div className="flex flex-col gap-3 mt-4">
                                <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="text" className="w-full justify-center">Log in</Button>
                                </Link>
                                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full justify-center">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
