import type { PlatformId } from "./platforms";

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: PlatformId;
  account_type: "personal" | "business" | "creator" | "page" | "channel" | "bot";
  external_id: string;
  handle: string | null;
  display_name: string | null;
  avatar_url: string | null;
  scopes: string[];
  status: "connected" | "expired" | "revoked" | "error";
  followers: number;
  following: number;
  runs_ads: boolean;
  connected_at: string;
  last_synced_at: string | null;
  meta: Record<string, unknown>;
}

export interface SocialInboxMessage {
  id: string;
  user_id: string;
  account_id: string;
  platform: PlatformId;
  thread_id: string | null;
  kind: "dm" | "comment" | "mention" | "reply" | "group";
  author_name: string | null;
  author_handle: string | null;
  author_avatar: string | null;
  body: string;
  category: "lead" | "complaint" | "question" | "fluff" | "mention";
  importance: "normal" | "flagged" | "urgent";
  is_read: boolean;
  replied: boolean;
  reply_body: string | null;
  received_at: string;
}

export interface SocialPost {
  id: string;
  user_id: string;
  account_id: string;
  platform: PlatformId;
  content: string | null;
  media_urls: string[];
  status: "draft" | "scheduled" | "posted" | "failed";
  scheduled_at: string | null;
  posted_at: string | null;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  video_views: number;
  link_clicks: number;
  followers_gained: number;
  engagement_rate: number;
  revenue: number;
  referral_platform: PlatformId | null;
  synced_at: string | null;
}

export interface Campaign {
  id: string;
  user_id: string;
  account_id: string;
  platform: PlatformId;
  name: string;
  objective: string | null;
  status: "active" | "paused" | "ended" | "draft";
  currency: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  ab_variant: string | null;
  start_date: string | null;
  end_date: string | null;
  ai_recommendation: string | null;
}

export interface SocialBot {
  id: string;
  user_id: string;
  account_id: string | null;
  platform: PlatformId | null;
  name: string;
  kind: "ghost" | "engagement" | "repurpose" | "monetize" | "triage" | "messaging" | "scheduler" | "summarizer";
  status: "active" | "paused";
  autonomy: "assist" | "auto";
  actions_count: number;
  last_run_at: string | null;
  config: Record<string, unknown>;
}

export interface ManagedChat {
  id: string;
  user_id: string;
  account_id: string;
  platform: PlatformId;
  chat_id: string;
  chat_type: "dm" | "group" | "channel";
  title: string | null;
  flagged_important: boolean;
  auto_reply_enabled: boolean;
  auto_reply_prompt: string | null;
  summarize_enabled: boolean;
  last_summary: string | null;
  last_summary_at: string | null;
}

export interface SocialTrend {
  id: string;
  user_id: string | null;
  persona: string | null;
  niche: string | null;
  ecosystem: string | null;
  topic: string;
  summary: string | null;
  source_url: string | null;
  source_name: string | null;
  score: number | null;
  momentum: string | null;
  relevant_platforms: string[];
  suggested_account_id: string | null;
  draft: string | null;
  fetched_at: string;
  expires_at: string;
}

export interface AiPersona {
  user_id: string;
  tone_summary: string | null;
  style_traits: Record<string, unknown>;
  sample_count: number;
  updated_at: string;
}
