"use client";
import React from "react";
import Image from "next/image";
import { Twitter, Github, Linkedin, Facebook } from "lucide-react";
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
        <footer className="fixed bottom-0 w-full z-50 bg-black text-white py-4 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left Side: Logo & Copyright */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo-dark-mode.png"
                            alt="Bized Logo"
                            width={32}
                            height={32}
                            className="h-8 w-auto mix-blend-screen"
                        />
                        <span className="font-bold text-lg tracking-tight">
                            BizedApp
                        </span>
                    </Link>
                    <div className="flex gap-4 ml-4 pl-4 border-l border-zinc-700">
                        <Link href="#" className="p-1 hover:text-emerald-400 transition-colors">
                            <Twitter size={16} />
                        </Link>
                        <Link href="#" className="p-1 hover:text-emerald-400 transition-colors">
                            <Github size={16} />
                        </Link>
                        <Link href="#" className="p-1 hover:text-emerald-400 transition-colors">
                            <Linkedin size={16} />
                        </Link>
                        <Link href="#" className="p-1 hover:text-emerald-400 transition-colors">
                            <Facebook size={16} />
                        </Link>
                    </div>
                </div>

                {/* Right Side: Links */}
                <div className="flex gap-8 items-center text-sm font-medium">
                    <Link href="#" className="hover:text-emerald-400 hover:underline transition-all">
                        {t("footer.terms")}
                    </Link>
                    <Link href="#" className="hover:text-emerald-400 hover:underline transition-all">
                        {t("footer.privacy")}
                    </Link>
                    <Link href="#" className="hover:text-emerald-400 hover:underline transition-all">
                        Sitemap
                    </Link>
                </div>
            </div>
            {/* Copyright Line - Optional if you want it super minimal on one line, but example image shows it bottom or hidden. I'll add a tiny sub-text if needed, but the user asked for "Similar to attached footer" which is a single black bar. */}
            {/* Based on the second image (black bar), it seems to be just one row. */}
        </footer>
    );
};

export default Footer;
