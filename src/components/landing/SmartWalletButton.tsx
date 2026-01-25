"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function SmartWalletButton() {
    const [os, setOs] = useState<"ios" | "android" | "other">("other")

    useEffect(() => {
        requestAnimationFrame(() => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera;
            if (/iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream: unknown }).MSStream) {
                setOs("ios")
            } else if (/android/i.test(userAgent)) {
                setOs("android")
            }
        });
    }, [])

    if (os === "ios") {
        return (
            <Button variant="outline" className="h-12 w-full sm:w-auto rounded-xl border-black bg-black text-white hover:bg-zinc-800 font-bold gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M18.71 19.5c-.31.96-1.45 2.93-2.54 2.93-1.01 0-1.35-.6-2.54-.6-1.2 0-1.6.61-2.54.61-1.2 0-2.39-2.13-2.7-3.26-.06-.21-1.63-5.22 1.58-6.19 2.05-.62 1.48.57 3.2.57 1.7 0 1.25-1.22 3.2-1.22 1.14 0 2.22.61 2.87 1.53-2.57 1.34-2.12 5.06.49 6.26-.14.48-.32.96-.53 1.37zM13 3.5c.52-.01 1.01.21 1.4.58.3.3.47.7.47 1.13 0 .19-.01.38-.03.56-.63.03-1.29-.21-1.74-.66-.41-.39-.62-.96-.62-1.54 0-.02.52-.07.52-.07z" />
                </svg>
                Add to Apple Wallet
            </Button>
        )
    }

    if (os === "android") {
        return (
            <Button variant="outline" className="h-12 w-full sm:w-auto rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 font-bold gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Add to Google Wallet
            </Button>
        )
    }

    return (
        <Button variant="outline" className="h-12 w-full sm:w-auto rounded-xl border-gray-200 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 font-bold gap-2">
            <Wallet className="w-5 h-5" />
            Add to Mobile Wallet
        </Button>
    )
}
