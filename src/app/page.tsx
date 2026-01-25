"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrustRow } from "@/components/landing/TrustRow"
import { Hero } from "@/components/landing/Hero"
import { Navbar } from "@/components/landing/Navbar"
import { StickyFooter } from "@/components/landing/StickyFooter"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white font-sans selection:bg-blue-100 selection:text-blue-900 pb-24 md:pb-0">

            {/* Header: The Top Scan */}
            {/* Navbar */}
            <Navbar />

            <main className="pt-[calc(6rem+env(safe-area-inset-top))] md:pt-32 pb-20 px-6 lg:px-20 max-w-7xl mx-auto">
                {/* Hero Section */}
                <Hero />

                {/* The Second Horizontal: Trust Row */}
                <div className="mt-24 pt-12 border-t border-gray-100 dark:border-zinc-900">
                    <p className="text-center md:text-left text-sm font-semibold text-gray-400 mb-8 uppercase tracking-wider">Trusted Integration Partners</p>
                    <TrustRow />
                </div>
            </main>

            {/* Mobile Bottom Sticky CTA */}
            <StickyFooter />
        </div>
    )
}
