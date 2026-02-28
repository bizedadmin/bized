import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
    return (
        <div className={cn("relative h-8 w-8", className)} {...props}>
            <img
                src="/logo.png"
                alt="Bized Logo"
                className="absolute inset-0 h-full w-full object-contain dark:hidden"
            />
            <img
                src="/logo-dark.png"
                alt="Bized Logo"
                className="absolute inset-0 hidden h-full w-full object-contain dark:block"
            />
        </div>
    );
}
