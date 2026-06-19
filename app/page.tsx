import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { PowerAIHero } from "@/components/landing/PowerAIHero";
import { FeatureShowcaseGrid } from "@/components/ui/hero-section";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ROIPulse } from "@/components/landing/ROIPulse";
import { Comparison } from "@/components/landing/Comparison";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <PowerAIHero />
      <FeatureShowcaseGrid />
      <Features />
      <HowItWorks />
      <ROIPulse />
      <Comparison />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
