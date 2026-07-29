"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, ArrowUpFromLine, Check, Trash2, Undo2, Layers, CornerDownLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import type { Task, TaskPriority } from "@/lib/supabase/types";

const PRIORITIES: { id: TaskPriority; label: string; tone: "muted" | "indigo" | "red" }[] = [
  { id: "low", label: "Low", tone: "muted" },
  { id: "normal", label: "Normal", tone: "indigo" },
  { id: "high", label: "High", tone: "red" },
];

export default function TasksPage() {
  const { error: toastError } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Stack = pending tasks, newest first (LIFO: top of stack pops first).
  const stack = useMemo(
    () => tasks.filter((t) => t.status === "pending"),
    [tasks]
  );
  const done = useMemo(
    () => tasks.filter((t) => t.status === "done").slice(0, 8),
    [tasks]
  );

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false });
          if (data) setTasks(data as Task[]);
        }
      } catch { /* offline / no session — start empty */ }
      setLoaded(true);
    })();
  }, []);

  const push = async () => {
    const t = title.trim();
    if (!t) return;
    const optimistic: Task = {
      id: `tmp-${Date.now()}`, user_id: userId ?? "local", title: t,
      notes: null, priority, status: "pending",
      created_at: new Date().toISOString(), completed_at: null,
    };
    setTasks((prev) => [optimistic, ...prev]); // push onto top
    setTitle("");
    if (userId) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert({ user_id: userId, title: t, priority })
        .select()
        .single();
      if (error) toastError("Couldn't save task", error.message);
      else if (data) setTasks((prev) => prev.map((x) => (x.id === optimistic.id ? (data as Task) : x)));
    }
  };

  const pop = async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "done", completed_at: new Date().toISOString() } : t))
    );
    if (userId && !id.startsWith("tmp-")) {
      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update({ status: "done", completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) toastError("Couldn't complete task", error.message);
    }
  };

  const undo = async (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "pending", completed_at: null } : t)));
    if (userId && !id.startsWith("tmp-")) {
      const supabase = createClient();
      await supabase.from("tasks").update({ status: "pending", completed_at: null }).eq("id", id);
    }
  };

  const remove = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (userId && !id.startsWith("tmp-")) {
      const supabase = createClient();
      await supabase.from("tasks").delete().eq("id", id);
    }
  };

  const toneFor = (p: TaskPriority) => PRIORITIES.find((x) => x.id === p)?.tone ?? "indigo";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="LIFO stack"
        title="Tasks"
        sub="A last-in, first-out stack. Push what's on your mind — the newest task sits on top and pops first."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* ── The stack ── */}
        <div>
          {/* Push box */}
          <GlassCard className="mb-5 p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && push()}
                  placeholder="Push a task onto the stack…"
                  className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] pl-3.5 pr-10 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/20"
                />
                <CornerDownLeft className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
              </div>
              <button
                onClick={push}
                disabled={!title.trim()}
                className="flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-[var(--fg)] transition-transform hover:scale-[1.02] disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
              >
                <Plus className="h-4 w-4" /> Push
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-data text-[10px] uppercase tracking-wider text-[var(--fg-4)]">Priority</span>
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className="rounded-full px-2.5 py-1 text-[11px] transition-colors"
                  style={
                    priority === p.id
                      ? { background: "rgba(99,102,241,0.18)", color: "#fff" }
                      : { color: "var(--fg-3)" }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Stack visual */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--fg-2)]">
              <Layers className="h-4 w-4 text-[var(--sai-indigo)]" />
              <span className="font-data text-[11px] uppercase tracking-[0.18em]">Stack · {stack.length}</span>
            </div>
            {stack.length > 0 && (
              <button
                onClick={() => pop(stack[0].id)}
                className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[12px] text-[var(--fg)] hover:bg-[var(--hover)]"
              >
                <ArrowUpFromLine className="h-3.5 w-3.5" /> Pop top
              </button>
            )}
          </div>

          {!loaded ? (
            <GlassCard className="p-10 text-center text-sm text-[var(--fg-4)]">Loading…</GlassCard>
          ) : stack.length === 0 ? (
            <GlassCard className="flex flex-col items-center p-12 text-center">
              <Layers className="mb-3 h-8 w-8 text-[var(--fg-4)]" />
              <p className="text-sm text-[var(--fg-2)]">The stack is empty.</p>
              <p className="mt-1 text-[13px] text-[var(--fg-4)]">Push a task above to get started.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2.5">
              {stack.map((t, i) => {
                const top = i === 0;
                return (
                  <GlassCard
                    key={t.id}
                    className={`p-4 transition-all ${top ? "" : "opacity-[0.92]"}`}
                    style={
                      top
                        ? { borderColor: "rgba(99,102,241,0.45)", boxShadow: "0 0 34px -14px rgba(99,102,241,0.9)" }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center pt-0.5">
                        <span className="font-data text-[11px] text-[var(--fg-4)]">#{i + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {top && <Pill tone="indigo">Next to pop</Pill>}
                          <Pill tone={toneFor(t.priority)}>{t.priority}</Pill>
                        </div>
                        <p className="mt-2 text-[15px] font-medium leading-snug text-[var(--fg)]">{t.title}</p>
                        {t.notes && <p className="mt-1 text-[13px] text-[var(--fg-3)]">{t.notes}</p>}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          onClick={() => pop(t.id)}
                          title="Complete"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-3)] transition-colors hover:bg-[var(--sai-indigo)]/15 hover:text-[var(--sai-indigo)]"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(t.id)}
                          title="Delete"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-4)] transition-colors hover:bg-[var(--sai-red)]/15 hover:text-[var(--sai-red)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Side: how it works + completed ── */}
        <div className="space-y-5">
          <GlassCard className="p-5">
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-[var(--sai-violet)]">How the stack works</p>
            <ul className="mt-3 space-y-2.5 text-[13px] text-[var(--fg-2)]">
              <li className="flex gap-2"><span className="text-[var(--sai-indigo)]">Push</span> adds to the top.</li>
              <li className="flex gap-2"><span className="text-[var(--sai-indigo)]">Pop</span> completes the top first (LIFO).</li>
              <li className="flex gap-2"><span className="text-[var(--sai-indigo)]">Newest</span> work stays front-of-mind.</li>
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-data text-[11px] uppercase tracking-[0.18em] text-[var(--fg-4)]">Recently popped</p>
              <span className="text-[12px] text-[var(--fg-4)]">{done.length}</span>
            </div>
            {done.length === 0 ? (
              <p className="text-[13px] text-[var(--fg-4)]">Nothing completed yet.</p>
            ) : (
              <div className="space-y-1.5">
                {done.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--hover)]">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#34d399]" />
                    <span className="flex-1 truncate text-[13px] text-[var(--fg-3)] line-through">{t.title}</span>
                    <button onClick={() => undo(t.id)} title="Undo" className="text-[var(--fg-4)] hover:text-[var(--fg)]">
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
