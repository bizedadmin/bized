"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useBusiness } from "@/contexts/BusinessContext";

export function ImpersonationBanner() {
    const [isImpersonating, setIsImpersonating] = useState(false);
    const { currentBusiness } = useBusiness();

    useEffect(() => {
        // Simple check to see if the cookie exists (since it's HTTP-only, JS can't read its value directly,
        // but it will be sent with our API calls which caused the impersonation). 
        // A better way is to rely on the API returning a flag or checking auth session.
        // However, a hacky reliable client way is sending a tiny request to an endpoint that explicitly tells us.
        fetch("/api/auth/session").then(res => res.json()).then(session => {
            // For now, we will assume if the User sees a store they shouldn't own, or if we define a state.
            // Actually, since HTTPOnly hides it, let's look at the document.cookie if we remove HttpOnly or just check the session.
            // Actually, the simplest check is: does the currentBusiness owner match the session user?
            if (session?.user?.id && currentBusiness && currentBusiness.ownerId !== session.user.id && session.user.isSuperAdmin) {
                setIsImpersonating(true);
            } else {
                setIsImpersonating(false);
            }
        }).catch(() => { });
    }, [currentBusiness]);

    if (!isImpersonating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-4 text-sm font-medium shadow-lg animate-in slide-in-from-top">
            <AlertCircle className="w-4 h-4" />
            <span>
                You are currently impersonating <strong>{currentBusiness?.name}</strong>.
            </span>
            <a
                href="/api/auth/stop-impersonation"
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs transition-colors ml-4"
            >
                Stop Impersonating
            </a>
        </div>
    );
}
