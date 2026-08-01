-- ============================================================
-- ADMIN SCHEMA
-- Admin roles, account suspension, IP blocking, and the security
-- event log that powers the /admin SOC dashboard.
-- Run after schema.sql. Bootstrap yourself as admin at the bottom.
-- ============================================================

-- ── Admin + suspension flags on profiles ────────────────────
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists suspended boolean not null default false;
alter table public.profiles add column if not exists suspended_at timestamptz;
alter table public.profiles add column if not exists suspend_reason text;

-- Helper: is the given user an admin? (security definer so policies can use it)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- ── Blocked IPs ─────────────────────────────────────────────
create table if not exists public.blocked_ips (
  ip text primary key,
  reason text,
  blocked_by uuid references public.profiles(id) on delete set null,
  auto boolean not null default false,            -- auto-blocked by the rate limiter
  created_at timestamptz not null default now(),
  expires_at timestamptz                          -- null = permanent
);
create index if not exists blocked_ips_active on public.blocked_ips(expires_at);

-- ── Security events (SOC feed) ──────────────────────────────
create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,                             -- login_failed | signup | rate_limited | ip_blocked | suspicious_input | account_suspended | admin_action ...
  ip text,
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  path text,
  severity text not null default 'info'           -- info | warning | critical
    check (severity in ('info','warning','critical')),
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists security_events_time on public.security_events(created_at desc);
create index if not exists security_events_type on public.security_events(type, created_at desc);
create index if not exists security_events_ip on public.security_events(ip, created_at desc);

-- ============================================================
-- ROW-LEVEL SECURITY
-- Admins only. Server code uses the service role and bypasses RLS.
-- ============================================================
alter table public.blocked_ips     enable row level security;
alter table public.security_events enable row level security;

create policy "admins manage blocked_ips"
  on public.blocked_ips for all using (public.is_admin(auth.uid()));
create policy "admins read security_events"
  on public.security_events for select using (public.is_admin(auth.uid()));

-- Admins can read + manage every profile (list users, suspend, change plans).
create policy "admins read all profiles"
  on public.profiles for select using (public.is_admin(auth.uid()));
create policy "admins update all profiles"
  on public.profiles for update using (public.is_admin(auth.uid()));

-- Admins can read all payments (revenue overview).
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'payments') then
    execute 'create policy "admins read all payments" on public.payments for select using (public.is_admin(auth.uid()))';
  end if;
exception when duplicate_object then null;
end $$;

-- ── Bootstrap: make yourself an admin (replace the email) ────
update public.profiles set is_admin = true
  where id in (select id from auth.users where email in ('socially.ai.io@gmail.com', 'adakoleandrew21@gmail.com'));