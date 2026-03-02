import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getPlatformSettings } from "@/lib/platform-settings";
import { auth } from "@/auth";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getPlatformSettings();
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.isSuperAdmin === true;

    // Check Maintenance Mode
    if (settings.maintenanceMode && !isSuperAdmin) {
        return (
            <div className="min-h-screen bg-[var(--color-surface-container-lowest)] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8 animate-pulse">
                    <ShieldAlert size={48} className="text-indigo-600" />
                </div>
                <h1 className="text-4xl font-black text-[var(--color-on-surface)] mb-4 tracking-tight">System Maintenance</h1>
                <p className="text-lg text-[var(--color-on-surface-variant)] max-w-md mb-10 opacity-70">
                    Bized is currently undergoing scheduled maintenance to improve our services.
                    We'll be back online shortly. Thank you for your patience!
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <a href={`mailto:${settings.supportEmail}`} className="px-8 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:opacity-90 transition-all">
                        Contact Support
                    </a>
                    <Link href="/signin" className="px-8 py-3 rounded-2xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-bold hover:bg-[var(--color-surface-container-highest)] transition-all">
                        Try Login
                    </Link>
                </div>
                <p className="mt-20 text-xs font-bold text-[var(--color-on-surface-variant)] opacity-30 uppercase tracking-[0.2em]">
                    Bized Commerce OS
                </p>
            </div>
        );
    }

    return (
        <>
            <Header />
            {children}
            <Footer settings={settings} />
        </>
    );
}
