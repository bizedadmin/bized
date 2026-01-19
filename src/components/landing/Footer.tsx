"use client";
import React from "react";
import { Facebook, Linkedin, Youtube, Instagram, ShieldCheck, Globe, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const Footer = () => {
    const { theme, resolvedTheme } = useTheme();
    const isDark = theme === "dark" || resolvedTheme === "dark";

    const footerLinks = [
        {
            title: "Product",
            links: [
                { label: "Online Store", href: "#" },
                { label: "Payments", href: "#" },
                { label: "CRM & Leads", href: "#" },
                { label: "POS System", href: "#" },
                { label: "App Market", href: "#" }
            ]
        },
        {
            title: "Company",
            links: [
                { label: "About Bized", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Press Kit", href: "#" },
                { label: "Contact", href: "#" }
            ]
        },
        {
            title: "Resources",
            links: [
                { label: "Documentation", href: "#" },
                { label: "Help Center", href: "#" },
                { label: "Community", href: "#" },
                { label: "Partners", href: "#" },
                { label: "Status", href: "#" }
            ]
        }
    ];

    return (
        <footer className="w-full bg-[#0A0A0A] text-zinc-400 pt-24 border-t border-zinc-800/50 relative z-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10rem)' }}>
            <div className="max-w-7xl mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">

                    {/* Brand Block */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image
                                src="/logo-dark-mode.png"
                                alt="Bized Logo"
                                width={32}
                                height={32}
                                className="h-8 w-auto group-hover:scale-105 transition-transform"
                            />
                            <span className="font-black text-xl tracking-tighter text-white">
                                BizedApp
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs opacity-60">
                            The all-in-one operating system for modern businesses. Manage your store, payments, and customers in one beautiful interface.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all">
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerLinks.map((section, i) => (
                        <div key={i} className="lg:col-span-1 space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 underline decoration-primary/50 underline-offset-8">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Trust/Newsletter Block */}
                    <div className="lg:col-span-1 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Trust & Security
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                <ShieldCheck className="w-4 h-4 text-blue-500" /> PCI DSS Compliant
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                <Globe className="w-4 h-4 text-blue-500" /> 256-bit Encryption
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                <Zap className="w-4 h-4 text-yellow-500" /> 99.9% Uptime SLA
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Row */}
                <div className="py-8 border-t border-zinc-900 flex flex-col md:row items-center justify-between gap-6 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                    <p>© 2026 BizedApp Inc. All rights reserved.</p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
