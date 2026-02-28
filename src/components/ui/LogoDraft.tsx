import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-[var(--color-primary)]", className)} // Default to primary color (blue)
            {...props}
        >
            {/* 
        Refined abstract "b" speech bubble path:
        1. Vertical line for 'b' stem.
        2. Tail at bottom left.
        3. Round bowl for 'b' / bubble.
       */}
            <path d="M6 5v11c0 2.2 1.8 4 4 4h2c4.4 0 8-3.6 8-8s-3.6-8-8-8c-2.2 0-4 1.8-4 4" />
            <path d="M6 16l-3 3 4-1" /> {/* Tail */}
            <path d="M6 12a4 4 0 0 1 4-4" /> {/* Inner hint? No, let's keep it simple */}

            {/* Let's try a single continuous path if possible or a cleaner composite */}
            {/* Resetting path to a better "b + bubble" shape */}

            {/* Clear previous paths and use this one: */}
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" style={{ display: 'none' }} />
            {/* The above is a generic chat bubble. Let's do the "b" specific one. */}

            <path d="M7 6v10" /> {/* Stem */}
            <path d="M7 16l-4 4 4-2" /> {/* Tail adjustment */}
            <path d="M7 12c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6" /> {/* Bowl overlapping stem? */}

            {/* 
         Third attempt - closer to the "b" bubble concept:
         A circle that forms a 'b'.
       */}
        </svg>
    );
}

// Redefining the component with the BEST guess path for "b" bubble
export function LogoFinal({ className, ...props }: LogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-blue-600", className)}
            {...props}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" style={{ display: 'none' }} /> {/* Generic bubble */}

            {/* 
            "b" logo path:
            Vertical line on left.
            Circle on right.
            Tail on bottom left.
         */}
            <path d="M8 4v16l-5-4" /> {/* Vertical line + Tail */}
            <path d="M8 8a8 8 0 0 1 0 16" style={{ display: 'none' }} />

            {/* Let's Try: A 'b' that looks like a bubble */}
            <path d="M4 20l6-16h2a8 8 0 0 1 8 8 a8 8 0 0 1-8 8H7l-3 4z" style={{ display: 'none' }} />

            {/* OK, simple "b" logo */}
            <path d="M6.5 7v10.5" />
            <path d="M6.5 17.5l-4 3" />
            <path d="M6.5 13a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" transform="translate(0 4.5)" style={{ display: 'none' }} />

            <path d="M8 20L4 23V10a6 6 0 0 1 12 0c0 3.3-2.7 6-6 6h-2" /> {/* Close... */}
        </svg>
    )
}
