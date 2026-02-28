"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    const isAdmin = pathname?.startsWith("/admin");
    if (isAdmin) return null;

    return (
        <footer className="bg-white border-t border-slate-100 py-6 px-4">
            <div className="container max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-400 font-medium">
                    © {currentYear} Bized App Ltd. All rights reserved.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6">
                    <Link href="/privacy" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
                        Terms of Service
                    </Link>
                    <Link href="/cookies" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
                        Cookie Policy
                    </Link>
                    <Link href="/data-deletion" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
                        Data Deletion
                    </Link>
                </div>
            </div>
        </footer>
    );
}
