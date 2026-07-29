-- ============================================================
-- SOCIAL INTEGRATION SCHEMA
-- All social-platform data lives here: connected accounts, inbox,
-- posts + analytics, ad campaigns, bots, messaging (Telegram/WhatsApp),
-- niche trends, and the AI persona/memory that powers personalization.
--
-- Tables are created in `public` so they work with the existing
-- supabase-js client + RLS out of the box. Run AFTER schema.sql.
-- ============================================================

-- Supported platforms (single source of truth for the check constraints).
-- instagram | youtube | x | linkedin | facebook | threads | snapchat |
-- reddit | telegram | whatsapp
do $$ begin
  if not exists (select 1 from pg_type where typname = 'social_platform') then
    create type social_platform as enum (
      'instagram','youtube','x','linkedin','facebook','threads',
      'snapchat','reddit','telegram','whatsapp'
    );
  end if;
end $$;

-- ── CONNECTED SOCIAL ACCOUNTS ───────────────────────────────
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform social_platform not null,
  account_type text not null default 'personal'   -- personal | business | creator | page | channel | bot
    check (account_type in ('personal','business','creator','page','channel','bot')),
  external_id text not null,                        -- platform's own account id
  handle text,                                      -- @handle / page / channel
  display_name text,
  avatar_url text,
  access_token text,                                -- encrypt via Vault in prod
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  status text not null default 'connected'          -- connected | expired | revoked | error
    check (status in ('connected','expired','revoked','error')),
  followers int not null default 0,
  following int not null default 0,
  runs_ads boolean not null default false,          -- has campaigns/advertisement
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  unique (user_id, platform, external_id)
);
create index if not exists social_accounts_user on public.social_accounts(user_id, platform);

-- ── INBOX MESSAGES (DMs, comments, mentions) — used as a stack ──
create table if not exists public.social_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform social_platform not null,
  thread_id text,                                   -- groups a conversation
  external_id text,
  kind text not null default 'comment'              -- dm | comment | mention | reply | group
    check (kind in ('dm','comment','mention','reply','group')),
  author_name text,
  author_handle text,
  author_avatar text,
  body text not null,
  category text not null default 'fluff'            -- lead | complaint | question | fluff | mention
    check (category in ('lead','complaint','question','fluff','mention')),
  importance text not null default 'normal'         -- normal | flagged | urgent
    check (importance in ('normal','flagged','urgent')),
  is_read boolean not null default false,
  replied boolean not null default false,
  reply_body text,
  received_at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);
-- Stack ordering: newest first per account (LIFO).
create index if not exists social_inbox_stack on public.social_inbox(account_id, received_at desc);

-- ── POSTS + PER-POST ANALYTICS ──────────────────────────────
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform social_platform not null,
  external_id text,
  content text,
  media_urls text[] not null default '{}',
  status text not null default 'posted'             -- draft | scheduled | posted | failed
    check (status in ('draft','scheduled','posted','failed')),
  scheduled_at timestamptz,
  posted_at timestamptz,
  -- analytics (synced from platform)
  impressions int not null default 0,
  reach int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  shares int not null default 0,
  saves int not null default 0,
  video_views int not null default 0,
  link_clicks int not null default 0,
  followers_gained int not null default 0,
  engagement_rate numeric(6,3) not null default 0,
  revenue numeric(14,2) not null default 0,
  -- creator referral: "did well here → try there"
  referral_platform social_platform,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists social_posts_perf on public.social_posts(user_id, posted_at desc);

-- ── AD CAMPAIGNS + ANALYTICS + AI RECOMMENDATION ────────────
create table if not exists public.social_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform social_platform not null,
  external_id text,
  name text not null,
  objective text,                                   -- awareness | traffic | conversions | leads
  status text not null default 'active'
    check (status in ('active','paused','ended','draft')),
  currency text not null default 'NGN',
  budget numeric(14,2) not null default 0,
  spend numeric(14,2) not null default 0,
  impressions int not null default 0,
  clicks int not null default 0,
  conversions int not null default 0,
  ctr numeric(6,3) not null default 0,
  cpc numeric(12,2) not null default 0,
  roas numeric(8,2) not null default 0,             -- return on ad spend
  ab_variant text,                                  -- A / B for split tests
  start_date date,
  end_date date,
  ai_recommendation text,                           -- how to improve it
  synced_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists social_campaigns_user on public.social_campaigns(user_id, status);

