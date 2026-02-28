"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/hooks/useAuth";

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.053-1.147 8.213-3.08 2.187-1.933 2.853-4.8 2.853-7.227 0-.693-.067-1.347-.187-2.773h-10.88z" fill="currentColor" /></svg>
);

function SignUpContent() {
    const {
        handleGoogleSignIn,
        handleEmailSignUp,
        isLoading,
        isRedirecting,
        error
    } = useAuth();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (email && password) {
            await handleEmailSignUp(email, password, name);
        }
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start your 14-day free trial today"
            isRedirecting={isRedirecting}
        >
            {error && (
                <div className="mb-4 p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">
                    {error}
                </div>
            )}

            <div className="space-y-3 mb-6">
                <Button
                    variant="outline"
                    className="w-full h-12 border-[var(--color-outline)]/20 hover:bg-[var(--color-surface-container)] hover:border-[var(--color-outline)]/40 text-[var(--color-on-surface)]"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    <GoogleIcon />
                    <span>Sign up with Google</span>
                </Button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[var(--color-outline-variant)]"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 text-[var(--color-on-surface)]/60 bg-[var(--color-surface)]">or</span>
                </div>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                    <input
                        name="name"
                        type="text"
                        placeholder="Full name"
                        required
                        className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all placeholder:[var(--color-on-surface)]/40 text-[var(--color-on-surface)]"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        required
                        className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all placeholder:[var(--color-on-surface)]/40 text-[var(--color-on-surface)]"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all placeholder:[var(--color-on-surface)]/40 text-[var(--color-on-surface)]"
                        disabled={isLoading}
                    />
                </div>
                <Button className="w-full h-12 text-base font-semibold mt-6" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm text-[var(--color-on-surface)]/60">
                Already have an account?{" "}
                <Link href="/signin" className="font-medium text-[var(--color-primary)] hover:underline">
                    Log in
                </Link>
            </div>
        </AuthLayout>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Loading..." subtitle="Please wait">
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AuthLayout>
        }>
            <SignUpContent />
        </Suspense>
    );
}
