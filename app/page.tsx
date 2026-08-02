import { Preloader } from "@/components/landing/Preloader";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { CinematicHero } from "@/components/landing/CinematicHero";
import {
  Features,
  AgentTools,
  Integrations,
  Collaboration,
  HowItWorks,
  Stories,
  Pricing,
  FinalCTA,
  SiteFooter,
} from "@/components/landing/LowerSections";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen" style={{ background: "#121212" }}>
      <Preloader />
      <FloatingNav />
      <main>
        <CinematicHero />
        <Features />
        <AgentTools />
        <Integrations />
        <Collaboration />
        <HowItWorks />
        <Stories />
        <Pricing />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
