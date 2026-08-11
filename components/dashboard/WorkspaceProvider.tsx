"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { setCookie, getCookie } from "cookies-next";

export type WorkspaceRole = "owner" | "admin" | "manager" | "member";

export type Workspace = {
  id: string;          // The profile ID of the workspace owner
  name: string;        // The name of the workspace (e.g. "John Doe's Team")
  role: WorkspaceRole;
  isPersonal: boolean;
};

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (id: string) => void;
  isLoading: boolean;
  persona: string;
  plan: string;
  setPersona: (persona: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [persona, setPersonaState] = useState<string>("creator");
  const [plan, setPlan] = useState<string>("free");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadWorkspaces() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 1. Fetch personal profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, persona, plan")
        .eq("id", user.id)
        .single();
        
      if (profile) {
        setPersonaState(profile.persona || "creator");
        setPlan(profile.plan || "free");
      }

      // 2. Fetch collaborative workspaces
      const { data: members } = await supabase
        .from("workspace_members")
        .select(`
          workspace_id,
          role,
          profiles!workspace_members_workspace_id_fkey(full_name)
        `)
        .eq("user_id", user.id);

      const loadedWorkspaces: Workspace[] = [];

      if (profile) {
        loadedWorkspaces.push({
          id: profile.id,
          name: "Personal Workspace",
          role: "owner",
          isPersonal: true,
        });
      }

      if (members) {
        for (const m of members) {
          loadedWorkspaces.push({
            id: m.workspace_id,
            name: `${(m.profiles as any)?.full_name || "Team"}'s Workspace`,
            role: m.role as WorkspaceRole,
            isPersonal: false,
          });
        }
      }

      setWorkspaces(loadedWorkspaces);

      // 3. Determine active workspace from cookie or default to personal
      const savedId = getCookie("socially_active_workspace") as string | undefined;
      if (savedId && loadedWorkspaces.some((w) => w.id === savedId)) {
        setActiveWorkspaceId(savedId);
      } else if (loadedWorkspaces.length > 0) {
        setActiveWorkspaceId(loadedWorkspaces[0].id);
        setCookie("socially_active_workspace", loadedWorkspaces[0].id, { path: "/", maxAge: 60 * 60 * 24 * 30 }); // 30 days
      }

      setIsLoading(false);
    }

    loadWorkspaces();
  }, [supabase]);

  const setActiveWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
    setCookie("socially_active_workspace", id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    // Refresh the app so all data re-fetches with the new workspace context
    router.refresh();
  }, [router]);

  const setPersona = useCallback(async (newPersona: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Optimistic UI update
    setPersonaState(newPersona);
    
    // Update DB
    await supabase.from("profiles").update({ persona: newPersona }).eq("id", user.id);
    
    // Refresh to reload server components based on persona
    router.refresh();
  }, [supabase, router]);

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || null,
    [workspaces, activeWorkspaceId]
  );

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspace, isLoading, persona, plan, setPersona }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
