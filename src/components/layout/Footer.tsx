"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer({ settings }: { settings?: any }) {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    const isAdmin = pathname?.startsWith("/admin");
    if (isAdmin) return null;

    const supportEmail = settings?.supportEmail || "support@bized.app";

    return (
        <footer className="bg-white border-t border-slate-100 py-10 px-4">
            <div className="container max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="font-black text-2xl tracking-tighter text-blue-600">
                            Bized<span className="text-slate-900">.</span>
                        </Link>
                        <p className="text-sm text-slate-500 max-w-xs">
                            The all-in-one platform for managing your business, storefront, and customers.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-20">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Support</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href={`mailto:${supportEmail}`} className="hover:text-blue-600 transition-colors">{supportEmail}</a></li>
                                {settings?.supportPhone && <li><a href={`tel:${settings.supportPhone}`} className="hover:text-blue-600 transition-colors">{settings.supportPhone}</a></li>}
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Company</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Tools</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><Link href="/cookies" className="hover:text-blue-600 transition-colors">Cookies</Link></li>
                                <li><Link href="/data-deletion" className="hover:text-blue-600 transition-colors">Data Deletion</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400 font-medium">
                        © {currentYear} Bized App Ltd. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
