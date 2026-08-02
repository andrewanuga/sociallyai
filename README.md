# Socially AI

> Your personal social agent — the AI-powered social workspace built for the African creator economy.

**Socially AI** shifts social media from *automation* (doing what you tell it) to *delegation* (owning goals autonomously). Powered by self-hosted **Llama 3.3 70B** via vLLM, it avoids per-token API fees and gives creators, clients, and marketers a world-class tool priced for their market.

---

## What it does

Most tools tell you what happened. Socially AI tells you what will — and often handles it before you open the app.

| Feature | What it means |
|---|---|
| **Create (AI chat)** | A per-user agent that drafts posts, threads, captions, and replies in your voice — with image/video/file uploads for context. |
| **Agentic Loop** | Our AI runs a full ReAct loop. Before it answers, it can autonomously use tools to fetch weather, scrape URLs, and fact-check claims. |
| **Premium Tools** | The agent has 11 native tools: `schedule_post`, `analyze_competitor`, `repurpose_longform`, `verify_claim`, `fetch_unread_messages`, and more. |
| **Ghost Mode™ Agent** | Replies to surface-level comments in your voice, flags leads, escalates complaints. You only touch what matters. |
| **Tasks (LIFO stack)** | A last-in, first-out task stack that keeps the newest work front-of-mind. |
| **Scheduler** | A month calendar of everything scheduled across every connected account. |
| **Smart Inbox** | One tab per connected account; messages arrive as a stack, AI-triaged into leads / complaints / questions / fluff. |
| **Analytics** | Real per-post analytics with cross-post *referral* suggestions (creators) and per-campaign boards with improvement tips (marketers). |
| **Collaboration** | Multi-seat workspaces with Row-Level Security (RLS). Invite your team to manage specific accounts. |
| **Trends** | Live web-search trends for your niche/persona, each referred to the right connected account. |
| **Bots** | Real bots across connected accounts with a management system (assist vs. full-auto). |
| **Personalization** | The agent stores past messages, learns your tone, and mirrors how you write. |

---

## Supported platforms

**Publishing:** Instagram · YouTube · X (Twitter) · Facebook · Threads 
*(Coming Soon: LinkedIn · Snapchat · Reddit)*

**Messaging & bots:** Telegram 
*(Coming Soon: WhatsApp)*

**Tools & analytics (Coming Soon):** Google Calendar · Google Analytics · Google Sheets · Slack · Notion · Discord · Mailchimp · Zapier · Webhooks.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) · TypeScript |
| Styling | Tailwind CSS v4, CSS-variable theming (dark + blue-tinted light) |
| Motion | GSAP (cinematic hero + scroll reveals), Framer Motion |
| Auth & DB | Supabase (PostgreSQL + pgvector, RLS) |
| AI | OpenRouter (200+ models: GPT-4o, Claude, Gemini, Llama, etc.) |
| Payments | Paystack / Flutterwave |
| Jobs | BullMQ + Redis |

---

## Project structure

```
app/
├── page.tsx                       # Cinematic landing (canvas scroll hero)
├── (auth)/{login,signup}          # Auth
├── onboarding/                    # Persona onboarding (client/creator/marketer)
├── privacy/ · terms/              # Privacy Policy + Terms of Service
├── dashboard/                     # Overview, Create, Tasks, Scheduler, Inbox,
│                                  #   Analytics, Trends, Bots, Ghost Mode,
│                                  #   Integrations, Billing, Settings
└── api/
    ├── ai/{chat,generate,score,trends,ghost}
    ├── social/{connect,callback}/[platform]   # Dynamic per-platform OAuth / token
    ├── social/sync                            # Dynamic Sync Worker & Scraper fallbacks
    └── tools/{connect,callback}/[provider]    # calendar/analytics/tools OAuth

lib/social/{platforms,tools,types,sync}.ts     # registries + sync worker
supabase/schema.sql                            # core (profiles, posts, etc.)
supabase/social_integration_schema.sql         # ALL social-integration tables
```

---

## Getting started

### 1. Install
```bash
npm install
```

### 2. Environment
```bash
cp .env.local.example .env.local
```
Only Supabase is required for local dev. AI falls back to mocks, and each
integration activates only once its keys are present. See the commented
`.env.local.example` for every provider.

### 3. Database
Run the SQL files in the Supabase SQL editor, in order:
1. `supabase/schema.sql`
2. `supabase/social_integration_schema.sql`
3. `supabase/support.sql`

Then add `http://localhost:3000/auth/callback` to **Authentication → URL Configuration → Redirect URLs**.

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000

---

## Connecting platforms & Data Sync

Each platform needs a registered developer app (most require review/approval).
- **OAuth callback:** `{APP_URL}/api/social/callback/<platform>`
- **Tools callback:** `{APP_URL}/api/tools/callback/<provider>`
- **Telegram:** token-based — connect from **Integrations** by pasting a bot token.

### Robust Sync & Scrape Engine
Socially AI uses a dual-engine architecture to fetch metrics:
1. **API Primary:** Attempts to fetch deep metrics directly from native APIs (Graph API for FB/IG, YouTube Data API, etc.)
2. **Web Scraper Fallback:** If the API fails (e.g. personal profiles, missing scope, expired tokens), our custom-built Node scraping engine uses the user's `@handle` (collected securely via OAuth Modals) to parse public subscriber/follower counts seamlessly from the web!

Once connected, a silent background sync triggers automatically when the user visits the Dashboard to ensure follower counts and recent posts are always perfectly up-to-date.

---

## AI model

Socially AI uses **OpenRouter** to access 200+ AI models. Each agent
(Create, Ghost Mode, Trends, Scoring) can use a different model,
and users choose their preferred model in **Settings → AI**.

### Setup

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Create an API key at [openrouter.ai/keys](https://openrouter.ai/keys)
3. Add to your `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
OPENROUTER_DEFAULT_MODEL=google/gemini-2.5-flash
```

### Recommended models

| Tier | Model | Best for |
|------|-------|----------|
| Free | `google/gemini-2.0-flash-exp:free` | Testing, zero cost |
| Budget | `deepseek/deepseek-chat-v3-0324` | Extremely cheap, solid quality |
| Standard | `google/gemini-2.5-flash` | Fast + affordable (default) |
| Premium | `anthropic/claude-sonnet-4` | Best writing quality |
| Premium | `openai/gpt-4o` | Best multimodal/vision |

### Per-agent personalization

Each AI agent is tuned for its task:
- **Create Agent** — higher creativity (temp 0.7), vision-capable
- **Content Generator** — structured output (temp 0.8), framework-aware
- **Ghost Mode** — conservative (temp 0.4), JSON output
- **Content Scorer** — analytical (temp 0.3), JSON output
- **Trend Analyst** — creative + contextual (temp 0.7)

Leave `OPENROUTER_API_KEY` empty in dev to use built-in mock responses.

---

## Security & privacy

- Supabase Auth (JWT); Row-Level Security on every user table.
- OAuth tokens only — no social passwords stored.
- Secure, HTTP-Only Cookie Session management during OAuth redirects.
- [Privacy Policy](/privacy) and [Terms of Service](/terms) are shipped in-app (required for platform app review).

---

## License

MIT · Built with care in Nigeria for the African creator economy.
