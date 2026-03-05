"use client";

import React from "react";

interface CircularProgressProps {
    size?: number;
    strokeWidth?: number;
    className?: string;
}

/**
 * Material 3 Indeterminate Circular Progress Indicator
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
    size = 40,
    strokeWidth = 4,
    className = "",
}) => {
    return (
        <div
            role="progressbar"
            className={`relative inline-block ${className}`}
            style={{
                width: size,
                height: size,
                animation: 'm3-circular-rotate 2s linear infinite'
            }}
        >
            <svg
                viewBox="22 22 44 44"
                className="w-full h-full"
            >
                <circle
                    cx="44"
                    cy="44"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className="text-[var(--color-primary)]"
                    style={{
                        strokeDasharray: '1, 200',
                        strokeDashoffset: 0,
                        animation: 'm3-circular-dash 1.5s ease-in-out infinite',
                    }}
                />
            </svg>
        </div>
    );
};
