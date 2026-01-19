
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { Setting2, Moon, Sun, Translate, TickCircle } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { theme, resolvedTheme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const languages: { name: string; code: Language }[] = [
        { name: "English", code: "en" },
        { name: "French", code: "fr" },
        { name: "Spanish", code: "es" },
        { name: "Portuguese", code: "pt" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
                isScrolled
                    ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 py-3 dark:bg-zinc-950/80 dark:border-zinc-800/50 shadow-sm"
                    : "bg-transparent py-4"
            )}
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex items-center gap-2">
                        <Image
                            src={mounted && (theme === "dark" || resolvedTheme === "dark") ? "/logo-dark-mode.png" : "/logo-light-mode.png"}
                            alt="Bized Logo"
                            width={40}
                            height={40}
                            className={cn(
                                "h-10 w-auto group-hover:scale-105 transition-transform rounded-sm"
                            )}
                            priority
                        />
                        <span className={cn(
                            "font-bold text-xl tracking-tight text-foreground"
                        )}>
                            BizedApp
                        </span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-8">
                    {[
                        {
                            key: "features",
                            label: t("navbar.features"),
                            dropdown: [
                                { label: "Online Store", href: "#" },
                                { label: "Invoicing & Payments", href: "#" },
                                { label: "CRM & Leads", href: "#" },
                                { label: "Booking & Appointments", href: "#" }
                            ]
                        },
                        {
                            key: "solutions",
                            label: t("navbar.solutions"),
                            dropdown: [
                                { label: "Retail & Shops", href: "#" },
                                { label: "Service Business", href: "#" },
                                { label: "Restaurants & Food", href: "#" },
                                { label: "Digital Creators", href: "#" }
                            ]
                        },
                        { key: "pricing", label: t("navbar.pricing") },
                        { key: "about", label: t("navbar.about") }
                    ].map((item) => (
                        item.dropdown ? (
                            <div key={item.key} className="relative group">
                                <button
                                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                                >
                                    {item.label}
                                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                                </button>
                                <div className="absolute top-full left-0 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                                    <div className="bg-popover border border-border rounded-xl shadow-xl p-2 flex flex-col gap-1">
                                        {item.dropdown.map((subItem, idx) => (
                                            <Link
                                                key={idx}
                                                href={subItem.href}
                                                className="px-4 py-2.5 text-sm md:text-xs lg:text-sm text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={item.key}
                                href={`#${item.key}`}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        )
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {t("navbar.signin")}
                    </Link>
                    <Link href="/register">
                        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 group">
                            {t("navbar.getstarted")}
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>

                    {/* Settings Menu */}
                    <div className="relative" ref={settingsRef}>
                        {mounted && (
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center border-2 border-transparent",
                                    isSettingsOpen
                                        ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/30 rotate-90 text-white"
                                        : "bg-muted/50 text-foreground border-border hover:bg-muted"
                                )}
                                aria-label="Settings"
                            >
                                <Setting2 size={24} variant="Outline" color="currentColor" />
                            </button>
                        )}

                        <AnimatePresence>
                            {isSettingsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 mt-3 w-72 bg-popover border border-border rounded-3xl shadow-xl p-6 z-50 overflow-hidden"
                                >
                                    <div className="space-y-6 text-left">
                                        <div>
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">{t("settings.appearance")}</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => {
                                                        setTheme("light");
                                                        setIsSettingsOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-xs font-bold transition-all border-2",
                                                        theme === "light"
                                                            ? "bg-primary/10 border-primary text-primary"
                                                            : "bg-muted/50 border-transparent text-muted-foreground hover:border-border"
                                                    )}
                                                >
                                                    <Sun size={24} variant={theme === "light" ? "Bold" : "Outline"} color="currentColor" />
                                                    {t("settings.light")}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setTheme("dark");
                                                        setIsSettingsOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-xs font-bold transition-all border-2",
                                                        theme === "dark"
                                                            ? "bg-primary/10 border-primary text-primary"
                                                            : "bg-muted/50 border-transparent text-muted-foreground hover:border-border"
                                                    )}
                                                >
                                                    <Moon size={24} variant={theme === "dark" ? "Bold" : "Outline"} color="currentColor" />
                                                    {t("settings.dark")}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-border pt-6">
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">{t("settings.language")}</h4>
                                            <div className="space-y-2">
                                                {languages.map((lang) => (
                                                    <button
                                                        key={lang.code}
                                                        onClick={() => {
                                                            setLanguage(lang.code);
                                                            setIsSettingsOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all",
                                                            language === lang.code
                                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                                : "text-muted-foreground hover:bg-muted"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Translate size={20} variant="Outline" color="currentColor" />
                                                            {lang.name}
                                                        </div>
                                                        {language === lang.code && <TickCircle size={20} variant="Bold" color="currentColor" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-2xl border-b border-zinc-200/50 p-6 flex flex-col gap-4 lg:hidden dark:bg-zinc-950/90 dark:border-zinc-800/50 overflow-hidden"
                        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
                    >
                        {[
                            { key: "features", label: t("navbar.features") },
                            { key: "solutions", label: t("navbar.solutions") },
                            { key: "pricing", label: t("navbar.pricing") }
                        ].map((item) => (
                            <Link
                                key={item.key}
                                href={`#${item.key}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-base font-medium text-zinc-900 dark:text-white"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold mt-2">{t("navbar.getstarted")}</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
