import { Metadata } from "next";
import WhatsAppOnboardingContentClient from "./content";

export const metadata: Metadata = {
    title: "Onboard with WhatsApp Business | Bized",
    description: "Connect your WhatsApp Business Account to Bized in seconds. Sync catalogs and launch your AI-powered business hub instantly.",
    openGraph: {
        title: "Onboard with WhatsApp Business | Bized",
        description: "Connect your WhatsApp Business Account to Bized in seconds. Sync catalogs and launch your AI-powered business hub instantly.",
        images: [
            {
                url: "/whatsapp_onboarding_illustration.png",
                width: 1200,
                height: 630,
                alt: "WhatsApp Business Onboarding on Bized",
            },
        ],
    },
};

export default function WhatsAppOnboardingPage() {
    return <WhatsAppOnboardingContentClient />;
}
