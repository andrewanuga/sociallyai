-- ============================================================
-- UPGRADED ADMIN SCHEMA
-- Global Broadcasts, Feature Flags, and Health Metrics
-- ============================================================

-- ── System Broadcasts ─────────────────────────────────────────
create table if not exists public.system_broadcasts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  type text not null default 'info'            -- info | warning | critical
    check (type in ('info', 'warning', 'critical')),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

-- Users need to be able to read active broadcasts
alter table public.system_broadcasts enable row level security;
create policy "anyone can read active broadcasts"
  on public.system_broadcasts for select using (is_active = true);
create policy "admins manage broadcasts"
  on public.system_broadcasts for all using (public.is_admin(auth.uid()));


-- ── Global Feature Flags ──────────────────────────────────────
create table if not exists public.feature_flags (
  key text primary key,                        -- e.g., 'ghost_mode_enabled', 'beta_analytics'
  is_enabled boolean not null default false,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Users need to be able to read feature flags to hide/show UI
alter table public.feature_flags enable row level security;
create policy "anyone can read feature flags"
  on public.feature_flags for select using (true);
create policy "admins manage feature flags"
  on public.feature_flags for all using (public.is_admin(auth.uid()));

-- Insert some default flags
insert into public.feature_flags (key, is_enabled, description) values
  ('ghost_mode_enabled', true, 'Toggle the Ghost Mode autonomous agent feature'),
  ('auto_scheduler', true, 'Toggle the ability to auto-schedule posts'),
  ('competitor_spy', true, 'Toggle the competitor analysis tools')
on conflict (key) do nothing;

-- ── User Notifications ───────────────────────────────────────
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  body text not null,
  type text not null default 'system',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_notifications enable row level security;
create policy "users can read their own notifications"
  on public.user_notifications for select using (auth.uid() = user_id);
create policy "users can update their own notifications"
  on public.user_notifications for update using (auth.uid() = user_id);
create policy "admins manage user_notifications"
  on public.user_notifications for all using (public.is_admin(auth.uid()));

do $$ begin
  begin
    alter publication supabase_realtime add table public.user_notifications;
  exception when duplicate_object then null; when undefined_object then null;
  end;
end $$;

-- ── Global Admin RLS Overrides for Impersonation ──────────────
-- These policies allow admins to read and manage all user data,
-- enabling the "Impersonation" feature.

do $$ 
declare
  t text;
begin
  for t in select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' loop
    begin
      execute format('create policy "admins manage %I" on public.%I for all using (public.is_admin(auth.uid()))', t, t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;