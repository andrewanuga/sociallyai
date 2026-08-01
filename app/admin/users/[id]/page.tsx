"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Bot, Calendar, Webhook, Loader2, Play } from "lucide-react";
import { GlassCard, PageHeader, Pill, StatTile } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { impersonateUser } from "../actions";

export default function UserDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        
        // Fetch all user data concurrently
        const [prof, bots, ints, posts] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", id).single(),
          supabase.from("bots").select("*").eq("user_id", id),
          supabase.from("integrations").select("*").eq("user_id", id),
          supabase.from("scheduled_posts").select("id").eq("user_id", id).eq("status", "scheduled"),
        ]);
        
        if (prof.error) throw prof.error;
        
        setData({
          profile: prof.data,
          bots: bots.data || [],
          integrations: ints.data || [],
          scheduledCount: posts.data?.length || 0
        });
      } catch (e) {
        toastError("Couldn't load user details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      await impersonateUser(id);
      success("Impersonation started");
      // Redirect to main dashboard as the user
      window.location.href = "/dashboard";
    } catch (e) {
      toastError("Failed to impersonate");
      setImpersonating(false);
    }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[var(--sai-indigo)]" /></div>;
  if (!data?.profile) return <div>User not found.</div>;

  const { profile, bots, integrations, scheduledCount } = data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/admin/users" className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--fg)]">{profile.full_name || "Unknown User"}</h1>
            <p className="font-data text-[13px] text-[var(--fg-4)]">{profile.id}</p>
          </div>
          
          <button 
            onClick={handleImpersonate}
            disabled={impersonating || profile.is_admin}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            {impersonating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
            Impersonate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Plan" value={profile.plan} icon={User} tone="violet" />
        <StatTile label="Active Bots" value={bots.filter((b: any) => b.status === "active").length.toString()} icon={Bot} tone="indigo" />
        <StatTile label="Integrations" value={integrations.length.toString()} icon={Webhook} tone="gold" />
        <StatTile label="Scheduled Posts" value={scheduledCount.toString()} icon={Calendar} tone="green" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="mb-4 font-display text-[15px] font-semibold text-[var(--fg)]">Profile Details</h2>
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between border-b border-[var(--stroke)] pb-2"><span className="text-[var(--fg-4)]">Username</span><span className="font-data text-[var(--fg)]">{profile.username || "—"}</span></div>
            <div className="flex justify-between border-b border-[var(--stroke)] pb-2"><span className="text-[var(--fg-4)]">Persona</span><span className="capitalize text-[var(--fg)]">{profile.persona || "—"}</span></div>
            <div className="flex justify-between border-b border-[var(--stroke)] pb-2"><span className="text-[var(--fg-4)]">Generations Used</span><span className="font-data text-[var(--fg)]">{profile.generations_used}</span></div>
            <div className="flex justify-between border-b border-[var(--stroke)] pb-2"><span className="text-[var(--fg-4)]">Status</span><Pill tone={profile.suspended ? "red" : "green"}>{profile.suspended ? "Suspended" : "Active"}</Pill></div>
            <div className="flex justify-between border-b border-[var(--stroke)] pb-2"><span className="text-[var(--fg-4)]">Joined</span><span className="text-[var(--fg)]">{new Date(profile.created_at).toLocaleDateString()}</span></div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-5">
            <h2 className="mb-4 font-display text-[15px] font-semibold text-[var(--fg)]">Autonomous Bots</h2>
            {bots.length === 0 ? (
              <p className="text-[13px] text-[var(--fg-4)]">No bots configured.</p>
            ) : (
              <div className="space-y-2">
                {bots.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between rounded-md border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2 text-[13px]">
                    <span className="capitalize text-[var(--fg)]">{b.kind} Bot</span>
                    <Pill tone={b.status === "active" ? "green" : "muted"}>{b.status}</Pill>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="mb-4 font-display text-[15px] font-semibold text-[var(--fg)]">Integrations</h2>
            {integrations.length === 0 ? (
              <p className="text-[13px] text-[var(--fg-4)]">No integrations connected.</p>
            ) : (
              <div className="space-y-2">
                {integrations.map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between rounded-md border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2 text-[13px]">
                    <span className="capitalize text-[var(--fg)]">{i.provider.replace("_", " ")}</span>
                    <Pill tone={i.status === "connected" ? "green" : "red"}>{i.status}</Pill>
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
