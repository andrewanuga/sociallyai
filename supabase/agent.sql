-- Indexes to speed up Webhook payload lookups for Ghost Mode auto-replies
CREATE INDEX IF NOT EXISTS idx_social_accounts_external_id ON public.social_accounts(external_id);
CREATE INDEX IF NOT EXISTS idx_social_bots_user_id_status ON public.social_bots(user_id, status);