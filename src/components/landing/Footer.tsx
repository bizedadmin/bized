"use client";
import React from "react";
import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 w-full bg-[#0A0A0A]/90 backdrop-blur-md text-zinc-400 py-3 border-t border-zinc-800/50">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                {/* Social Icons - One Row */}
                <div className="flex items-center gap-5">
                    <Link href="#" className="hover:text-white transition-colors">
                        <Facebook size={18} className="fill-current" />
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors">
                        {/* Custom X Icon */}
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4.5 w-4.5 fill-current">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors">
                        <Linkedin size={18} className="fill-current" />
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors">
                        <Youtube size={18} className="fill-current" />
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors">
                        <Instagram size={18} />
                    </Link>
                </div>

                {/* Footer Links - One Row */}
                <div className="flex items-center gap-4 text-[13px] font-medium tracking-tight">
                    <Link href="/terms" className="hover:text-white transition-colors whitespace-nowrap">
                        Terms & Conditions
                    </Link>
                    <span className="text-zinc-800">|</span>
                    <Link href="/privacy" className="hover:text-white transition-colors whitespace-nowrap">
                        Privacy Policy
                    </Link>
                    <span className="text-zinc-800">|</span>
                    <Link href="/trust" className="hover:text-white transition-colors whitespace-nowrap">
                        Trust
                    </Link>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
