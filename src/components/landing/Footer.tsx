
"use client";

import React from "react";
import Image from "next/image";
import { Building2, Github, Twitter, Linkedin, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Footer = () => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <footer className="bg-white dark:bg-black pt-24 pb-12 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <Image
                                src={theme === "dark" ? "/logo-dark-mode.png" : "/logo-light-mode.png"}
                                alt="Bized Logo"
                                width={40}
                                height={40}
                                className={cn(
                                    "h-10 w-auto rounded-sm",
                                    theme === "dark" ? "mix-blend-screen" : "mix-blend-multiply"
                                )}
                            />
                            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
                                BizedApp
                            </span>
                        </Link>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                            {t("footer.desc")}
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin, Facebook].map((Icon, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-indigo-600 hover:text-white transition-colors"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {[
                        {
                            title: t("footer.product"),
                            links: [t("navbar.features"), t("navbar.solutions"), "Integrations", t("navbar.pricing")],
                        },
                        {
                            title: t("footer.company"),
                            links: [t("navbar.about"), "Careers", "Press", "Contact"],
                        },
                        {
                            title: "Resources",
                            links: ["Documentation", "Help Center", t("footer.privacy"), t("footer.terms")],
                        },
                    ].map((column, idx) => (
                        <div key={idx}>
                            <h5 className="font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wider text-sm">
                                {column.title}
                            </h5>
                            <ul className="flex flex-col gap-4">
                                {column.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link
                                            href="#"
                                            className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium"
                                        >
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-900 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-zinc-500 dark:text-zinc-500 text-sm">
                        {t("footer.copyright")}
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 transition-colors">{t("footer.privacy")}</a>
                        <a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 transition-colors">{t("footer.terms")}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
