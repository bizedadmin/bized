import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { IndustryShowcaseSection } from "@/components/landing/IndustryShowcaseSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { HowBookingWorksSection } from "@/components/landing/HowBookingWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[var(--color-surface-container-low)]">
      <HeroSection />
      <FeatureGrid />
      <HowBookingWorksSection />
      <HowItWorksSection />
      <PricingSection />
      <IndustryShowcaseSection />
    </main>
  );
}
