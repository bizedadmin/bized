"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserProfileProps {
    session: any;
}

export function UserProfile({ session }: UserProfileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!session?.user) {
        return (
            <div className="mt-auto p-4 border-t border-neutral-800">
                <Link
                    href="/hq/login"
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-sm font-medium text-white transition-all"
                >
                    <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center">
                        <User size={16} className="text-neutral-500" />
                    </div>
                    <span>Sign In</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative mt-auto p-4 border-t border-neutral-800">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                    isOpen ? "bg-neutral-900" : "hover:bg-neutral-900/50"
                )}
            >
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold overflow-hidden">
                    {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                        session.user.name?.[0]?.toUpperCase() || <User size={20} />
                    )}
                </div>
                <div className="flex flex-col min-w-0 text-left">
                    <span className="text-sm font-bold text-white truncate">{session.user.name || "Admin"}</span>
                    <span className="text-xs text-neutral-500 truncate">{session.user.email}</span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-4 right-4 mb-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-[100]"
                    >
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // Could navigate to platform settings
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                            >
                                <Settings size={18} />
                                <span>Platform Settings</span>
                            </button>
                            <button
                                onClick={async () => {
                                    await signOut({ redirect: false });
                                    window.location.href = "/hq/login";
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all font-medium"
                            >
                                <LogOut size={18} />
                                <span>Log out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
