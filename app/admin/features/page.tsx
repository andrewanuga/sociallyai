"use client";

import { useEffect, useState } from "react";
import { ToggleLeft, Loader2 } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { toggleFeatureFlag } from "./actions";

type Flag = { key: string; is_enabled: boolean; description: string | null };

export default function AdminFeatures() {
  const { success, error: toastError } = useToast();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("feature_flags").select("*").order("key");
      if (error) throw error;
      if (data) setFlags(data as Flag[]);
    } catch (e) {
      toastError("Couldn't load feature flags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (f: Flag) => {
    setBusy(f.key);
    const next = !f.is_enabled;
    setFlags((prev) => prev.map((x) => (x.key === f.key ? { ...x, is_enabled: next } : x)));
    try {
      await toggleFeatureFlag(f.key, next);
      success(`Feature '${f.key}' ${next ? 'enabled' : 'disabled'}`);
    } catch (e) {
      setFlags((prev) => prev.map((x) => (x.key === f.key ? { ...x, is_enabled: !next } : x)));
      toastError("Couldn't toggle feature", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Security operations" title="Feature Flags" sub="Globally enable or disable features instantly." />

      <GlassCard className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <ToggleLeft className="h-5 w-5 text-[var(--sai-indigo)]" />
          <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Global Platform Features</p>
        </div>
        
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--sai-indigo)]" />
          </div>
        ) : flags.length === 0 ? (
          <p className="text-[13px] text-[var(--fg-4)]">No feature flags configured.</p>
        ) : (
          <div className="space-y-3">
            {flags.map((f) => (
              <div key={f.key} className="flex items-center justify-between rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-data text-[14px] text-[var(--fg)]">{f.key}</span>
                    <Pill tone={f.is_enabled ? "green" : "muted"}>{f.is_enabled ? "enabled" : "disabled"}</Pill>
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--fg-3)]">{f.description ?? "No description"}</p>
                </div>
                
                <button
                  onClick={() => toggle(f)}
                  disabled={busy === f.key}
                  className="relative h-6 w-11 rounded-full transition-colors disabled:opacity-50"
                  style={{ background: f.is_enabled ? "var(--sai-indigo)" : "var(--stroke)" }}
                >
                  <div 
                    className="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform"
                    style={{ left: f.is_enabled ? "calc(100% - 20px)" : "4px" }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
