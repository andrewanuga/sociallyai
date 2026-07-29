"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase, Sparkles, Megaphone, ArrowRight, ArrowLeft,
  Loader2, Check, AtSign, CalendarClock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

type Persona = "client" | "creator" | "marketer";

const PERSONAS: {
  id: Persona; icon: typeof Briefcase; title: string; blurb: string; tone: string;
}[] = [
  { id: "client", icon: Briefcase, title: "A client", blurb: "I run a business and want my socials handled.", tone: "var(--sai-indigo)" },
  { id: "creator", icon: Sparkles, title: "A creator", blurb: "I build an audience and want to grow faster.", tone: "var(--sai-violet)" },
  { id: "marketer", icon: Megaphone, title: "A marketer", blurb: "I drive conversions across channels.", tone: "var(--sai-gold)" },
];

const CADENCE = [
  { v: 2, label: "1–2 a week", sub: "Testing the waters" },
  { v: 5, label: "3–5 a week", sub: "Staying consistent" },
  { v: 10, label: "6–10 a week", sub: "Building momentum" },
  { v: 14, label: "Daily+", sub: "All gas, no brakes" },
];

const CLIENT_ACTIVITY = [
  "Just getting started", "Posting occasionally", "Consistently active", "Managing at scale",
];
const CREATOR_RANGE = ["0 – 1K", "1K – 10K", "10K – 100K", "100K+"];
const CREATOR_SCALE = ["More reach", "Deeper engagement", "Monetization", "All of it"];
const MARKETER_CONV = ["Under 1%", "1 – 3%", "3 – 5%", "5%+"];
const BUSINESS_TYPES = ["E-commerce", "SaaS", "Agency", "Local business", "Personal brand", "Other"];

const inputCls =
  "flex h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-[var(--sai-indigo)]/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/25";

