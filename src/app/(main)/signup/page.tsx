import { getPlatformSettings } from "@/lib/platform-settings";
import { Lock } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import Link from "next/link";
import { Suspense } from "react";
import SignUpContentClient from "./content";

export default async function SignUpPage() {
    const settings = await getPlatformSettings();

    if (settings.registrationLocked) {
        return (
            <AuthLayout
                title="Registration Closed"
                subtitle="We are currently not accepting new signups."
            >
                <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                        <Lock size={36} className="text-red-500" />
                    </div>
                    <p className="text-[var(--color-on-surface-variant)] mb-8">
                        The platform is currently in private mode or under maintenance.
                        Please try again later or contact support if you have an invite.
                    </p>
                    <Link href="/signin" className="px-8 py-3 rounded-2xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-bold hover:bg-[var(--color-surface-container-highest)] transition-all">
                        Back to Login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <Suspense fallback={
            <AuthLayout title="Loading..." subtitle="Please wait">
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AuthLayout>
        }>
            <SignUpContentClient />
        </Suspense>
    );
}
