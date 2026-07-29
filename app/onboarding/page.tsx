import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata = { title: "Set up your workspace — Socially AI" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarded")
    .eq("id", user.id)
    .single();

  if (profile?.onboarded) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-14" style={{ background: "#121212" }}>
      {/* Ambient blooms */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full opacity-40 blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)" }}
        />
        <div
          className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3), transparent 70%)" }}
        />
      </div>

      <Link href="/" className="relative mb-10 flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={26} height={23} className="h-[24px] w-auto" />
        <span className="font-display text-lg font-semibold text-white">
          Socially<span className="text-[var(--sai-indigo)]"> AI</span>
        </span>
      </Link>

      <div className="relative w-full flex justify-center">
        <OnboardingFlow initialName={profile?.full_name ?? undefined} />
      </div>
    </div>
  );
}
