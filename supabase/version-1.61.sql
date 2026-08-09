-- Phase 1 Schema Update: v1.6.0 Feature Expansion

-- Table for Bulk DM Campaigns
CREATE TABLE IF NOT EXISTS dm_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed
  audience_filter JSONB, -- stores rules for selecting followers (e.g. "new followers in last 7 days")
  message_sequence JSONB NOT NULL, -- array of message templates with delays
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking individual leads in a campaign
CREATE TABLE IF NOT EXISTS dm_campaign_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES dm_campaigns(id) ON DELETE CASCADE,
  recipient_handle TEXT NOT NULL,
  recipient_platform_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, sent, replied, failed
  current_step INTEGER DEFAULT 0,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for Viral Trend Monitors
CREATE TABLE IF NOT EXISTS trend_monitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  competitor_handles TEXT[],
  platform TEXT NOT NULL, -- x, linkedin, tiktok
  is_active BOOLEAN DEFAULT TRUE,
  notify_on_viral BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ
);

-- Update social_bots to support specialized roles without altering enum type directly
-- We add a `role` column to avoid complex enum migrations on production
ALTER TABLE social_bots ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'general';

-- Add RLS policies for new tables
ALTER TABLE dm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_monitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own dm_campaigns" ON dm_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own campaign leads" ON dm_campaign_leads FOR ALL USING (
  campaign_id IN (SELECT id FROM dm_campaigns WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage their own trend_monitors" ON trend_monitors FOR ALL USING (auth.uid() = user_id);
