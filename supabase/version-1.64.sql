-- Fix tasks status constraint to allow all values used in the app
alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks add constraint tasks_status_check 
  check (status in ('pending', 'ongoing', 'done', 'finished'));