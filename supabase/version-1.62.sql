-- ============================================================
-- AI SCHEDULER MEDIA & BUCKET (Version 1.62)
-- ============================================================

-- Add media_urls column to scheduled_ai_tasks
alter table public.scheduled_ai_tasks 
  add column if not exists media_urls text[] not null default '{}';

-- We also want to ensure scheduled_posts supports media_urls if it doesn't already
alter table public.scheduled_posts 
  add column if not exists media_urls text[] not null default '{}';

-- Create the Storage Bucket for media
insert into storage.buckets (id, name, public) 
values ('media', 'media', true)
on conflict (id) do nothing;

-- Set up RLS for the media bucket
create policy "Users can upload their own media"
  on storage.objects for insert
  with check ( bucket_id = 'media' and auth.uid() = owner );

create policy "Users can update their own media"
  on storage.objects for update
  using ( bucket_id = 'media' and auth.uid() = owner );

create policy "Users can delete their own media"
  on storage.objects for delete
  using ( bucket_id = 'media' and auth.uid() = owner );

create policy "Anyone can view public media"
  on storage.objects for select
  using ( bucket_id = 'media' );