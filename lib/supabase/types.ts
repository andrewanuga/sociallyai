// Auto-generate full types with: npx supabase gen types typescript --project-id YOUR_ID
// These manual types cover the core tables used by the app

export type Plan = "free" | "basic" | "pro" | "advanced";

export type PostStatus = "scheduled" | "queued" | "posted" | "failed" | "cancelled";

export type AgentAction =
  | "auto_reply"
  | "flag_lead"
  | "escalate_complaint"
  | "ignore";

export type InboxCategory = "leads" | "complaints" | "fluff";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  brand_website: string | null;
  brand_voice: string | null;
  niche: string | null;
  plan: Plan;
  generations_used: number;
  generations_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: string;
  platform_user_id: string;
  platform_username: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  platform: string;
  scheduled_at: string;
  status: PostStatus;
  socially_score: number | null;
  framework: string | null;
  tone: string | null;
  post_url: string | null;
  error_message: string | null;
  created_at: string;
}

export interface PostHistory {
  id: string;
  user_id: string;
  platform: string;
  platform_post_id: string | null;
  content: string | null;
  impressions: number;
  engagements: number;
  likes: number;
  shares: number;
  comments: number;
  followers_gained: number;
  link_clicks: number;
  revenue_attributed: number;
  tracked_link: string | null;
  socially_score: number | null;
  posted_at: string;
}

export interface AgentActionRow {
  id: string;
  user_id: string;
  comment: string;
  action: AgentAction;
  reply: string | null;
  platform: string | null;
  reason: string | null;
  approved: boolean | null;
  approved_at: string | null;
  created_at: string;
}

export interface InboxMessage {
  id: string;
  user_id: string;
  platform: string;
  author_name: string | null;
  author_handle: string | null;
  author_avatar: string | null;
  message: string;
  category: InboxCategory;
  is_read: boolean;
  replied: boolean;
  reply_content: string | null;
  platform_message_id: string | null;
  received_at: string;
}

export type TaskPriority = "low" | "normal" | "high";
export interface Task {
  id: string;
  user_id: string;
  bot_id?: string | null;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  status: "pending" | "ongoing" | "done" | "finished" | "failed";
  created_at: string;
  completed_at: string | null;
}

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  status: "connected" | "disconnected" | "error";
  account_label: string | null;
  config: Record<string, unknown>;
  connected_at: string;
}

export type BotKind = "ghost" | "engagement" | "repurpose" | "monetize" | "triage";
export interface Bot {
  id: string;
  user_id: string;
  name: string;
  kind: BotKind;
  status: "active" | "paused";
  autonomy: "assist" | "auto";
  actions_count: number;
  config: Record<string, unknown>;
  created_at: string;
}

export interface AgentMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface Trend {
  id: string;
  niche: string;
  topic: string;
  category: string | null;
  score: number | null;
  growth: string | null;
  momentum: string | null;
  why: string | null;
  draft: string | null;
  fetched_at: string;
  expires_at: string;
}
