// Non-social integrations: calendar, analytics, and productivity/automation tools.
// Connected records live in the `integrations` table (provider + status + config).

export type ToolId =
  | "google_calendar" | "google_analytics" | "google_sheets"
  | "slack" | "notion" | "discord" | "mailchimp" | "zapier" | "webhook";

export interface ToolDef {
  id: ToolId;
  name: string;
  category: "Calendar" | "Analytics" | "Productivity" | "Automation" | "Email";
  color: string;
  desc: string;
  connectType: "oauth" | "api_key" | "webhook";
  env: string[];
  oauth?: {
    authorizeUrl: string; tokenUrl: string; scopes: string[];
    clientIdEnv: string; clientSecretEnv: string; docs: string;
    extra?: Record<string, string>;
  };
  keySetup?: { label: string; docs: string };
}

const GOOGLE = {
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  clientIdEnv: "GOOGLE_CLIENT_ID",
  clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  docs: "https://console.cloud.google.com/apis/credentials",
  extra: { access_type: "offline", prompt: "consent" },
};

export const TOOLS: Record<ToolId, ToolDef> = {
  google_calendar: {
    id: "google_calendar", name: "Google Calendar", category: "Calendar", color: "#4285F4",
    desc: "Push scheduled posts + messages onto your calendar.",
    connectType: "oauth", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    oauth: { ...GOOGLE, scopes: ["https://www.googleapis.com/auth/calendar.events"] },
  },
  google_analytics: {
    id: "google_analytics", name: "Google Analytics", category: "Analytics", color: "#E37400",
    desc: "Attribute traffic and conversions to your posts.",
    connectType: "oauth", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    oauth: { ...GOOGLE, scopes: ["https://www.googleapis.com/auth/analytics.readonly"] },
  },
  google_sheets: {
    id: "google_sheets", name: "Google Sheets", category: "Productivity", color: "#0F9D58",
    desc: "Export analytics + content calendars to a sheet.",
    connectType: "oauth", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    oauth: { ...GOOGLE, scopes: ["https://www.googleapis.com/auth/spreadsheets"] },
  },
  slack: {
    id: "slack", name: "Slack", category: "Productivity", color: "#4A154B",
    desc: "Get lead + agent alerts in a channel.",
    connectType: "oauth", env: ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET"],
    oauth: {
      authorizeUrl: "https://slack.com/oauth/v2/authorize", tokenUrl: "https://slack.com/api/oauth.v2.access",
      scopes: ["chat:write", "channels:read", "incoming-webhook"],
      clientIdEnv: "SLACK_CLIENT_ID", clientSecretEnv: "SLACK_CLIENT_SECRET", docs: "https://api.slack.com/apps",
    },
  },
  notion: {
    id: "notion", name: "Notion", category: "Productivity", color: "#ffffff",
    desc: "Pull content briefs and ideas from a workspace.",
    connectType: "oauth", env: ["NOTION_CLIENT_ID", "NOTION_CLIENT_SECRET"],
    oauth: {
      authorizeUrl: "https://api.notion.com/v1/oauth/authorize", tokenUrl: "https://api.notion.com/v1/oauth/token",
      scopes: [], clientIdEnv: "NOTION_CLIENT_ID", clientSecretEnv: "NOTION_CLIENT_SECRET",
      docs: "https://developers.notion.com/docs/authorization", extra: { owner: "user" },
    },
  },
  discord: {
    id: "discord", name: "Discord", category: "Productivity", color: "#5865F2",
    desc: "Alerts + bot actions in your server.",
    connectType: "oauth", env: ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"],
    oauth: {
      authorizeUrl: "https://discord.com/oauth2/authorize", tokenUrl: "https://discord.com/api/oauth2/token",
      scopes: ["identify", "webhook.incoming"], clientIdEnv: "DISCORD_CLIENT_ID", clientSecretEnv: "DISCORD_CLIENT_SECRET",
      docs: "https://discord.com/developers/applications",
    },
  },
  mailchimp: {
    id: "mailchimp", name: "Mailchimp", category: "Email", color: "#FFE01B",
    desc: "Sync subscribers and campaign performance.",
    connectType: "api_key", env: ["MAILCHIMP_API_KEY"],
    keySetup: { label: "Mailchimp API key", docs: "https://mailchimp.com/help/about-api-keys/" },
  },
  zapier: {
    id: "zapier", name: "Zapier", category: "Automation", color: "#FF4F00",
    desc: "Connect 6,000+ apps via a Zapier webhook.",
    connectType: "webhook", env: [],
    keySetup: { label: "Zapier catch-hook URL", docs: "https://zapier.com/apps/webhook/integrations" },
  },
  webhook: {
    id: "webhook", name: "Webhooks", category: "Automation", color: "#a855f7",
    desc: "Push events to your own HTTPS endpoint.",
    connectType: "webhook", env: [],
    keySetup: { label: "Your webhook URL", docs: "https://en.wikipedia.org/wiki/Webhook" },
  },
};

export const TOOL_LIST = Object.values(TOOLS);

export function isToolConfigured(id: ToolId): boolean {
  const t = TOOLS[id];
  return t.env.every((k) => !!process.env[k]);
}
