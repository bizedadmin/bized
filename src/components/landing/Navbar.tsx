
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Menu, X, ArrowRight } from "lucide-react";
import { Setting2, Moon, Sun, Translate, TickCircle } from "iconsax-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
                isScrolled
                    ? "bg-white/80 backdrop-blur-md border-b border-zinc-200 py-3 dark:bg-zinc-950/80 dark:border-zinc-800"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/logo.png"
                        alt="Bized Logo"
                        width={40}
                        height={40}
                        className="h-10 w-auto group-hover:scale-105 transition-transform"
                        priority
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {[
                        { key: "features", label: t("navbar.features") },
                        { key: "solutions", label: t("navbar.solutions") },
                        { key: "pricing", label: t("navbar.pricing") },
                        { key: "about", label: t("navbar.about") }
                    ].map((item) => (
                        <Link
                            key={item.key}
                            href={`#${item.key}`}
                            className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors dark:text-zinc-400 dark:hover:text-indigo-400"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {t("navbar.signin")}
                    </Link>
                    <Link href="/register">
                        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 group">
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
                                        ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/30 rotate-90"
                                        : "bg-zinc-200/50 text-zinc-900 border-zinc-200 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                )}
                                aria-label="Settings"
                            >
                                <Setting2 size={24} variant="Outline" color={isSettingsOpen ? "#FFFFFF" : "currentColor"} />
                            </button>
                        )}

                        <AnimatePresence>
                            {isSettingsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 mt-3 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 z-50 overflow-hidden"
                                >
                                    <div className="space-y-6 text-left">
                                        <div>
                                            <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-4 px-1">{t("settings.appearance")}</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => {
                                                        setTheme("light");
                                                        setIsSettingsOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-xs font-bold transition-all border-2",
                                                        theme === "light"
                                                            ? "bg-indigo-50 border-indigo-600 text-indigo-600 dark:bg-indigo-500/10"
                                                            : "bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700"
                                                    )}
                                                >
                                                    <Sun size={24} variant={theme === "light" ? "Bold" : "Outline"} color={theme === "light" ? "#4f46e5" : "currentColor"} />
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
                                                            ? "bg-indigo-50 border-indigo-600 text-indigo-600 dark:bg-indigo-500/10"
                                                            : "bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700"
                                                    )}
                                                >
                                                    <Moon size={24} variant={theme === "dark" ? "Bold" : "Outline"} color={theme === "dark" ? "#4f46e5" : "currentColor"} />
                                                    {t("settings.dark")}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                                            <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-4 px-1">{t("settings.language")}</h4>
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
                                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Translate size={20} variant="Outline" color={language === lang.code ? "#FFFFFF" : "currentColor"} />
                                                            {lang.name}
                                                        </div>
                                                        {language === lang.code && <TickCircle size={20} variant="Bold" color="#FFFFFF" />}
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
                    className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
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
                        className="absolute top-full left-0 right-0 bg-white border-b border-zinc-200 p-6 flex flex-col gap-4 md:hidden dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden"
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
                        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold mt-2">{t("navbar.getstarted")}</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
