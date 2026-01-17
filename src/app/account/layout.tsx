
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, Calendar, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const sidebarItems = [
        {
            title: "Profile",
            href: "/account",
            icon: User,
        },
        {
            title: "My Bookings",
            href: "/account/bookings",
            icon: Calendar,
        },
    ]

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-muted/40 font-sans">
            <aside className="w-full md:w-64 border-r bg-background md:min-h-screen">
                <div className="flex h-16 items-center border-b px-6">
                    <span className="text-lg font-bold">My Account</span>
                </div>
                <div className="flex flex-col gap-2 p-4">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                                pathname === item.href
                                    ? "bg-muted text-primary"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                    <div className="mt-auto border-t pt-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-500 hover:text-red-500 hover:bg-red-50"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
