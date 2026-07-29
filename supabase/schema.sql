-- ============================================================
-- SociallyAI — Supabase Database Schema
-- Run this in the Supabase SQL editor to bootstrap the database
-- ============================================================

-- Enable pgvector for AI memory / embeddings
create extension if not exists vector;

-- ============================================================
-- PROFILES
-- Extended user data beyond auth.users
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,                       -- Chosen during onboarding
  avatar_url text,
  brand_website text,
  brand_voice text,                          -- Extracted brand voice from URL
  niche text,                                -- e.g. "Tech / Startups"
  plan text not null default 'free'          -- free | basic | pro | advanced
    check (plan in ('free', 'basic', 'pro', 'advanced')),

  -- ── Onboarding ──────────────────────────────────────────
  persona text                               -- who they are using Socially as
    check (persona in ('client', 'creator', 'marketer')),
  posts_per_week int,                        -- desired posting cadence
  -- Client
  social_activity text,                      -- current state of their social presence
  -- Creator
  audience_range text,                       -- current viewer/follower range
  scaling_goal text,                         -- how they want to grow
  -- Marketer
  conversion_rate text,                      -- current conversion rate band
  business_type text,                        -- e.g. E-commerce, SaaS, Agency
  onboarded boolean not null default false,
  onboarded_at timestamptz,

  generations_used int not null default 0,
  generations_reset_at timestamptz default (now() + interval '1 month'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration: add onboarding columns to pre-existing profiles tables
alter table public.profiles add column if not exists username text unique;
alter table public.profiles add column if not exists persona text
  check (persona in ('client', 'creator', 'marketer'));
alter table public.profiles add column if not exists posts_per_week int;
alter table public.profiles add column if not exists social_activity text;
alter table public.profiles add column if not exists audience_range text;
alter table public.profiles add column if not exists scaling_goal text;
alter table public.profiles add column if not exists conversion_rate text;
alter table public.profiles add column if not exists business_type text;
alter table public.profiles add column if not exists onboarded boolean not null default false;
alter table public.profiles add column if not exists onboarded_at timestamptz;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CONNECTED ACCOUNTS
-- OAuth tokens for social platforms
-- ============================================================
create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null                     -- x | linkedin | instagram | tiktok | threads
    check (platform in ('x', 'linkedin', 'instagram', 'tiktok', 'threads', 'whatsapp', 'youtube')),
  platform_user_id text not null,            -- Platform's own user ID
  platform_username text,                    -- @handle or display name
  access_token text,                         -- Encrypted in prod (use Vault)
  refresh_token text,
  token_expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, platform)
);

-- ============================================================
-- SCHEDULED POSTS
-- Content calendar entries
-- ============================================================
create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  platform text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'   -- scheduled | posted | failed | cancelled
    check (status in ('scheduled', 'queued', 'posted', 'failed', 'cancelled')),
  socially_score int,                        -- Predicted engagement score (0-100)
  framework text,                            -- aida | pas | hook | story
  tone text,                                 -- Professional | Casual | Naija Vibe | etc.
  post_url text,                             -- URL after posting
  error_message text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- POST HISTORY
-- Actual post performance data (synced from social APIs)
-- ============================================================
create table if not exists public.post_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  platform_post_id text,                     -- ID from the social platform
  content text,
  impressions int default 0,
  engagements int default 0,
  likes int default 0,
  shares int default 0,
  comments int default 0,
  followers_gained int default 0,
  link_clicks int default 0,
  revenue_attributed numeric(12, 2) default 0, -- ROI Pulse ₦ value
  tracked_link text,                         -- Unique UTM link
  socially_score int,                        -- Predicted score at time of posting
  posted_at timestamptz not null default now(),
  embedding vector(768)                      -- For semantic search (pgvector)
);

-- Index for fast user + date queries
create index if not exists post_history_user_date
  on public.post_history(user_id, posted_at desc);

-- ============================================================
-- GHOST MODE AGENT ACTIONS
-- Log of all autonomous agent activity
-- ============================================================
create table if not exists public.agent_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null,
  action text not null                       -- auto_reply | flag_lead | escalate_complaint | ignore
    check (action in ('auto_reply', 'flag_lead', 'escalate_complaint', 'ignore')),
  reply text,                                -- The AI-generated reply (if auto_reply)
  platform text,
  reason text,
  approved boolean default null,            -- null = pending, true = approved, false = rejected
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INBOX MESSAGES
-- Aggregated DMs and comments from all platforms
-- ============================================================
create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  author_name text,
  author_handle text,
  author_avatar text,
  message text not null,
  category text not null default 'fluff'    -- leads | complaints | fluff
    check (category in ('leads', 'complaints', 'fluff')),
  is_read boolean not null default false,
  replied boolean not null default false,
  reply_content text,
  platform_message_id text,
  received_at timestamptz not null default now()
);

