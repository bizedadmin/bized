"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

export default function AdminHeader() {
    const { data: session, status } = useSession();

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
                {/* Can search here if needed */}
                <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center overflow-hidden">
                        {status === "loading" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Admin"} />
                                <AvatarFallback>{session?.user?.name?.[0] || "A"}</AvatarFallback>
                            </Avatar>
                        )}
                        <span className="sr-only">Toggle user menu</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
