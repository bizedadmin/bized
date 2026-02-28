"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export default function ChatsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-24 h-24 rounded-[2rem] bg-[var(--color-surface-container-high)] flex items-center justify-center mb-6 text-[var(--color-on-surface-variant)] opacity-20">
                <MessageSquare size={48} />
            </div>
            <h1 className="text-2xl font-black text-[var(--color-on-surface)] mb-2">Chats</h1>
            <p className="text-[var(--color-on-surface-variant)] opacity-50 max-w-sm">
                Communicate with your customers. Coming soon.
            </p>
        </div>
    );
}
