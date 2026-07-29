"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  User, Palette, Bot, CreditCard, Bell, Save, Loader2,
  ShieldAlert, Check, Sun, Moon, Monitor, Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "ai", label: "AI", icon: Bot },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;
type Tab = (typeof TABS)[number]["id"];

const AI_MODELS = [
  { id: "llama-3.3-70b", label: "Llama 3.3 70B", note: "Self-hosted · private" },
  { id: "llama-3.1-8b", label: "Llama 3.1 8B", note: "Faster, lighter" },
  { id: "mixtral-8x7b", label: "Mixtral 8x7B", note: "Balanced" },
];

const FONTS = [
  { id: "inter", label: "Inter", stack: '"Inter", var(--font-geist-sans), system-ui, sans-serif' },
  { id: "general-sans", label: "General Sans", stack: '"General Sans", var(--font-geist-sans), sans-serif' },
  { id: "geist", label: "Geist", stack: "var(--font-geist-sans), system-ui, sans-serif" },
];

const inputCls =
  "h-11 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/20";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
      style={{ background: on ? "linear-gradient(135deg,#6366f1,#a855f7)" : "var(--stroke)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="font-data mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-[var(--fg-2)]">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-[var(--fg-4)]">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "", username: "", niche: "", brand_website: "",
    ai_model: "llama-3.3-70b", ai_unfiltered: false, ai_temperature: 0.7,
    font_pref: "inter", plan: "free",
  });
  const [notif, setNotif] = useState({ leads: true, trends: true, agentActions: false, reports: true });

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setForm((f) => ({
            ...f,
            full_name: data.full_name ?? "", username: data.username ?? "",
            niche: data.niche ?? "", brand_website: data.brand_website ?? "",
            ai_model: data.ai_model ?? "llama-3.3-70b", ai_unfiltered: !!data.ai_unfiltered,
            ai_temperature: Number(data.ai_temperature ?? 0.7),
            font_pref: data.font_pref ?? "inter", plan: data.plan ?? "free",
          }));
        }
      } catch { /* offline */ }
    })();
  }, []);

  const applyFont = (id: string) => {
    const f = FONTS.find((x) => x.id === id);
    if (f) document.documentElement.style.setProperty("--font-inter", f.stack);
  };

  const save = async () => {
    setSaving(true);
    if (userId) {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name, username: form.username, niche: form.niche,
        brand_website: form.brand_website, ai_model: form.ai_model,
        ai_unfiltered: form.ai_unfiltered, ai_temperature: form.ai_temperature,
        font_pref: form.font_pref, theme_pref: theme ?? "dark",
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      if (error) { toastError("Couldn't save settings", error.message); setSaving(false); return; }
    }
    success("Settings saved");
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        sub="Tune your profile, appearance, and how your AI agent behaves."
        actions={
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-[var(--fg)] transition-transform hover:scale-[1.03] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 0 26px -10px rgba(99,102,241,0.8)" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        {/* tab rail */}
        <GlassCard className="h-fit p-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors"
              style={tab === t.id ? { background: "rgba(99,102,241,0.14)", color: "#fff" } : { color: "var(--fg-2)" }}
            >
              <t.icon className="h-[17px] w-[17px]" style={tab === t.id ? { color: "var(--sai-indigo)" } : undefined} />
              {t.label}
            </button>
          ))}
        </GlassCard>

        {/* panel */}
        <div className="space-y-5">
          {tab === "profile" && (
            <GlassCard className="space-y-5 p-6">
              <Field label="Full name"><input className={inputCls} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
              <Field label="Username"><input className={inputCls} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="yourhandle" /></Field>
              <Field label="Niche" hint="Used to sharpen trend detection and drafts."><input className={inputCls} value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="e.g. Fintech / Startups" /></Field>
              <Field label="Brand website" hint="We can extract your voice from this."><input className={inputCls} value={form.brand_website} onChange={(e) => setForm({ ...form, brand_website: e.target.value })} placeholder="https://…" /></Field>
            </GlassCard>
          )}

          {tab === "appearance" && (
            <>
              <GlassCard className="p-6">
                <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Theme</p>
                <p className="mt-1 text-[13px] text-[var(--fg-3)]">Socially is designed for dark. Light is available.</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[{ id: "dark", label: "Dark", icon: Moon }, { id: "light", label: "Light", icon: Sun }, { id: "system", label: "System", icon: Monitor }].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setTheme(o.id)}
                      className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors"
                      style={{ borderColor: theme === o.id ? "rgba(99,102,241,0.6)" : "var(--stroke)", background: theme === o.id ? "rgba(99,102,241,0.1)" : "var(--panel-fill)" }}
                    >
                      <o.icon className="h-5 w-5" style={{ color: theme === o.id ? "var(--sai-indigo)" : "var(--fg-3)" }} />
                      <span className="text-[13px] text-[var(--fg)]">{o.label}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Font</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setForm({ ...form, font_pref: f.id }); applyFont(f.id); }}
                      className="rounded-xl border p-4 text-left transition-colors"
                      style={{ borderColor: form.font_pref === f.id ? "rgba(99,102,241,0.6)" : "var(--stroke)", background: form.font_pref === f.id ? "rgba(99,102,241,0.1)" : "var(--panel-fill)" }}
                    >
                      <span className="block text-[15px] font-semibold text-[var(--fg)]" style={{ fontFamily: f.stack }}>{f.label}</span>
                      <span className="mt-1 block text-[12px] text-[var(--fg-4)]" style={{ fontFamily: f.stack }}>The quick brown fox</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </>
          )}

          {tab === "ai" && (
            <>
              <GlassCard className="p-6">
                <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Model</p>
                <p className="mt-1 text-[13px] text-[var(--fg-3)]">The engine powering your agent.</p>
                <div className="mt-4 space-y-2.5">
                  {AI_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setForm({ ...form, ai_model: m.id })}
                      className="flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-colors"
                      style={{ borderColor: form.ai_model === m.id ? "rgba(99,102,241,0.6)" : "var(--stroke)", background: form.ai_model === m.id ? "rgba(99,102,241,0.1)" : "var(--panel-fill)" }}
                    >
                      <div><span className="text-[14px] font-medium text-[var(--fg)]">{m.label}</span><span className="ml-2 text-[12px] text-[var(--fg-4)]">{m.note}</span></div>
                      {form.ai_model === m.id && <Check className="h-4 w-4 text-[var(--sai-indigo)]" />}
                    </button>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-[var(--sai-gold)]" />
                      <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Raw language mode</p>
                    </div>
                    <p className="mt-1.5 max-w-md text-[13px] text-[var(--fg-3)]">
                      Let the agent write directly, without softening or corporate filters. Output stays lawful — you own what you post.
                    </p>
                  </div>
                  <Toggle on={form.ai_unfiltered} onChange={(v) => setForm({ ...form, ai_unfiltered: v })} />
                </div>
                {form.ai_unfiltered && (
                  <div className="mt-4 rounded-xl border border-[var(--sai-gold)]/25 bg-[var(--sai-gold)]/10 p-3 text-[12.5px] text-[var(--sai-gold)]">
                    Raw mode is on. Review drafts before publishing.
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Creativity</p>
                  <Pill tone="indigo">{form.ai_temperature.toFixed(1)}</Pill>
                </div>
                <input
                  type="range" min={0} max={1} step={0.1} value={form.ai_temperature}
                  onChange={(e) => setForm({ ...form, ai_temperature: Number(e.target.value) })}
                  className="mt-4 w-full accent-[var(--sai-indigo)]"
                />
                <div className="mt-1 flex justify-between text-[11px] text-[var(--fg-4)]"><span>Precise</span><span>Balanced</span><span>Wild</span></div>
              </GlassCard>
            </>
          )}

          {tab === "billing" && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Current plan</p>
                  <div className="mt-2 flex items-center gap-2"><Pill tone="violet">{form.plan}</Pill><span className="text-[13px] text-[var(--fg-3)]">14-day trial</span></div>
                </div>
                <Link href="/dashboard/billing" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-[var(--fg)]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                  <Sparkles className="h-4 w-4" /> Manage plan
                </Link>
              </div>
              <div className="mt-6 border-t border-[var(--stroke)] pt-5">
                <p className="font-data text-[11px] uppercase tracking-[0.16em] text-[var(--fg-3)]">Payment methods</p>
                <p className="mt-2 text-[13px] text-[var(--fg-2)]">Paystack, Flutterwave, and all Nigerian bank cards are supported at checkout.</p>
              </div>
            </GlassCard>
          )}

          {tab === "notifications" && (
            <GlassCard className="divide-y divide-[var(--stroke)] p-2">
              {[
                { k: "leads", label: "New leads", desc: "When the agent flags a real lead" },
                { k: "trends", label: "Trend alerts", desc: "When something breaks in your niche" },
                { k: "agentActions", label: "Agent actions", desc: "Every autonomous reply or plug" },
                { k: "reports", label: "Weekly report", desc: "Your ROI Pulse summary" },
              ].map((n) => (
                <div key={n.k} className="flex items-center justify-between px-4 py-3.5">
                  <div><p className="text-[14px] text-[var(--fg)]">{n.label}</p><p className="text-[12.5px] text-[var(--fg-3)]">{n.desc}</p></div>
                  <Toggle on={notif[n.k as keyof typeof notif]} onChange={(v) => setNotif({ ...notif, [n.k]: v })} />
                </div>
              ))}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
