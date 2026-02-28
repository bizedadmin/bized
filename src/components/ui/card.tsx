"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                className={cn(
                    "bg-[var(--color-surface-container)] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-[var(--color-outline-variant)]/20",
                    className
                )}
                whileHover={{ y: -4 }}
                transition={{ ease: [0.2, 0, 0, 1] as const, duration: 0.3 }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
Card.displayName = "Card";

export { Card };
