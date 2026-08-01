"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  User, Palette, Bot, CreditCard, Bell, Save, Loader2,
  ShieldAlert, Check, Sun, Moon, Monitor, Sparkles,
  Search, Eye, Zap, Crown, Gift, ChevronDown, ChevronUp,
  ExternalLink, Users, Trash2, Mail, UserPlus
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { TeamSettingsTab } from "@/components/dashboard/TeamSettingsTab";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "ai", label: "AI", icon: Bot },
  { id: "team", label: "Team", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;
type Tab = (typeof TABS)[number]["id"];

const FONTS = [
  { id: "inter", label: "Inter", stack: '"Inter", var(--font-geist-sans), system-ui, sans-serif' },
  { id: "general-sans", label: "General Sans", stack: '"General Sans", var(--font-geist-sans), sans-serif' },
  { id: "geist", label: "Geist", stack: "var(--font-geist-sans), system-ui, sans-serif" },
];

/* ── Model types (from API) ───────────────────────────────────── */

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  tier?: "free" | "budget" | "standard" | "premium";
  supportsVision: boolean;
  contextWindow: string;
  bestFor?: string[];
  pricing?: { prompt: string; completion: string } | null;
  available?: boolean;
}

interface TierMeta {
  label: string;
  color: string;
  description: string;
}

/* ── Shared component styles ──────────────────────────────────── */

const inputCls =
  "h-11 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/20";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sai-indigo)]/40"
      style={{ background: on ? "linear-gradient(135deg,#6366f1,#a855f7)" : "var(--stroke)" }}
    >
      <span
        className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
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

/* ── Tier badge component ─────────────────────────────────────── */

function TierBadge({ tier, tiers }: { tier: string; tiers: Record<string, TierMeta> }) {
  const meta = tiers[tier];
  if (!meta) return null;
  const Icon = tier === "premium" ? Crown : tier === "free" ? Gift : tier === "standard" ? Sparkles : Zap;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: `${meta.color}20`, color: meta.color }}
    >
      <Icon className="h-2.5 w-2.5" /> {meta.label}
    </span>
  );
}

/* ── Format pricing ───────────────────────────────────────────── */

function formatPrice(priceStr: string): string {
  const price = parseFloat(priceStr);
  if (price === 0) return "Free";
  if (price < 0.000001) return "<$0.01/M";
  // Price is per-token, convert to per-million-tokens
  const perMillion = price * 1_000_000;
  if (perMillion < 0.01) return "<$0.01/M";
  if (perMillion < 1) return `$${perMillion.toFixed(2)}/M`;
  return `$${perMillion.toFixed(1)}/M`;
}

