import type { Metadata } from "next";
import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — Socially AI",
  description: "The terms for using Socially AI.",
};

const CONTACT = "support@socially-ai.app";

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="July 30, 2026"
      intro="These terms are the agreement between you and Socially AI. We've kept them readable. By creating an account or using the service, you agree to them."
      other={{ href: "/privacy", label: "Privacy Policy" }}
    >
      <Section title="1. The service">
        <p>Socially AI is a workspace for creating, scheduling, publishing, and analyzing social media content, with AI assistance and optional automation (bots, Ghost Mode, auto-replies). Features vary by plan and by the platforms you connect.</p>
      </Section>

      <Section title="2. Your account">
        <Bullets items={[
          "You must be at least 16 and provide accurate information.",
          "You are responsible for activity under your account and for keeping your credentials safe.",
          "You may connect social accounts you own or are authorized to manage.",
        ]} />
      </Section>

      <Section title="3. Acceptable use">
        <p>You agree not to use Socially AI to:</p>
        <Bullets items={[
          "Break the law or the rules of any connected platform.",
          "Send spam, run deceptive engagement, or manipulate metrics.",
          "Post hateful, harassing, infringing, or otherwise harmful content.",
          "Reverse-engineer, overload, or abuse the service or its APIs.",
        ]} />
        <p>We may suspend accounts that violate these terms.</p>
      </Section>

      <Section title="4. Third-party platforms">
        <p>When you connect a platform (Meta, Google/YouTube, X, LinkedIn, Snap, Reddit, Telegram, WhatsApp, and others), you must also follow that platform’s terms. Those platforms can change or restrict their APIs at any time, which may affect features. We act on your behalf only within the permissions you grant, and you can disconnect at any time.</p>
      </Section>

      <Section title="5. AI-generated content">
        <p>Socially AI helps you draft content, but you are responsible for what you publish. Review AI output before posting. AI can be wrong or produce content that needs editing. Subject to these terms, content you create with the tool is yours; you grant us the limited rights needed to store and process it to run the service.</p>
      </Section>

      <Section title="6. Plans & payments">
        <Bullets items={[
          "Paid plans are billed in advance (monthly or annually) via Paystack / Flutterwave.",
          "Free trials convert to paid unless cancelled before they end.",
          "You can cancel anytime; access continues until the end of the current billing period.",
          "Fees are non-refundable except where required by law.",
        ]} />
      </Section>

      <Section title="7. Availability & changes">
        <p>We work to keep Socially AI available and improving, but we may modify, suspend, or discontinue features. We’ll give reasonable notice of material changes where we can.</p>
      </Section>

      <Section title="8. Disclaimers">
        <p>The service is provided “as is”. We don’t guarantee specific results (reach, engagement, revenue, or that a post will publish successfully on a third-party platform). Use of automation is at your discretion and risk.</p>
      </Section>

      <Section title="9. Limitation of liability">
        <p>To the maximum extent permitted by law, Socially AI is not liable for indirect, incidental, or consequential damages, or for lost profits or data. Our total liability is limited to the amount you paid us in the 3 months before the claim.</p>
      </Section>

      <Section title="10. Termination">
        <p>You may stop using the service and delete your account at any time. We may suspend or terminate access for violations of these terms or misuse of the service.</p>
      </Section>

      <Section title="11. Governing law & contact">
        <p>These terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law rules. Questions or notices? Email <a href={`mailto:${CONTACT}`} className="text-[var(--sai-indigo)] hover:underline">{CONTACT}</a>.</p>
      </Section>
    </LegalShell>
  );
}
