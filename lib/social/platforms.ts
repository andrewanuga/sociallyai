// Single source of truth for every social platform Socially supports.
// Pure data (no React) so it's safe to import in server OAuth routes too.

export type PlatformId =
  | "instagram" | "youtube" | "x" | "linkedin" | "facebook"
  | "threads" | "snapchat" | "reddit" | "telegram" | "whatsapp";

export type Capability =
  | "post" | "schedule" | "inbox" | "analytics" | "campaigns"
  | "messaging" | "bots";

export interface PlatformDef {
  id: PlatformId;
  name: string;
  category: "Publishing" | "Messaging";
  color: string;
  /** How the user connects: OAuth redirect, or pasting a token/credential. */
  connectType: "oauth" | "token";
  /** Env vars that must be present for a live connection. */
  env: string[];
  capabilities: Capability[];
  oauth?: {
    authorizeUrl: string;
    tokenUrl: string;
    scopes: string[];
    docs: string;
    clientIdEnv: string;
    clientSecretEnv: string;
  };
  /** For token-based connectors (Telegram/WhatsApp). */
  tokenSetup?: { label: string; docs: string };
  note?: string;
}

export const PLATFORMS: Record<PlatformId, PlatformDef> = {
  instagram: {
    id: "instagram", name: "Instagram", category: "Publishing", color: "#E1306C",
    connectType: "oauth", env: ["INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET"],
    capabilities: ["post", "schedule", "inbox", "analytics", "campaigns", "bots"],
    oauth: {
      authorizeUrl: "https://www.instagram.com/oauth/authorize",
      tokenUrl: "https://api.instagram.com/oauth/access_token",
      scopes: ["instagram_business_basic", "instagram_business_manage_messages", "instagram_business_manage_comments", "instagram_business_content_publish", "instagram_business_manage_insights"],
      docs: "https://developers.facebook.com/docs/instagram-api",
      clientIdEnv: "INSTAGRAM_APP_ID", clientSecretEnv: "INSTAGRAM_APP_SECRET",
    },
  },
  youtube: {
    id: "youtube", name: "YouTube", category: "Publishing", color: "#FF0000",
    connectType: "oauth", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    capabilities: ["post", "schedule", "inbox", "analytics", "bots"],
    oauth: {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/yt-analytics.readonly"],
      docs: "https://developers.google.com/youtube/v3/guides/authentication",
      clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    },
    note: "Needs a Google Cloud OAuth app (GOOGLE_CLIENT_ID/SECRET).",
  },
  x: {
    id: "x", name: "X (Twitter)", category: "Publishing", color: "#1DA1F2",
    connectType: "oauth", env: ["X_CLIENT_ID", "X_CLIENT_SECRET"],
    capabilities: ["post", "schedule", "inbox", "analytics", "bots"],
    oauth: {
      authorizeUrl: "https://twitter.com/i/oauth2/authorize",
      tokenUrl: "https://api.twitter.com/2/oauth2/token",
      scopes: ["tweet.read", "tweet.write", "users.read", "dm.read", "dm.write", "offline.access"],
      docs: "https://developer.twitter.com/en/docs/authentication/oauth-2-0",
      clientIdEnv: "X_CLIENT_ID", clientSecretEnv: "X_CLIENT_SECRET",
    },
  },
  linkedin: {
    id: "linkedin", name: "LinkedIn", category: "Publishing", color: "#0A66C2",
    connectType: "oauth", env: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
    capabilities: ["post", "schedule", "analytics", "bots"],
    oauth: {
      authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      scopes: ["openid", "profile", "email", "w_member_social"],
      docs: "https://learn.microsoft.com/en-us/linkedin/marketing/",
      clientIdEnv: "LINKEDIN_CLIENT_ID", clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
    },
  },
  facebook: {
    id: "facebook", name: "Facebook", category: "Publishing", color: "#1877F2",
    connectType: "oauth", env: ["META_APP_ID", "META_APP_SECRET"],
    capabilities: ["post", "schedule", "inbox", "analytics", "campaigns", "bots"],
    oauth: {
      authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
      scopes: ["pages_manage_posts", "pages_read_engagement", "pages_messaging", "read_insights", "ads_read"],
      docs: "https://developers.facebook.com/docs/pages-api",
      clientIdEnv: "META_APP_ID", clientSecretEnv: "META_APP_SECRET",
    },
  },
  threads: {
    id: "threads", name: "Threads", category: "Publishing", color: "#a855f7",
    connectType: "oauth", env: ["THREAD_APP_ID", "THREAD_APP_SECRET"],
    capabilities: ["post", "schedule", "analytics", "bots"],
    oauth: {
      authorizeUrl: "https://threads.net/oauth/authorize",
      tokenUrl: "https://graph.threads.net/oauth/access_token",
      scopes: ["threads_basic", "threads_content_publish", "threads_manage_insights"],
      docs: "https://developers.facebook.com/docs/threads",
      clientIdEnv: "THREAD_APP_ID", clientSecretEnv: "THREAD_APP_SECRET",
    },
  },
  snapchat: {
    id: "snapchat", name: "Snapchat", category: "Publishing", color: "#FFFC00",
    connectType: "oauth", env: ["SNAPCHAT_CLIENT_ID", "SNAPCHAT_CLIENT_SECRET"],
    capabilities: ["post", "analytics", "campaigns"],
    oauth: {
      authorizeUrl: "https://accounts.snapchat.com/login/oauth2/authorize",
      tokenUrl: "https://accounts.snapchat.com/login/oauth2/access_token",
      scopes: ["snapchat-marketing-api", "snapchat-profile-api"],
      docs: "https://developers.snap.com/api/marketing-api/",
      clientIdEnv: "SNAPCHAT_CLIENT_ID", clientSecretEnv: "SNAPCHAT_CLIENT_SECRET",
    },
    note: "Needs a Snap Kit / Marketing API app.",
  },
  reddit: {
    id: "reddit", name: "Reddit", category: "Publishing", color: "#FF4500",
    connectType: "oauth", env: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
    capabilities: ["post", "schedule", "inbox", "bots"],
    oauth: {
      authorizeUrl: "https://www.reddit.com/api/v1/authorize",
      tokenUrl: "https://www.reddit.com/api/v1/access_token",
      scopes: ["identity", "submit", "read", "privatemessages", "history"],
      docs: "https://github.com/reddit-archive/reddit/wiki/OAuth2",
      clientIdEnv: "REDDIT_CLIENT_ID", clientSecretEnv: "REDDIT_CLIENT_SECRET",
    },
    note: "Needs a Reddit script/web app.",
  },
  telegram: {
    id: "telegram", name: "Telegram", category: "Messaging", color: "#229ED9",
    connectType: "token", env: ["TELEGRAM_BOT_TOKEN"],
    capabilities: ["messaging", "schedule", "bots", "inbox"],
    tokenSetup: { label: "Bot token from @BotFather", docs: "https://core.telegram.org/bots#botfather" },
    note: "Manage bots, reply/message when away, schedule messages, and summarize flagged groups.",
  },
  whatsapp: {
    id: "whatsapp", name: "WhatsApp", category: "Messaging", color: "#25D366",
    connectType: "token", env: ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID"],
    capabilities: ["messaging", "schedule", "bots", "inbox"],
    tokenSetup: { label: "WhatsApp Cloud API token + phone number ID", docs: "https://developers.facebook.com/docs/whatsapp/cloud-api" },
    note: "Manage bots, reply/message when away, schedule messages, and summarize flagged groups.",
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export const CAPABILITY_LABEL: Record<Capability, string> = {
  post: "Publish", schedule: "Schedule", inbox: "Inbox", analytics: "Analytics",
  campaigns: "Campaigns", messaging: "Messaging", bots: "Bots",
};

/** True when the platform's required env credentials are all present (server-side). */
export function isPlatformConfigured(id: PlatformId): boolean {
  const p = PLATFORMS[id];
  return p.env.every((k) => !!process.env[k]);
}
