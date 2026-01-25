"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function StickyFooter() {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-gray-100 dark:border-zinc-800 md:hidden z-50 pb-[env(safe-area-inset-bottom)]">
            <Link href="/login" passHref className="block w-full">
                <Button size="lg" className="w-full h-12 rounded-full font-bold bg-whatsapp hover:bg-whatsapp-hover text-white shadow-lg shadow-whatsapp/20">
                    Get Started - Free
                </Button>
            </Link>
        </div>
    )
}
