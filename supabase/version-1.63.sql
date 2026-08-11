-- Add personalization fields for AI trend tracking
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists lifestyle text;