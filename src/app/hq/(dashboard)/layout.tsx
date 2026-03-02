import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { ShieldAlert, Server, Users, Settings, Activity, Globe } from "lucide-react";

export default function PlatformLayout({ children }: { children: ReactNode }) {
    return (
        // Force a dark theme or a distinct color scheme for the platform admin
        <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 border-r border-neutral-800 bg-neutral-950">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Bized HQ</span>
                    </Link>
                </div>

                <nav className="px-4 py-4 space-y-1">
                    <NavItem href="/" icon={<Activity className="w-5 h-5" />} label="Overview" />
                    <NavItem href="/businesses" icon={<Server className="w-5 h-5" />} label="Businesses" />
                    <NavItem href="/users" icon={<Users className="w-5 h-5" />} label="Platform Staff" />

                    <div className="pt-8 pb-2 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        System
                    </div>
                    <NavItem href="/settings/variables" icon={<Globe className="w-5 h-5" />} label="Global Variables" />
                    <NavItem href="/settings/subscriptions" icon={<Settings className="w-5 h-5" />} label="Subscriptions" />
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen p-8 bg-neutral-950/50">
                {children}
            </main>

        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
        text-neutral-400 hover:text-white hover:bg-neutral-900
      `}
        >
            {icon}
            {label}
        </Link>
    );
}
