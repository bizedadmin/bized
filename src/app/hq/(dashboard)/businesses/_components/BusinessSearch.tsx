"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";

export function BusinessSearch({ initialQuery }: { initialQuery: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(initialQuery);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Use router.push to tell Next.js to do a soft navigation and re-render the RSC
        router.push(`${pathname}?${createQueryString("q", query)}`);
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or subdomain..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <button type="submit" className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition">
                Search
            </button>
            {initialQuery && (
                <Link href={pathname} className="inline-flex items-center justify-center px-4 py-2 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 rounded-lg transition">
                    Clear
                </Link>
            )}
        </form>
    );
}
