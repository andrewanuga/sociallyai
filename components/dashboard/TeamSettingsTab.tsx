"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, Pill } from "@/components/dashboard/ui";
import { Loader2, Mail, UserPlus, Trash2, Users } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/billing/plans";

type Member = { id: string; user_id: string; role: string; name: string; email: string };
type Invite = { id: string; email: string; role: string; expires_at: string };

export function TeamSettingsTab({ plan }: { plan: string }) {
  const { success, error: toastError } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  const planLimit = PLANS[(plan as PlanId) || "free"]?.collaborators || 0;
  const currentCount = members.length + invites.length;

  const loadTeam = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [membersData, invitesData] = await Promise.all([
        supabase.from("workspace_members").select(`
          id, user_id, role,
          profiles!workspace_members_user_id_fkey(full_name)
        `).eq("workspace_id", user.id),
        supabase.from("workspace_invites").select("id, email, role, expires_at").eq("workspace_id", user.id)
      ]);

      if (membersData.data) {
        setMembers(membersData.data.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          role: m.role,
          name: m.profiles?.full_name || "Unknown",
          email: "Joined"
        })));
      }

      if (invitesData.data) {
        setInvites(invitesData.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    if (currentCount >= planLimit) {
      toastError("Plan limit reached", `Upgrade your plan to invite more than ${planLimit} members.`);
      return;
    }

    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite");
      success("Invite sent!", `An invitation was sent to ${inviteEmail}.`);
      setInviteEmail("");
      loadTeam();
    } catch (err: any) {
      toastError("Invite failed", err.message);
    }
    setInviting(false);
  };

  const removeMember = async (id: string, isInvite: boolean) => {
    if (!confirm("Are you sure you want to remove this person?")) return;
    try {
      const res = await fetch("/api/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: isInvite ? "invite" : "member" })
      });
      if (!res.ok) throw new Error("Failed to remove");
      success("Removed successfully");
      loadTeam();
    } catch (err: any) {
      toastError("Error", err.message);
    }
  };

  return (
    <div className="space-y-5">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display text-[15px] font-semibold text-[var(--fg)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--sai-indigo)]" /> Workspace Members
            </p>
            <p className="text-[13px] text-[var(--fg-3)] mt-1">Manage who has access to your social accounts and AI agents.</p>
          </div>
          <div className="text-right">
            <Pill tone={currentCount >= planLimit ? "red" : "indigo"}>
              {currentCount} / {planLimit === 0 ? "0" : planLimit === 9999 ? "Unlimited" : planLimit} seats
            </Pill>
          </div>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center text-[var(--fg-4)]"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="space-y-0 divide-y divide-[var(--stroke)] border border-[var(--stroke)] rounded-xl overflow-hidden bg-[var(--panel-fill)]">
            {members.map(m => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--fg)]">{m.name}</p>
                  <p className="text-[12px] text-[var(--fg-4)] capitalize">Role: {m.role}</p>
                </div>
                <button onClick={() => removeMember(m.id, false)} className="p-2 text-[var(--fg-4)] hover:text-[var(--sai-red)] rounded-lg hover:bg-[var(--hover)] transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {invites.map(inv => (
              <div key={inv.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--fg)]">{inv.email} <span className="ml-2 text-[10px] uppercase bg-[var(--sai-gold)]/20 text-[var(--sai-gold)] px-2 py-0.5 rounded-full">Pending</span></p>
                  <p className="text-[12px] text-[var(--fg-4)] capitalize">Role: {inv.role}</p>
                </div>
                <button onClick={() => removeMember(inv.id, true)} className="p-2 text-[var(--fg-4)] hover:text-[var(--sai-red)] rounded-lg hover:bg-[var(--hover)] transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {members.length === 0 && invites.length === 0 && (
              <div className="p-8 text-center text-[13px] text-[var(--fg-4)]">No members yet.</div>
            )}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Invite Collaborator</p>
        <p className="text-[13px] text-[var(--fg-3)] mt-1 mb-4">Send an email invite to add someone to your workspace.</p>
        
        {planLimit === 0 ? (
          <div className="p-4 rounded-xl border border-[var(--stroke)] bg-[var(--hover)] text-[13px] text-[var(--fg-2)]">
            Your current plan does not include team collaboration. Please upgrade to a higher plan to add team members.
          </div>
        ) : (
          <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg-4)]" />
              <input 
                type="email" 
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com" 
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] text-sm focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--sai-indigo)]/20"
              />
            </div>
            <select 
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] text-sm text-[var(--fg-2)] focus:border-[var(--sai-indigo)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--sai-indigo)]/20"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
            <button 
              type="submit" 
              disabled={inviting || currentCount >= planLimit}
              className="h-10 px-5 rounded-lg bg-[var(--sai-indigo)] text-white text-sm font-medium hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
            >
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Invite
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
