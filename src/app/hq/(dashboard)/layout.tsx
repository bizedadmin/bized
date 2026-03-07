import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { ShieldAlert, Server, Users, Settings, Activity, Globe, CreditCard, BarChart3, Bug, Radar, MessageSquare, Zap } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { UserProfile } from "@/components/hq/UserProfile";
import { redirect } from "next/navigation";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const isPlatformSubdomain = host.startsWith("platform.") || host === "platform.localhost:3000";
    const session = await auth();

    // If not on a subdomain, we need to prefix links with /hq
    const basePath = isPlatformSubdomain ? "" : "/hq";

    if (!session) {
        redirect(`${basePath}/login`);
    }

    return (
        // Force a dark theme or a distinct color scheme for the platform admin
        <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col">
                <div className="p-6">
                    <Link href={basePath || "/"} className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Bized HQ</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    <NavItem href={`${basePath}`} icon={<Activity className="w-5 h-5" />} label="Overview" />
                    <NavItem href={`${basePath}/financials`} icon={<BarChart3 className="w-5 h-5" />} label="Financials" />
                    <NavItem href={`${basePath}/businesses`} icon={<Server className="w-5 h-5" />} label="Businesses" />
                    <NavItem href={`${basePath}/users`} icon={<Users className="w-5 h-5" />} label="Platform Staff" />
                    <NavItem href={`${basePath}/transactions`} icon={<CreditCard className="w-5 h-5" />} label="Transactions" />
                    <NavItem href={`${basePath}/errors`} icon={<Bug className="w-5 h-5" />} label="Error Logs" badge />
                    <NavItem href={`${basePath}/sentry`} icon={<Radar className="w-5 h-5" />} label="Sentry Issues" />
                    <NavItem href={`${basePath}/whatsapp`} icon={<MessageSquare className="w-5 h-5" />} label="WhatsApp API" />
                    <NavItem href={`${basePath}/wabaprofile`} icon={<Zap className="w-5 h-5" />} label="WABA Profile" />

                    <div className="pt-8 pb-2 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        System
                    </div>
                    <NavItem href={`${basePath}/settings/variables`} icon={<Globe className="w-5 h-5" />} label="Global Variables" />
                    <NavItem href={`${basePath}/settings/subscriptions`} icon={<Settings className="w-5 h-5" />} label="Subscriptions" />
                </nav>

                <UserProfile session={session} />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen p-8 bg-neutral-950/50">
                {children}
            </main>

        </div>
    );
}

function NavItem({ href, icon, label, badge }: { href: string; icon: ReactNode; label: string; badge?: boolean }) {
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
            {badge && <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
        </Link>
    );
}
