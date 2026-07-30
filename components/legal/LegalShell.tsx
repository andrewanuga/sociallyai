import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function LegalShell({
  title, updated, intro, children, other,
}: {
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
  other: { href: string; label: string };
}) {
  return (
    <div className="relative min-h-screen" style={{ background: "#121212", color: "#f5f4f2" }}>
      {/* ambient bloom */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[440px] w-[440px] rounded-full opacity-30 blur-[130px]" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)" }} />
      </div>

      {/* top bar */}
      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={24} height={21} className="h-[22px] w-auto" />
          <span className="font-display text-[15px] font-semibold">Socially<span className="text-[var(--sai-indigo)]"> AI</span></span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-[13px] text-white/50 transition-colors hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
      </header>

      <main className="relative mx-auto max-w-3xl px-5 pb-24 pt-4">
        <p className="font-data text-[11px] uppercase tracking-[0.22em] text-[var(--sai-indigo)]">Legal</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-white/40">Last updated: {updated}</p>
        <p className="mt-6 text-[15px] leading-relaxed text-white/70">{intro}</p>

        <div className="sai-legal mt-10 space-y-9">{children}</div>

        {/* footer cross-links */}
        <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.08] pt-8 text-[13px] text-white/50">
          <Link href={other.href} className="transition-colors hover:text-white">{other.label} →</Link>
          <Link href="/" className="transition-colors hover:text-white">Back to Socially AI</Link>
          <span className="ml-auto text-white/30">© {new Date().getFullYear()} Socially AI</span>
        </div>
      </main>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-white/65">{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "var(--sai-indigo)" }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
