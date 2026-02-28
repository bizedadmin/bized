"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "text" | "outline" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
        const baseStyles = "relative overflow-hidden rounded-full font-medium transition-colors flex items-center justify-center gap-2";

        const sizes = {
            default: "px-6 py-3 text-sm tracking-wide",
            sm: "px-4 py-2 text-xs",
            lg: "px-8 py-4 text-base",
            icon: "h-10 w-10",
        };

        const variants = {
            primary: "bg-[var(--color-primary)] text-white hover:shadow-lg",
            secondary: "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)]",
            text: "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10",
            outline: "bg-transparent border border-[var(--color-outline)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]",
            link: "text-[var(--color-primary)] underline-offset-4 hover:underline px-0 py-0 h-auto",
        };

        return (
            <motion.button
                ref={ref}
                className={cn(baseStyles, sizes[size], variants[variant], className)}
                whileHover={{ scale: variant === 'link' ? 1 : 1.02 }}
                whileTap={{ scale: variant === 'link' ? 1 : 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                {...props}
            >
                <div className="relative z-10 flex items-center gap-2">{children}</div>
                {variant !== 'link' && (
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                )}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button };
