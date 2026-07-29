---
name: preview-rendering-gotchas
description: Two environment gotchas when building/verifying this Next.js app offline in the in-app preview
metadata:
  type: reference
---

Verifying this app in the sandbox preview has two non-obvious traps (both cost real time once):

1. **`next/font/google` fails offline.** It fetches font files at build/dev time; with no network the root layout throws (`TypeError: fetch failed`) and the page never hydrates. Load extra fonts (Inter, JetBrains Mono) via a plain `<link>` to Google Fonts CSS with local fallbacks instead — see `app/layout.tsx` / `--font-inter` in `app/globals.css`. Geist/Geist_Mono stay on next/font only because they were cached from an online session.

2. **The preview pane freezes `requestAnimationFrame`.** When the Browser pane isn't displayed, `document.hidden === true` and rAF callbacks never fire. React 19 reveals streamed Suspense boundaries via `requestAnimationFrame`, so large pages (which stream through a hidden `<div id="S:0">`) never reveal, `main` stays 0-height, and no effects run — even though the HTML is complete and correct. Small pages render inline and hydrate fine, which is misleading. **Verify via `npx next build` (checks SSR/prerender) instead of trusting the hidden-pane runtime.** Canvas/GSAP scroll animations also need a visible tab.

Also: `proxy.ts` middleware calls `supabase.auth.getUser()` on every route; offline it retries (`AuthRetryableFetchError`) and can stall SSR. It now has a 2.5s timeout + fail-closed fallback. Related: [[socially-ai-landing-rebuild]] if that memory exists.
