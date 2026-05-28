# SociallyAI

> The AI-powered social media workspace built for the African creator economy.

**SociallyAI** shifts social media management from *automation* (doing what you tell it) to *delegation* (owning goals autonomously). Powered by self-hosted Gemma AI, it eliminates per-token API costs and gives Nigerian and African businesses a world-class tool priced for their market.

---

## What It Does

Most social media tools tell you what happened. SociallyAI tells you what will happen — and often handles it before you open the app.

| Feature | What it means |
|---|---|
| **Ghost Mode™ Agent** | Deploys an AI that replies to comments in your voice, flags leads, and escalates complaints. You only see what matters. |
| **ROI Pulse™** | Tracks the full funnel from post → click → landing page → revenue. Shows which posts actually made money. |
| **Trend-to-Draft Engine** | Monitors trending topics in your niche and pre-writes 3 draft options the moment a trend spikes. |
| **Predictive Socially Score** | Before you publish, AI predicts your engagement probability based on your history and current trends. |
| **Smart Inbox Triage** | Sorts all DMs and comments into Leads, Complaints, and Fluff — so you spend 2 minutes on the 4 messages that matter. |
| **Auto-Plug Loop** | When a post hits your engagement threshold, AI drops your product/newsletter link automatically in a reply. |
| **Brand Voice from URL** | Paste your website URL → AI extracts your tone, vocabulary, and messaging in 60 seconds. Zero setup friction. |
| **Psychological Frameworks** | Post with AIDA, PAS, Curiosity Hook, or Story Arc. Converts AI writing from "generic" to "converts". |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + custom animations |
| **UI Components** | Radix UI primitives + custom design system |
| **Animations** | Framer Motion |
| **Auth** | Supabase Auth (email/password + Google OAuth) |
| **Database** | Supabase (PostgreSQL + pgvector for AI memory) |
| **AI Engine** | Gemma 9B/27B via vLLM (self-hosted) |
| **Payments** | Paystack / Flutterwave |
| **Background Jobs** | BullMQ + Redis |
| **Real-time** | Supabase WebSockets |
| **Theme** | Light + Dark mode via next-themes |

---

## Project Structure

```
socially-ai/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with ThemeProvider
│   ├── globals.css                 # Tailwind v4 + CSS variables + animations
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth shell layout
│   │   ├── login/page.tsx          # Sign in
│   │   └── signup/page.tsx         # Create account
│   ├── auth/callback/route.ts      # Supabase OAuth callback
│   └── dashboard/
│       ├── layout.tsx              # Dashboard shell (collapsible sidebar)
│       ├── page.tsx                # Overview / analytics overview
│       ├── compose/page.tsx        # AI post composer
│       ├── calendar/page.tsx       # Content calendar
│       ├── inbox/page.tsx          # Smart inbox triage
│       ├── ghost-mode/page.tsx     # Ghost Mode agent control
│       ├── trends/page.tsx         # Trend predictor
│       ├── analytics/page.tsx      # Full analytics
│       └── settings/page.tsx       # Account settings
│
├── components/
│   ├── landing/                    # All landing page sections
│   │   ├── AnimatedBackground.tsx  # Blob / orb / grid effects
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ROIPulse.tsx
│   │   ├── Comparison.tsx
│   │   ├── Pricing.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   ├── dashboard/                  # Dashboard-specific components
│   │   ├── Sidebar.tsx
│   │   └── DashboardHeader.tsx
│   ├── ui/                         # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── progress.tsx
│   │   ├── separator.tsx
│   │   ├── avatar.tsx
│   │   └── select.tsx
│   └── providers/
│       └── ThemeProvider.tsx
│
├── lib/
│   ├── utils.ts                    # cn() utility
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts               # Server Supabase client
│
└── middleware.ts                   # Auth route protection
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/yourname/socially-ai.git
cd socially-ai
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase Auth

In your Supabase project:

1. Go to **Authentication → URL Configuration**
2. Add `http://localhost:3000/auth/callback` to **Redirect URLs**
3. Enable **Google** as an OAuth provider (optional)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pricing Model

| Tier | Price | Accounts | AI Engine | Key Feature |
|---|---|---|---|---|
| **Free** | ₦0/mo | 1 | Gemma 2B — 7 gen/week | Basic scheduling |
| **Basic** | ₦5,000/mo | 3 | Gemma 9B — 100 gen/mo | Brand Voice + Trends |
| **Pro** | ₦12,000/mo | 7 | Gemma 9B/27B — 500 gen/mo | Ghost Mode Agent + ROI Pulse |
| **Advanced** | ₦25,000/mo | 15+ | Full Suite — 1,000 gen/mo | 3 Agents + White-label reports |

**Why the pricing works:** SociallyAI self-hosts Gemma via vLLM, eliminating per-token API fees. This makes the ₦5k–₦25k range genuinely profitable while undercutting every USD-denominated competitor.

---

## Platform Roadmap

### Phase 1 — MVP
- X (Twitter), LinkedIn, Instagram

### Phase 2 — Growth
- TikTok, YouTube Shorts

### Phase 3 — The Local Edge
- WhatsApp Channels, Meta Threads

---

## AI Infrastructure

### Model Tiering

| Plan | Model | Purpose |
|---|---|---|
| Free | Gemma 2B | Lightweight captions, fast responses |
| Basic | Gemma 9B | High-quality creative content |
| Pro / Advanced | Gemma 27B | Complex threads, agents, memory |

### Architecture

```
[ Next.js Dashboard (React) ]
           │
   Supabase WebSockets (real-time)
           │
[ Next.js API Routes / Supabase ]
           │
    BullMQ + Redis (queue)
           │
[ Background Worker Service ]
           │
    vLLM (OpenAI-compatible API)
           │
[ Gemma 9B / 27B on GPU server ]
           │
[ X / LinkedIn / Instagram APIs ]
```

### Deploying Gemma via vLLM

```bash
pip install vllm
python -m vllm.entrypoints.openai.api_server \
  --model google/gemma-9b \
  --host 0.0.0.0 \
  --port 8000
```

Your vLLM server exposes `http://your-gpu-server:8000/v1/chat/completions` — compatible with any OpenAI SDK.

---

## Security

- Supabase Auth with JWT tokens — no passwords stored in app
- Row-Level Security (RLS) on all user data tables
- HTTPS-only in production
- Social OAuth via official provider SDKs only
- Rate limiting on all API routes
- No storage of social platform credentials — OAuth tokens only

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes
4. Open a Pull Request

---

## License

MIT License

---

Built with love in Nigeria for the African creator economy.
