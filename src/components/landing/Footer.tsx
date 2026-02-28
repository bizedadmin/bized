"use client";

import { Globe, MessageCircle, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white py-12 px-4 border-t border-slate-50">
            <div className="container max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-black text-slate-900 tracking-tight">Bized.app</span>
                        <span className="text-slate-300">|</span>
                        <p className="text-slate-400 text-sm font-bold">
                            © 2026
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                        {["Privacy Policy", "Terms of Service", "Data Deletion", "Support"].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
