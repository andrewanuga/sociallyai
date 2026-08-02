-- Table for tracking daily historical metrics for each social account
CREATE TABLE IF NOT EXISTS public.social_account_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    followers INTEGER NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    engagements INTEGER NOT NULL DEFAULT 0,
    ai_suggestions JSONB DEFAULT NULL,
    ai_generated_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(account_id, date)
);

-- Index for fast lookups by account and date range
CREATE INDEX IF NOT EXISTS idx_social_account_metrics_account_date ON public.social_account_metrics(account_id, date DESC);

-- Enable RLS
ALTER TABLE public.social_account_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see metrics for accounts they own
CREATE POLICY "Users can manage their own account metrics"
    ON public.social_account_metrics
    FOR ALL
    USING (
        account_id IN (
            SELECT id FROM public.social_accounts WHERE user_id = auth.uid()
        )
    );
