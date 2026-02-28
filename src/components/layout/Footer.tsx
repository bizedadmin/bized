"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    const isAdmin = pathname?.startsWith("/admin");

    if (isAdmin) return null;

    return (
        <footer className="bg-[var(--color-surface-container)] pt-16 pb-8 px-4 border-t border-[var(--color-outline-variant)]/10">
            <div className="container max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo className="w-8 h-8" />
                            <span className="text-xl font-bold text-[var(--color-on-surface)]">Bized</span>
                        </Link>
                        <p className="text-sm text-[var(--color-on-surface)]/70 max-w-xs leading-relaxed">
                            The Hybrid Commerce OS for small businesses. Sell products and book services across WhatsApp, Instagram, and Google with one link.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <Link href="#" className="p-2 rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                                <Github className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-bold text-[var(--color-on-surface)] mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/features/online-store" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Online Store
                                </Link>
                            </li>
                            <li>
                                <Link href="/features/order-management" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Order Management
                                </Link>
                            </li>
                            <li>
                                <Link href="/features/scheduling" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Scheduling
                                </Link>
                            </li>
                            <li>
                                <Link href="/features/whatsapp-ordering" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    WhatsApp Ordering
                                </Link>
                            </li>
                            <li>
                                <Link href="/features/whatsapp-api" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    WhatsApp API
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-[var(--color-on-surface)] mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="#" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-[var(--color-on-surface)] mb-6">Legal</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/privacy" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/data-deletion" className="text-sm text-[var(--color-on-surface)]/70 hover:text-[var(--color-primary)] transition-colors">
                                    Data Deletion
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[var(--color-outline-variant)]/10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[var(--color-on-surface)]/50">
                        © {currentYear} Bized App Ltd. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-sm text-[var(--color-on-surface)]/50">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
