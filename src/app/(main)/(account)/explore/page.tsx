"use client";

import React from "react";
import { Compass } from "lucide-react";

export default function ExplorePage() {
    return (
        <div className="p-6 md:p-10 lg:p-16 h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-[var(--color-surface-container-high)] flex items-center justify-center mb-6 text-[var(--color-on-surface-variant)] opacity-20">
                <Compass size={40} />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight mb-2">Explore</h1>
            <p className="text-[var(--color-on-surface-variant)] opacity-60 max-w-md">
                Discover new businesses, trends, and opportunities tailored just for you.
            </p>
        </div>
    );
}
