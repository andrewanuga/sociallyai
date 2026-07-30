# Socially AI

> Your personal social agent — the AI-powered social workspace built for the African creator economy.

**Socially AI** shifts social media from *automation* (doing what you tell it) to *delegation* (owning goals autonomously). Powered by self-hosted **Llama 3.3 70B** via vLLM, it avoids per-token API fees and gives creators, clients, and marketers a world-class tool priced for their market.

---

## What it does

Most tools tell you what happened. Socially AI tells you what will — and often handles it before you open the app.

| Feature | What it means |
|---|---|
| **Create (AI chat)** | A per-user agent that drafts posts, threads, captions, and replies in your voice — with image/video/file uploads for context. |
| **Ghost Mode™ Agent** | Replies to surface-level comments in your voice, flags leads, escalates complaints. You only touch what matters. |
| **Tasks (LIFO stack)** | A last-in, first-out task stack that keeps the newest work front-of-mind. |
| **Scheduler** | A month calendar of everything scheduled across every connected account. |
| **Smart Inbox** | One tab per connected account; messages arrive as a stack, AI-triaged into leads / complaints / questions / fluff. |
| **Analytics** | Real per-post analytics with cross-post *referral* suggestions (creators) and per-campaign boards with improvement tips (marketers). |
| **Trends** | Live web-search trends for your niche/persona, each referred to the right connected account. |
| **Bots** | Real bots across connected accounts with a management system (assist vs. full-auto). |
| **Personalization** | The agent stores past messages, learns your tone, and mirrors how you write. |

---

## Supported platforms

**Publishing:** Instagram · YouTube · X (Twitter) · LinkedIn · Facebook · Threads · Snapchat · Reddit
**Messaging & bots:** Telegram · WhatsApp — manage bots, message/reply when away, schedule messages, and summarize flagged groups.
**Tools & analytics:** Google Calendar · Google Analytics · Google Sheets · Slack · Notion · Discord · Mailchimp · Zapier · Webhooks.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) · TypeScript |
| Styling | Tailwind CSS v4, CSS-variable theming (dark + blue-tinted light) |
| Motion | GSAP (cinematic hero + scroll reveals), Framer Motion |
| Auth & DB | Supabase (PostgreSQL + pgvector, RLS) |
| AI | Llama 3.3 70B via vLLM (OpenAI-compatible), mock fallback in dev |
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
    ├── social/{connect,callback}/[platform]   # per-platform OAuth / token
    ├── social/sync                            # pull posts + metrics
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

## Connecting platforms (production)

Each platform needs a registered developer app (most require review/approval).
- **OAuth callback:** `{APP_URL}/api/social/callback/<platform>`
- **Tools callback:** `{APP_URL}/api/tools/callback/<provider>`
- **Telegram/WhatsApp:** token-based — connect from **Integrations** by pasting a bot token / Cloud API token.

Once connected, hit **Sync now** (or run the sync worker on a cron/queue) to pull posts, metrics, inbox, and campaigns into the dashboard.

---

## AI model

Point `VLLM_SERVER_URL` at a self-hosted vLLM server **or** a hosted
OpenAI-compatible endpoint (Together, Groq, Fireworks, DeepInfra):

```bash
pip install vllm
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.3-70B-Instruct --host 0.0.0.0 --port 8000
```

Leave it empty in dev to use built-in mock responses.

---

## Pricing

| Tier | Price | Accounts | Highlights |
|---|---|---|---|
| Free | ₦0/mo | 1 | Scheduling + basic analytics |
| Basic | ₦5,000/mo | 3 | Brand Voice + Trends |
| Pro | ₦12,000/mo | 7 | Ghost Mode + ROI Pulse + Auto-Plug |
| Advanced | ₦25,000/mo | 15+ | 3 agents + white-label reports + API |

---

## Security & privacy

- Supabase Auth (JWT); Row-Level Security on every user table.
- OAuth tokens only — no social passwords stored.
- [Privacy Policy](/privacy) and [Terms of Service](/terms) are shipped in-app (required for platform app review).

---

## License

MIT · Built with care in Nigeria for the African creator economy.
