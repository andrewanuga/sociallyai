"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, Loader2 } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { createBroadcast, toggleBroadcast, deleteBroadcast } from "./actions";
import { timeAgo } from "@/lib/dashboard/helpers";

type Broadcast = { id: string; message: string; type: "info" | "warning" | "critical"; is_active: boolean; created_at: string };

export default function AdminBroadcasts() {
  const { success, error: toastError } = useToast();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  
  const [msgInput, setMsgInput] = useState("");
  const [typeInput, setTypeInput] = useState<"info" | "warning" | "critical">("info");
  const [targetUser, setTargetUser] = useState("");

  const load = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("system_broadcasts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setBroadcasts(data as Broadcast[]);
    } catch (e) {
      toastError("Couldn't load broadcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!msgInput.trim()) return;
    setBusy("create");
    try {
      await createBroadcast(msgInput, typeInput, targetUser.trim() || undefined);
      success("Broadcast/Message sent");
      setMsgInput("");
      setTargetUser("");
      load();
    } catch (e) {
      toastError("Couldn't create broadcast", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleToggle = async (b: Broadcast) => {
    setBusy(b.id);
    const next = !b.is_active;
    setBroadcasts((prev) => prev.map((x) => (x.id === b.id ? { ...x, is_active: next } : x)));
    try {
      await toggleBroadcast(b.id, next);
      success(next ? "Broadcast activated" : "Broadcast hidden");
    } catch (e) {
      setBroadcasts((prev) => prev.map((x) => (x.id === b.id ? { ...x, is_active: !next } : x)));
      toastError("Couldn't toggle broadcast");
    } finally { setBusy(null); }
  };

  const handleDelete = async (b: Broadcast) => {
    if (!confirm("Are you sure?")) return;
    setBusy(b.id);
    try {
      await deleteBroadcast(b.id);
      setBroadcasts((prev) => prev.filter((x) => x.id !== b.id));
      success("Broadcast deleted");
    } catch (e) {
      toastError("Couldn't delete broadcast");
    } finally { setBusy(null); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Security operations" title="System Broadcasts" sub="Push global announcements and banners to all users." />

      <GlassCard className="mb-6 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-[var(--sai-indigo)]" />
          <p className="font-display text-[15px] font-semibold text-[var(--fg)]">New Broadcast</p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input 
            value={msgInput} 
            onChange={(e) => setMsgInput(e.target.value)} 
            placeholder="e.g. System maintenance at midnight..." 
            className="h-10 flex-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none" 
          />
          <input 
            value={targetUser} 
            onChange={(e) => setTargetUser(e.target.value)} 
            placeholder="User ID (optional)" 
            className="h-10 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none sm:w-40" 
          />
          <select
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value as any)}
            className="h-10 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-sm text-[var(--fg)] focus:border-[var(--sai-indigo)]/50 focus:outline-none sm:w-32"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <button 
            onClick={handleCreate} 
            disabled={!msgInput.trim() || busy === "create"} 
            className="flex h-10 w-full items-center justify-center gap-1 rounded-xl px-4 text-[13px] font-semibold text-white disabled:opacity-50 sm:w-auto" 
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} 
            Create
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[var(--sai-indigo)]" /></div>
        ) : broadcasts.length === 0 ? (
          <p className="text-[13px] text-[var(--fg-4)]">No broadcasts created yet.</p>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div key={b.id} className="flex flex-col gap-3 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill tone={b.type === "critical" ? "red" : b.type === "warning" ? "gold" : "indigo"}>{b.type}</Pill>
                    <span className="text-[12px] text-[var(--fg-4)]">{timeAgo(b.created_at)}</span>
                  </div>
                  <p className="mt-1.5 text-[14px] font-medium text-[var(--fg)]">{b.message}</p>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggle(b)}
                    disabled={busy === b.id}
                    className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50"
                    style={{ background: b.is_active ? "var(--sai-indigo)" : "var(--stroke)" }}
                  >
                    <div 
                      className="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform"
                      style={{ left: b.is_active ? "calc(100% - 20px)" : "4px" }}
                    />
                  </button>
                  <button onClick={() => handleDelete(b)} disabled={busy === b.id} className="rounded p-1.5 text-[var(--fg-4)] hover:bg-[var(--stroke)] hover:text-[var(--sai-red)]"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
