"use client"

import Link from "next/link"
import { ProfileCircle, Notification, Setting2, LogoutCurve } from "iconsax-reactjs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function AdminNavbar() {
    const { data: session } = useSession()
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <nav className="border-b bg-background h-16 flex items-center px-4 md:px-8 justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">BizedApp</span>
                </div>
            </nav>
        )
    }

    return (
        <nav className="border-b bg-background h-16 flex items-center px-4 md:px-8 justify-between">
            <div className="flex items-center gap-2">
                <Link href="/admin/dashboard" className="flex items-center gap-2 group">
                    {/* 
                        Use Blend Modes for Logo:
                        - Light Theme: Black Icon on White BG -> mix-blend-multiply
                        - Dark Theme: White Icon on Black BG -> mix-blend-screen
                     */}
                    <Image
                        src={theme === "dark" ? "/logo-dark-mode.png" : "/logo-light-mode.png"}
                        alt="Bized Logo"
                        width={32}
                        height={32}
                        className={cn(
                            "h-8 w-auto rounded-sm transition-transform group-hover:scale-105",
                            theme === "dark" ? "mix-blend-screen" : "mix-blend-multiply"
                        )}
                        priority
                    />
                    <span className="text-xl font-bold tracking-tight">BizedApp</span>
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Notification size="20" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                <AvatarFallback>{session?.user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                                <ProfileCircle size="16" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer flex items-center gap-2">
                                <Setting2 size="16" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2" onClick={() => signOut({ callbackUrl: '/login' })}>
                            <LogoutCurve size="16" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
}
