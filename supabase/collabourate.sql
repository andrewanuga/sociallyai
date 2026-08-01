-- ============================================================
-- SociallyAI — Collaborative Workspaces / Teams Schema
-- Run this in the Supabase SQL editor to bootstrap teams
-- ============================================================

-- 1. Add team to the plan enum in profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check 
  CHECK (plan IN ('free', 'basic', 'pro', 'advanced', 'team'));

-- 2. Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'manager', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Index for fast RLS checks
CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS workspace_members_workspace_id_idx ON public.workspace_members(workspace_id);

-- 3. Create workspace_invites table
CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'manager', 'member')),
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(workspace_id, email)
);

-- 4. Helper function for RLS
CREATE OR REPLACE FUNCTION public.is_workspace_member(owner_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = owner_id AND user_id = check_user_id
  );
$$;

-- 5. RLS for workspace_members
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Owner can read their workspace members
CREATE POLICY "Owners can see their workspace members"
  ON public.workspace_members FOR SELECT
  USING (auth.uid() = workspace_id);

-- Members can see other members in the workspace they belong to
CREATE POLICY "Members can see peers"
  ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Only owners/managers can invite/remove (managed via API, so we can restrict UI here)
-- but server-side API uses service role, so this is mostly for select.

-- 6. RLS for workspace_invites
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can see their invites"
  ON public.workspace_invites FOR SELECT
  USING (auth.uid() = workspace_id);

CREATE POLICY "Members can see invites"
  ON public.workspace_invites FOR SELECT
  USING (public.is_workspace_member(workspace_id, auth.uid()));

-- ============================================================
-- 7. UPDATE EXISTING RLS POLICIES FOR COLLABORATION
-- ============================================================
-- We modify existing policies to also allow access if the user is a collaborator

-- scheduled_posts
DROP POLICY IF EXISTS "Users manage own scheduled posts" ON public.scheduled_posts;
CREATE POLICY "Workspace access for scheduled posts"
  ON public.scheduled_posts FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));

-- post_history
DROP POLICY IF EXISTS "Users read own post history" ON public.post_history;
CREATE POLICY "Workspace access for post history"
  ON public.post_history FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));

-- agent_actions
DROP POLICY IF EXISTS "Users read own agent actions" ON public.agent_actions;
CREATE POLICY "Workspace access for agent actions"
  ON public.agent_actions FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));

-- connected_accounts (read-only for members, handled by API for writes)
DROP POLICY IF EXISTS "Users manage own accounts" ON public.connected_accounts;
CREATE POLICY "Workspace access for connected accounts"
  ON public.connected_accounts FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));

-- inbox_messages
DROP POLICY IF EXISTS "Users manage own inbox" ON public.inbox_messages;
CREATE POLICY "Workspace access for inbox messages"
  ON public.inbox_messages FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));

-- tasks
DROP POLICY IF EXISTS "Users manage own tasks" ON public.tasks;
CREATE POLICY "Workspace access for tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));

-- bots
DROP POLICY IF EXISTS "Users manage own bots" ON public.bots;
CREATE POLICY "Workspace access for bots"
  ON public.bots FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));

-- agent_conversations
DROP POLICY IF EXISTS "Users manage own conversations" ON public.agent_conversations;
CREATE POLICY "Workspace access for agent conversations"
  ON public.agent_conversations FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));

-- agent_messages
DROP POLICY IF EXISTS "Users manage own agent messages" ON public.agent_messages;
CREATE POLICY "Workspace access for agent messages"
  ON public.agent_messages FOR ALL
  USING (auth.uid() = user_id OR public.is_workspace_member(user_id, auth.uid()));