/* ── Main page ────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "", username: "", niche: "", brand_website: "",
    ai_model: "google/gemini-2.5-flash", ai_unfiltered: false, ai_temperature: 0.7,
    font_pref: "inter", plan: "free",
  });
  const [notif, setNotif] = useState({ leads: true, trends: true, agentActions: false, reports: true });

  // Model data
  const [recommendedModels, setRecommendedModels] = useState<ModelInfo[]>([]);
  const [allModels, setAllModels] = useState<ModelInfo[]>([]);
  const [tiers, setTiers] = useState<Record<string, TierMeta>>({});
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [showAllModels, setShowAllModels] = useState(false);

  // Password update state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  /* ── Load profile ───────────────────────────────────────────── */
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
            ai_model: data.ai_model ?? "google/gemini-2.5-flash", ai_unfiltered: !!data.ai_unfiltered,
            ai_temperature: Number(data.ai_temperature ?? 0.7),
            font_pref: data.font_pref ?? "inter", plan: data.plan ?? "free",
          }));
        }
      } catch { /* offline */ }
    })();
  }, []);

  /* ── Load models when AI tab is opened ──────────────────────── */
  useEffect(() => {
    if (tab !== "ai") return;
    let cancelled = false;
    setModelsLoading(true);

    fetch("/api/ai/models")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setRecommendedModels(data.recommended || []);
        setAllModels(data.all || []);
        setTiers(data.tiers || {});
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setModelsLoading(false); });

    return () => { cancelled = true; };
  }, [tab]);

  /* ── Filter all models by search ────────────────────────────── */
  const filteredAllModels = useMemo(() => {
    if (!modelSearch.trim()) return allModels;
    const q = modelSearch.toLowerCase();
    return allModels.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q),
    );
  }, [allModels, modelSearch]);

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

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      toastError("Passwords don't match", "Please ensure both fields match.");
      return;
    }
    if (password.length < 6) {
      toastError("Password too short", "Password must be at least 6 characters.");
      return;
    }
    setUpdatingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setUpdatingPassword(false);
    if (error) {
      toastError("Failed to update password", error.message);
    } else {
      success("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
    }
  };

  /* ── Helpers ────────────────────────────────────────────────── */

  const selectedModelInfo = recommendedModels.find((m) => m.id === form.ai_model)
    || allModels.find((m) => m.id === form.ai_model);

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
            <div className="space-y-5">
              <GlassCard className="space-y-5 p-6">
              <Field label="Full name"><input className={inputCls} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
              <Field label="Username"><input className={inputCls} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="yourhandle" /></Field>
              <Field label="Niche" hint="Used to sharpen trend detection and drafts."><input className={inputCls} value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="e.g. Fintech / Startups" /></Field>
              <Field label="Brand website" hint="We can extract your voice from this."><input className={inputCls} value={form.brand_website} onChange={(e) => setForm({ ...form, brand_website: e.target.value })} placeholder="https://…" /></Field>
            </GlassCard>
            
            <GlassCard className="p-6">
              <p className="font-display text-[15px] font-semibold text-[var(--fg)] mb-4">Security</p>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="New Password">
                    <input type="password" placeholder="••••••••" className={inputCls} value={password} onChange={e => setPassword(e.target.value)} />
                  </Field>
                  <Field label="Confirm Password">
                    <input type="password" placeholder="••••••••" className={inputCls} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </Field>
                </div>
                <button
                  onClick={handleUpdatePassword}
                  disabled={updatingPassword || !password || !confirmPassword}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--stroke)] px-4 text-xs font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--fg-4)] disabled:opacity-50"
                >
                  {updatingPassword ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                  Update Password
                </button>
              </div>
            </GlassCard>
          </div>
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

          {/* ── AI TAB ─────────────────────────────────────────── */}
          {tab === "ai" && (
            <>
              {/* Current model display */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-[15px] font-semibold text-[var(--fg)]">AI Model</p>
                    <p className="mt-1 text-[13px] text-[var(--fg-3)]">
                      Powers all your agents — Create, Ghost Mode, Trends, Scoring
                    </p>
                  </div>
                  <a
                    href="https://openrouter.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[11px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg-2)]"
                  >
                    Powered by OpenRouter <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Selected model card */}
                {selectedModelInfo && (
                  <div
                    className="mt-4 rounded-xl border p-4"
                    style={{ borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.08)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                        >
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[var(--fg)]">{selectedModelInfo.name}</p>
                          <p className="text-[11px] text-[var(--fg-3)]">{selectedModelInfo.provider} · {selectedModelInfo.contextWindow} context</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedModelInfo.supportsVision && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            <Eye className="h-2.5 w-2.5" /> Vision
                          </span>
                        )}
                        {selectedModelInfo.tier && <TierBadge tier={selectedModelInfo.tier} tiers={tiers} />}
                      </div>
                    </div>
                    {selectedModelInfo.pricing && (
                      <div className="mt-3 flex gap-4 border-t border-[var(--stroke)] pt-3">
                        <span className="text-[11px] text-[var(--fg-4)]">
                          Input: <span className="text-[var(--fg-2)]">{formatPrice(selectedModelInfo.pricing.prompt)}</span>
                        </span>
                        <span className="text-[11px] text-[var(--fg-4)]">
                          Output: <span className="text-[var(--fg-2)]">{formatPrice(selectedModelInfo.pricing.completion)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>

              {/* Recommended models */}
              <GlassCard className="p-6">
                <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Recommended Models</p>
                <p className="mt-1 text-[13px] text-[var(--fg-3)]">Curated for social media content creation. Pick one that fits your budget and quality needs.</p>

                {modelsLoading ? (
                  <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-[var(--fg-3)]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading models…
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {recommendedModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setForm({ ...form, ai_model: model.id })}
                        className="group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all hover:border-[rgba(99,102,241,0.4)]"
                        style={{
                          borderColor: form.ai_model === model.id ? "rgba(99,102,241,0.6)" : "var(--stroke)",
                          background: form.ai_model === model.id ? "rgba(99,102,241,0.08)" : "var(--panel-fill)",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-medium text-[var(--fg)]">{model.name}</span>
                            <span className="text-[11px] text-[var(--fg-4)]">{model.provider}</span>
                            {model.tier && <TierBadge tier={model.tier} tiers={tiers} />}
                            {model.supportsVision && (
                              <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                                <Eye className="h-2.5 w-2.5" /> Vision
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[12px] text-[var(--fg-3)] line-clamp-1">{model.description}</p>
                          <div className="mt-1.5 flex items-center gap-3">
                            <span className="text-[10px] text-[var(--fg-4)]">{model.contextWindow} context</span>
                            {model.pricing && (
                              <span className="text-[10px] text-[var(--fg-4)]">
                                {formatPrice(model.pricing.prompt)} input · {formatPrice(model.pricing.completion)} output
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 pt-1">
                          {form.ai_model === model.id && (
                            <Check className="h-4 w-4 text-[var(--sai-indigo)]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Browse all models */}
              <GlassCard className="p-6">
                <button
                  onClick={() => setShowAllModels(!showAllModels)}
                  className="flex w-full items-center justify-between"
                >
                  <div>
                    <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Browse All Models</p>
                    <p className="mt-1 text-[13px] text-[var(--fg-3)]">
                      {allModels.length > 0 ? `${allModels.length} models available via OpenRouter` : "Expand to browse"}
                    </p>
                  </div>
                  {showAllModels
                    ? <ChevronUp className="h-5 w-5 text-[var(--fg-3)]" />
                    : <ChevronDown className="h-5 w-5 text-[var(--fg-3)]" />}
                </button>

                {showAllModels && (
                  <div className="mt-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
                      <input
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        placeholder="Search models… (e.g. claude, gpt, gemini)"
                        className={`${inputCls} pl-9`}
                      />
                    </div>

                    {/* Model list */}
                    <div className="mt-3 max-h-[400px] space-y-1.5 overflow-y-auto">
                      {filteredAllModels.slice(0, 50).map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setForm({ ...form, ai_model: model.id })}
                          className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors hover:border-[rgba(99,102,241,0.4)]"
                          style={{
                            borderColor: form.ai_model === model.id ? "rgba(99,102,241,0.6)" : "var(--stroke)",
                            background: form.ai_model === model.id ? "rgba(99,102,241,0.08)" : "transparent",
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-medium text-[var(--fg)]">{model.name}</span>
                              <span className="text-[10px] text-[var(--fg-4)]">{model.provider}</span>
                              {model.supportsVision && (
                                <Eye className="h-3 w-3 text-emerald-400" />
                              )}
                            </div>
                            {model.pricing && (
                              <span className="text-[10px] text-[var(--fg-4)]">
                                {formatPrice(model.pricing.prompt)} / {formatPrice(model.pricing.completion)}
                              </span>
                            )}
                          </div>
                          {form.ai_model === model.id && (
                            <Check className="h-3.5 w-3.5 flex-shrink-0 text-[var(--sai-indigo)]" />
                          )}
                        </button>
                      ))}
                      {filteredAllModels.length > 50 && (
                        <p className="py-2 text-center text-[11px] text-[var(--fg-4)]">
                          Showing 50 of {filteredAllModels.length} — refine your search
                        </p>
                      )}
                      {filteredAllModels.length === 0 && modelSearch && (
                        <p className="py-6 text-center text-[13px] text-[var(--fg-3)]">
                          No models matching &quot;{modelSearch}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Raw language mode */}
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

              {/* Creativity slider */}
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

          {tab === "team" && (
            <TeamSettingsTab plan={form.plan} />
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