-- ── BOTS (per connected account) ────────────────────────────
create table if not exists public.social_bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid references public.social_accounts(id) on delete cascade,
  platform social_platform,
  name text not null,
  kind text not null                                -- ghost | engagement | repurpose | monetize | triage | messaging | scheduler | summarizer
    check (kind in ('ghost','engagement','repurpose','monetize','triage','messaging','scheduler','summarizer')),
  status text not null default 'paused' check (status in ('active','paused')),
  autonomy text not null default 'assist' check (autonomy in ('assist','auto')),
  actions_count int not null default 0,
  last_run_at timestamptz,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists social_bots_user on public.social_bots(user_id);

-- ── MANAGED CHATS (Telegram / WhatsApp groups + DMs) ────────
create table if not exists public.managed_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform social_platform not null,                -- telegram | whatsapp
  chat_id text not null,
  chat_type text not null default 'group'           -- dm | group | channel
    check (chat_type in ('dm','group','channel')),
  title text,
  flagged_important boolean not null default false, -- summarize keynotes when away
  auto_reply_enabled boolean not null default false,
  auto_reply_prompt text,
  summarize_enabled boolean not null default false,
  last_summary text,
  last_summary_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (account_id, chat_id)
);

-- ── SCHEDULED MESSAGES (send when away) ─────────────────────
create table if not exists public.scheduled_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  chat_id uuid references public.managed_chats(id) on delete cascade,
  platform social_platform not null,
  target text,                                      -- handle / chat id if no managed_chat row
  body text not null,
  media_url text,
  send_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','sent','failed','cancelled')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists scheduled_messages_due on public.scheduled_messages(status, send_at);

-- ── NICHE TRENDS (from web search, referred to a connected account) ──
create table if not exists public.social_trends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  persona text,                                     -- client | creator | marketer
  niche text,
  ecosystem text,                                   -- platform ecosystem the trend lives in
  topic text not null,
  summary text,
  source_url text,
  source_name text,
  score int,
  momentum text,
  relevant_platforms text[] not null default '{}',
  suggested_account_id uuid references public.social_accounts(id) on delete set null,
  draft text,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '12 hours')
);
create index if not exists social_trends_scope on public.social_trends(user_id, expires_at desc);

-- ── AI PERSONA (learned tone → personalized chatting) ───────
create table if not exists public.ai_persona (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tone_summary text,                                -- how the person writes/works
  style_traits jsonb not null default '{}'::jsonb,  -- {formality, emoji, sentence_len, vocabulary, ...}
  sample_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- ── AI MESSAGE MEMORY (past messages the AI notes for tone) ──
create table if not exists public.ai_message_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null default 'chat'               -- chat | inbox | dm | group
    check (source in ('chat','inbox','dm','group')),
  platform text,
  role text not null check (role in ('user','contact','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_message_memory_user on public.ai_message_memory(user_id, created_at desc);

-- ============================================================
-- ROW-LEVEL SECURITY — users only touch their own rows
-- ============================================================
alter table public.social_accounts    enable row level security;
alter table public.social_inbox        enable row level security;
alter table public.social_posts        enable row level security;
alter table public.social_campaigns    enable row level security;
alter table public.social_bots         enable row level security;
alter table public.managed_chats       enable row level security;
alter table public.scheduled_messages  enable row level security;
alter table public.social_trends       enable row level security;
alter table public.ai_persona          enable row level security;
alter table public.ai_message_memory   enable row level security;

create policy "own social_accounts"   on public.social_accounts   for all using (auth.uid() = user_id);
create policy "own social_inbox"       on public.social_inbox       for all using (auth.uid() = user_id);
create policy "own social_posts"       on public.social_posts       for all using (auth.uid() = user_id);
create policy "own social_campaigns"   on public.social_campaigns   for all using (auth.uid() = user_id);
create policy "own social_bots"        on public.social_bots        for all using (auth.uid() = user_id);
create policy "own managed_chats"      on public.managed_chats      for all using (auth.uid() = user_id);
create policy "own scheduled_messages" on public.scheduled_messages for all using (auth.uid() = user_id);
create policy "own social_trends"      on public.social_trends      for all using (auth.uid() = user_id);
create policy "own ai_persona"         on public.ai_persona         for all using (auth.uid() = user_id);
create policy "own ai_message_memory"  on public.ai_message_memory  for all using (auth.uid() = user_id);
