"use client"

import { Laptop, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlatformToggleProps {
    view: "mobile" | "desktop"
    setView: (view: "mobile" | "desktop") => void
}

export function PlatformToggle({ view, setView }: PlatformToggleProps) {
    return (
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-full border border-gray-200 dark:border-zinc-700">
            <button
                onClick={() => setView("mobile")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    view === "mobile"
                        ? "bg-white dark:bg-black text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
            >
                <Smartphone className="w-4 h-4" />
                Mobile PWA
            </button>
            <button
                onClick={() => setView("desktop")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    view === "desktop"
                        ? "bg-white dark:bg-black text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
            >
                <Laptop className="w-4 h-4" />
                Desktop
            </button>
        </div>
    )
}
