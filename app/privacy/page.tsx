import type { Metadata } from "next";
import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Socially AI",
  description: "How Socially AI collects, uses, and protects your data.",
};

const CONTACT = "privacy@socially-ai.app";

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="July 30, 2026"
      intro="Socially AI helps you manage your social media accounts. This policy explains, in plain language, what we collect, why, and the control you have. We only ever access what you explicitly connect, and we never sell your data."
      other={{ href: "/terms", label: "Terms of Service" }}
    >
      <Section title="Who we are">
        <p>Socially AI (“Socially”, “we”, “us”) provides an AI-powered workspace for scheduling, publishing, engaging, and analyzing social media across connected platforms. This policy covers our website, app, and services.</p>
      </Section>

      <Section title="What we collect">
        <Bullets items={[
          <><b className="text-white">Account details</b> — your name, email, username, and password (stored securely, hashed) when you sign up.</>,
          <><b className="text-white">Onboarding answers</b> — your persona (client, creator, or marketer), niche, posting cadence, and similar preferences you provide.</>,
          <><b className="text-white">Connected-account data</b> — when you connect a platform (Instagram, YouTube, X, LinkedIn, Facebook, Threads, Snapchat, Reddit, Telegram, WhatsApp), we receive an OAuth access token and, with your permission, read data such as your profile, posts, metrics, comments, and messages. We request the minimum scopes needed.</>,
          <><b className="text-white">Content you create</b> — drafts, scheduled posts, chat conversations with the AI agent, tasks, and any files, images, or videos you upload.</>,
          <><b className="text-white">Usage data</b> — basic logs (device, browser, actions) used to keep the service reliable and secure.</>,
          <><b className="text-white">Payment data</b> — handled by our processor (Paystack / Flutterwave). We never see or store full card details.</>,
        ]} />
      </Section>

      <Section title="How we use your data">
        <Bullets items={[
          "Provide the service: publish, schedule, triage your inbox, and show analytics.",
          "Power your AI agent: generate drafts and replies, and learn your writing tone so responses sound like you.",
          "Surface trends and recommendations relevant to your niche and connected accounts.",
          "Run autonomous features you enable (e.g. Ghost Mode, auto-replies) strictly within your settings.",
          "Process payments, prevent abuse, and keep the platform secure.",
        ]} />
      </Section>

      <Section title="Third-party platforms">
        <p>When you connect a social platform, your use of that platform is also governed by its own terms and privacy policy (e.g. Meta, Google/YouTube, X, LinkedIn, Snap, Reddit, Telegram, WhatsApp). We access your data on those platforms only to provide features you request, and only within the permissions (scopes) you grant. You can revoke our access at any time from the platform or from our Integrations page.</p>
        <p>Google user data: our use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.</p>
      </Section>

      <Section title="How we share data">
        <p>We do not sell your personal data. We share it only with:</p>
        <Bullets items={[
          "Service providers that run the product (hosting, database, payment processing) under strict agreements.",
          "The social platforms you connect, to carry out actions you request (like publishing a post).",
          "Authorities when required by law, or to protect rights and safety.",
        ]} />
      </Section>

      <Section title="AI processing">
        <p>Your prompts and connected content may be processed by our AI models (self-hosted Llama, or a configured provider) to generate content and learn your tone. We use this to serve you — not to train public models on your private data.</p>
      </Section>

      <Section title="Data retention & security">
        <p>We keep your data while your account is active and delete or anonymize it on request or after account closure, subject to legal obligations. We protect data with encryption in transit, row-level security, and access controls. OAuth tokens are stored securely and used only for the features you enable.</p>
      </Section>

      <Section title="Your rights">
        <p>You can access, correct, export, or delete your data, disconnect any platform, and close your account at any time. To make a request, email us at <a href={`mailto:${CONTACT}`} className="text-[var(--sai-indigo)] hover:underline">{CONTACT}</a>. If you are in a region with data-protection laws (e.g. GDPR/NDPR), you have additional rights including objection and portability.</p>
      </Section>

      <Section title="Cookies">
        <p>We use essential cookies for sign-in and security, and minimal analytics to improve the product. You can control cookies in your browser.</p>
      </Section>

      <Section title="Children">
        <p>Socially AI is not intended for anyone under 16. We do not knowingly collect data from children.</p>
      </Section>

      <Section title="Changes & contact">
        <p>We may update this policy; we’ll revise the “last updated” date and, for material changes, notify you in-app. Questions? Reach us at <a href={`mailto:${CONTACT}`} className="text-[var(--sai-indigo)] hover:underline">{CONTACT}</a>.</p>
      </Section>
    </LegalShell>
  );
}