-- ============================================================
-- TRENDS
-- Cached trend data per user niche
-- ============================================================
create table if not exists public.trends (
  id uuid primary key default gen_random_uuid(),
  niche text not null,
  topic text not null,
  category text,
  score int,
  growth text,
  momentum text,
  why text,
  draft text,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '6 hours')
);

create index if not exists trends_niche_expiry
  on public.trends(niche, expires_at desc);

-- ============================================================
-- ROI TRACKING
-- UTM link → conversion attribution
-- ============================================================
create table if not exists public.roi_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.post_history(id),
  tracked_link text not null,
  referrer text,
  converted boolean not null default false,
  revenue numeric(12, 2) default 0,
  clicked_at timestamptz not null default now()
);

-- ============================================================
-- GENERATION QUOTA MANAGEMENT
-- Stored procedure called after each AI generation
-- ============================================================
create or replace function public.decrement_generations(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Reset counter if past reset date
  update public.profiles
  set
    generations_used = 0,
    generations_reset_at = now() + interval '1 month'
  where id = user_id
    and generations_reset_at < now();

  -- Increment usage
  update public.profiles
  set generations_used = generations_used + 1
  where id = user_id;
end;
$$;

-- ============================================================
-- ROW-LEVEL SECURITY
-- Every user can only access their own data
-- ============================================================
alter table public.profiles enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.post_history enable row level security;
alter table public.agent_actions enable row level security;
alter table public.inbox_messages enable row level security;
alter table public.roi_clicks enable row level security;

-- Profiles
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Connected accounts
create policy "Users manage own accounts"
  on public.connected_accounts for all using (auth.uid() = user_id);

-- Scheduled posts
create policy "Users manage own scheduled posts"
  on public.scheduled_posts for all using (auth.uid() = user_id);

-- Post history
create policy "Users read own post history"
  on public.post_history for all using (auth.uid() = user_id);

-- Agent actions
create policy "Users read own agent actions"
  on public.agent_actions for all using (auth.uid() = user_id);

-- Inbox messages
create policy "Users manage own inbox"
  on public.inbox_messages for all using (auth.uid() = user_id);

-- ROI clicks
create policy "Users read own ROI data"
  on public.roi_clicks for all using (auth.uid() = user_id);

-- ============================================================
-- AI + APPEARANCE SETTINGS (on profiles)
-- ============================================================
alter table public.profiles add column if not exists ai_model text not null default 'llama-3.3-70b';
alter table public.profiles add column if not exists ai_unfiltered boolean not null default false;
alter table public.profiles add column if not exists ai_temperature numeric(3,2) not null default 0.7;
alter table public.profiles add column if not exists theme_pref text not null default 'dark';   -- dark | light | system
alter table public.profiles add column if not exists font_pref text not null default 'inter';   -- inter | general-sans | geist

-- ============================================================
-- TASKS  (task manager — LIFO / stack ordering by created_at desc)
-- ============================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  priority text not null default 'normal'      -- low | normal | high
    check (priority in ('low', 'normal', 'high')),
  status text not null default 'pending'        -- pending | done
    check (status in ('pending', 'done')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists tasks_user_stack on public.tasks(user_id, created_at desc);

-- ============================================================
-- INTEGRATIONS  (external tools: calendar, analytics, etc.)
-- ============================================================
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,                       -- google_calendar | google_analytics | notion | slack | zapier | webhook ...
  status text not null default 'connected'      -- connected | disconnected | error
    check (status in ('connected', 'disconnected', 'error')),
  account_label text,                           -- e.g. connected account email
  config jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  unique(user_id, provider)
);

-- ============================================================
-- BOTS  (autonomous agents: ghost, engagement, repurpose, monetize)
-- ============================================================
create table if not exists public.bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  kind text not null                            -- ghost | engagement | repurpose | monetize | triage
    check (kind in ('ghost', 'engagement', 'repurpose', 'monetize', 'triage')),
  status text not null default 'paused'          -- active | paused
    check (status in ('active', 'paused')),
  autonomy text not null default 'assist'        -- assist (human-in-loop) | auto
    check (autonomy in ('assist', 'auto')),
  actions_count int not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- AGENT CHAT  (per-user Socially AI conversations)
-- ============================================================
create table if not exists public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.agent_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists agent_messages_convo on public.agent_messages(conversation_id, created_at);

-- ── RLS for new tables ──────────────────────────────────
alter table public.tasks enable row level security;
alter table public.integrations enable row level security;
alter table public.bots enable row level security;
alter table public.agent_conversations enable row level security;
alter table public.agent_messages enable row level security;

create policy "Users manage own tasks"
  on public.tasks for all using (auth.uid() = user_id);
create policy "Users manage own integrations"
  on public.integrations for all using (auth.uid() = user_id);
create policy "Users manage own bots"
  on public.bots for all using (auth.uid() = user_id);
create policy "Users manage own conversations"
  on public.agent_conversations for all using (auth.uid() = user_id);
create policy "Users manage own agent messages"
  on public.agent_messages for all using (auth.uid() = user_id);