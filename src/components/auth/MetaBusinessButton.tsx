"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { useMetaBusinessAuth, MetaAuthIntent } from "@/hooks/useMetaBusinessAuth";

interface MetaBusinessButtonProps {
    intent: MetaAuthIntent;
    slug?: string;
    className?: string;
    label?: string;
}

const MetaIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

export function MetaBusinessButton({ intent, slug, className, label }: MetaBusinessButtonProps) {
    const { startMetaBusinessAuth } = useMetaBusinessAuth();

    const handleClick = () => {
        startMetaBusinessAuth({ intent, slug });
    };

    const defaultLabel = intent === 'signup'
        ? "Continue with Meta"
        : "Connect Meta Commerce";

    return (
        <Button
            variant="outline"
            className={`w-full h-12 flex items-center justify-center gap-3 border-[var(--color-outline)]/20 hover:bg-[var(--color-surface-container)] hover:border-[var(--color-outline)]/40 text-[var(--color-on-surface)] ${className}`}
            onClick={handleClick}
        >
            <MetaIcon />
            <span>{label || defaultLabel}</span>
        </Button>
    );
}
