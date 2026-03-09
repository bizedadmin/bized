import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { CircularProgress } from "@/components/ui/Progress";
import OnboardingContentClient from "./content";

export const metadata = {
    title: "Onboarding - Bized.app",
    description: "Choose your path to get started with Bized.app",
};

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Loading..." subtitle="Please wait">
                <div className="flex justify-center py-12">
                    <CircularProgress size={40} />
                </div>
            </AuthLayout>
        }>
            <OnboardingContentClient />
        </Suspense>
    );
}
