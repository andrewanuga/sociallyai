-- Database migrations for AI Bot Tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS bot_id UUID REFERENCES public.social_bots(id) ON DELETE SET NULL;

-- Ensure the status column allows 'ongoing' and 'finished'
DO $$
BEGIN
  ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('pending', 'ongoing', 'done', 'finished', 'failed'));

-- Migrate existing tasks to the new terminology
UPDATE public.tasks SET status = 'ongoing' WHERE status = 'pending';
UPDATE public.tasks SET status = 'finished' WHERE status = 'done';
