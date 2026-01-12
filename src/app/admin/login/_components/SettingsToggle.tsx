"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Setting2, Moon, Sun, Translate, TickCircle } from "iconsax-reactjs";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";

export default function SettingsToggle() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    const languages: { name: string; code: Language }[] = [
        { name: "English", code: "en" },
        { name: "French", code: "fr" },
        { name: "Spanish", code: "es" },
        { name: "Portuguese", code: "pt" },
    ];

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative" ref={settingsRef}>
            <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center border-2 border-transparent",
                    isSettingsOpen
                        ? "bg-primary border-primary shadow-lg shadow-primary/30 rotate-90 text-primary-foreground"
                        : "bg-white/80 dark:bg-black/50 backdrop-blur-md text-foreground border-border hover:bg-white dark:hover:bg-black shadow-sm"
                )}
                aria-label="Settings"
            >
                <Setting2 size={24} variant="Outline" color="currentColor" />
            </button>

            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10, x: 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, x: 0 }}
                        className="absolute right-0 mt-3 w-72 bg-popover border border-border rounded-3xl shadow-xl p-6 z-50 overflow-hidden"
                    >
                        <div className="space-y-6 text-left">
                            <div>
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">
                                    {t("settings.appearance")}
                                </h4>
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
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">
                                    {t("settings.language")}
                                </h4>
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
    );
}
