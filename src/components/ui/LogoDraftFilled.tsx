import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn("text-[var(--color-primary)]", className)}
            {...props}
        >
            {/* 
        Filled "b" speech bubble logo.
        Concept: A solid shape combining the 'b' stem and the bubble bowl.
      */}
            <path d="M6 3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h.5a6.5 6.5 0 1 0 3-12.25V4a1 1 0 0 0-1-1H6zm5.5 5.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" />
            <path d="M4 21.5a1 1 0 0 1-1.5-.83V16a1 1 0 0 1 2 0v2.62l1.58-1.58a1 1 0 0 1 1.42 1.42L4 21.5z" /> {/* Tail */}

            {/* 
         Actually, let's use a simpler composite path for a "b" bubble.
      */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 4a2 2 0 0 0-2 2v10.5c0 .8.9 1.3 1.5.8L9 15h3a7 7 0 1 0-7-7V4zm6 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10H8l-2 2V6a.5.5 0 0 1 .5-.5h.5v5.5a2.5 2.5 0 0 0 5 0V8.2A3 3 0 1 1 12 16z"
                style={{ display: 'none' }}
            />

            {/* 
         Attempt 3: Strong, bold "b" shape.
       */}
            <path d="M5 3a2 2 0 0 0-2 2v12c0 1.5 1.5 2.5 2.5 1.5l2.5-2.5h2a8 8 0 1 0-8-8H5V3z" />
            <path d="M10 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12h-2l-3 3v-3H4" style={{ display: 'none' }} />
        </svg>
    );
}

// Final polished filled version
export function LogoFilled({ className, ...props }: LogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="currentColor"
            className={cn("text-[var(--color-primary)]", className)}
            {...props}
        >
            {/* 
            This path mimics a bold 'b' in a speech bubble style.
            - Outer shape is the bubble.
            - 'b' is negative space or formed by the shape.
            Let's go with the shape forming the 'b'.
        */}
            <path d="M64 64C28.7 64 0 92.7 0 128v256c0 35.3 28.7 64 64 64h66l64.6 57.4c6.2 5.5 15.6 5.3 21.6-.2l.6-.6L278 448h170c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm64 96h32c53 0 96 43 96 96s-43 96-96 96h-32V160zm32 160c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z" />
        </svg>
    )
}
