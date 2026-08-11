-- ============================================================
-- SCHEDULED AI TASKS (Version 1.61)
-- Time-based AI triggers that run autonomously
-- ============================================================
create table if not exists public.scheduled_ai_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  prompt text not null,
  platform text,
  trigger_at timestamptz not null,
  status text not null default 'pending'        -- pending | running | completed | failed
    check (status in ('pending', 'running', 'completed', 'failed')),
  result_text text,
  created_at timestamptz not null default now()
);

alter table public.scheduled_ai_tasks enable row level security;

create policy "Users manage own scheduled ai tasks"
  on public.scheduled_ai_tasks for all using (auth.uid() = user_id);