function Chip({
  active, onClick, children, sub,
}: { active: boolean; onClick: () => void; children: React.ReactNode; sub?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border p-3.5 text-left transition-all duration-200"
      style={{
        borderColor: active ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.10)",
        background: active ? "color-mix(in srgb, var(--sai-indigo) 14%, transparent)" : "rgba(255,255,255,0.03)",
        boxShadow: active ? "0 0 26px -10px rgba(99,102,241,0.8)" : "none",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{children}</span>
        {active && <Check className="h-4 w-4 text-[var(--sai-indigo)]" />}
      </div>
      {sub && <span className="mt-0.5 block text-[12px] text-white/45">{sub}</span>}
    </button>
  );
}

export function OnboardingFlow({ initialName }: { initialName?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { error: toastError } = useToast();

  const [persona, setPersona] = useState<Persona | null>(null);
  const [username, setUsername] = useState("");
  const [postsPerWeek, setPostsPerWeek] = useState<number | null>(null);
  // persona-specific
  const [socialActivity, setSocialActivity] = useState("");
  const [audienceRange, setAudienceRange] = useState("");
  const [scalingGoal, setScalingGoal] = useState("");
  const [conversionRate, setConversionRate] = useState("");
  const [businessType, setBusinessType] = useState("");

  const TOTAL = 3;

  const go = (next: number) => setStep(next);

  const stepValid = useMemo(() => {
    if (step === 0) return !!persona;
    if (step === 1) return username.trim().length >= 2 && postsPerWeek != null;
    if (step === 2) {
      if (persona === "client") return !!socialActivity;
      if (persona === "creator") return !!audienceRange && !!scalingGoal;
      if (persona === "marketer") return !!conversionRate && !!businessType;
    }
    return false;
  }, [step, persona, username, postsPerWeek, socialActivity, audienceRange, scalingGoal, conversionRate, businessType]);

  const finish = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error: upErr } = await supabase
      .from("profiles")
      .update({
        persona,
        username: username.trim(),
        posts_per_week: postsPerWeek,
        social_activity: persona === "client" ? socialActivity : null,
        audience_range: persona === "creator" ? audienceRange : null,
        scaling_goal: persona === "creator" ? scalingGoal : null,
        conversion_rate: persona === "marketer" ? conversionRate : null,
        business_type: persona === "marketer" ? businessType : null,
        onboarded: true,
        onboarded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (upErr) {
      toastError("Couldn't save your setup", upErr.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-xl">
      {/* progress */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: i <= step ? "100%" : "0%",
                background: "linear-gradient(90deg,#6366f1,#a855f7)",
              }}
            />
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-3xl p-7 sm:p-9">
        <div key={step} className="sai-step-in">
          {/* ── Step 0: persona ── */}
          {step === 0 && (
            <>
              <span className="font-data text-[11px] uppercase tracking-[0.24em] text-[var(--sai-indigo)]">
                Step 01
              </span>
              <h1 className="font-display mt-3 text-2xl font-semibold text-white sm:text-3xl">
                What are you using Socially for?
              </h1>
              <p className="mt-2 text-sm text-white/55">
                We&apos;ll tailor the agent, dashboard, and suggestions to you.
              </p>
              <div className="mt-7 grid gap-3">
                {PERSONAS.map((p) => {
                  const active = persona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id)}
                      className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200"
                      style={{
                        borderColor: active ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.10)",
                        background: active ? "color-mix(in srgb, var(--sai-indigo) 12%, transparent)" : "rgba(255,255,255,0.03)",
                        boxShadow: active ? "0 0 30px -12px rgba(99,102,241,0.9)" : "none",
                      }}
                    >
                      <span
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `color-mix(in srgb, ${p.tone} 16%, transparent)` }}
                      >
                        <p.icon className="h-6 w-6" style={{ color: p.tone }} />
                      </span>
                      <span className="flex-1">
                        <span className="font-display block text-base font-semibold text-white">{p.title}</span>
                        <span className="block text-[13px] text-white/50">{p.blurb}</span>
                      </span>
                      {active && <Check className="h-5 w-5 text-[var(--sai-indigo)]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Step 1: basics ── */}
          {step === 1 && (
            <>
              <span className="font-data text-[11px] uppercase tracking-[0.24em] text-[var(--sai-indigo)]">
                Step 02
              </span>
              <h1 className="font-display mt-3 text-2xl font-semibold text-white sm:text-3xl">
                The essentials
              </h1>
              <p className="mt-2 text-sm text-white/55">
                Pick a handle and a rhythm. You can change these later.
              </p>

              <div className="mt-7 space-y-6">
                <div>
                  <label className="font-data mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/60">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                      placeholder="yourhandle"
                      className={`${inputCls} pl-9`}
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="font-data mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/60">
                    <CalendarClock className="h-3.5 w-3.5" /> How often do you want to post?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CADENCE.map((c) => (
                      <Chip key={c.v} active={postsPerWeek === c.v} onClick={() => setPostsPerWeek(c.v)} sub={c.sub}>
                        {c.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: persona-specific ── */}
          {step === 2 && (
            <>
              <span className="font-data text-[11px] uppercase tracking-[0.24em] text-[var(--sai-indigo)]">
                Step 03
              </span>
              <h1 className="font-display mt-3 text-2xl font-semibold text-white sm:text-3xl">
                {persona === "client" && "Where are you today?"}
                {persona === "creator" && "Your audience & ambition"}
                {persona === "marketer" && "Your numbers"}
              </h1>
              <p className="mt-2 text-sm text-white/55">
                Last one — this sharpens every suggestion.
              </p>

              <div className="mt-7 space-y-6">
                {persona === "client" && (
                  <div>
                    <label className="font-data mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/60">
                      State of your social media activity
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CLIENT_ACTIVITY.map((a) => (
                        <Chip key={a} active={socialActivity === a} onClick={() => setSocialActivity(a)}>{a}</Chip>
                      ))}
                    </div>
                  </div>
                )}

                {persona === "creator" && (
                  <>
                    <div>
                      <label className="font-data mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/60">
                        Current viewer range
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {CREATOR_RANGE.map((r) => (
                          <Chip key={r} active={audienceRange === r} onClick={() => setAudienceRange(r)}>{r}</Chip>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="font-data mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/60">
                        How do you want to scale?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {CREATOR_SCALE.map((s) => (
                          <Chip key={s} active={scalingGoal === s} onClick={() => setScalingGoal(s)}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {persona === "marketer" && (
                  <>
                    <div>
                      <label className="font-data mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/60">
                        Current conversion rate
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {MARKETER_CONV.map((c) => (
                          <Chip key={c} active={conversionRate === c} onClick={() => setConversionRate(c)}>{c}</Chip>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="font-data mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/60">
                        Business type
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {BUSINESS_TYPES.map((b) => (
                          <Chip key={b} active={businessType === b} onClick={() => setBusinessType(b)}>{b}</Chip>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

        </div>

        {/* nav */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <span className="text-[13px] text-white/35">{initialName ? `Hi ${initialName.split(" ")[0]} 👋` : ""}</span>
          )}

          {step < TOTAL - 1 ? (
            <button
              type="button"
              disabled={!stepValid}
              onClick={() => go(step + 1)}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 30px -10px rgba(99,102,241,0.8)" }}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!stepValid || loading}
              onClick={finish}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg,#6366f1 0%,#a855f7 70%,#f5c451 130%)", boxShadow: "0 0 34px -8px rgba(99,102,241,0.8)" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Enter Socially <ArrowRight className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
