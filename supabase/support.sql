-- ============================================================
-- SUPPORT SCHEMA
-- In-app support tickets (Bugs / Feature requests / Help / Other).
-- Messages are stored here and emailed to the team by /api/support.
-- Run after schema.sql.
-- ============================================================

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null default 'help'             -- bug | feature | help | other
    check (category in ('bug','feature','help','other')),
  message text not null,
  email text,                                       -- reply-to
  status text not null default 'open'               -- open | resolved
    check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
create index if not exists support_tickets_user on public.support_tickets(user_id, created_at desc);

-- Row-level security — users only touch their own tickets.
alter table public.support_tickets enable row level security;
create policy "own support_tickets" on public.support_tickets for all using (auth.uid() = user_id);
