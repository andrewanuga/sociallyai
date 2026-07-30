import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, noteViolation, isBlocked, refreshBlocklist, logSecurityEvent } from "@/lib/security/ratelimit";

/** Security headers applied to every response. */
function harden(res: NextResponse): NextResponse {
  const h = res.headers;
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-Frame-Options", "SAMEORIGIN");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("X-DNS-Prefetch-Control", "off");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  h.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return res;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = clientIp(request);

  // ── 1. Block enforcement ──────────────────────────────────
  await refreshBlocklist();
  if (isBlocked(ip)) {
    return harden(new NextResponse("Access denied.", { status: 403 }));
  }

  // ── 2. Rate limiting (per IP) ─────────────────────────────
  // Tighter limits on API + auth surfaces; a generous global cap otherwise.
  const isApi = pathname.startsWith("/api");
  const isAuthApi = pathname.startsWith("/api/ai") || pathname.startsWith("/api/support") || pathname.startsWith("/api/billing");
  const [limit, windowMs] = isAuthApi ? [20, 60_000] : isApi ? [60, 60_000] : [200, 60_000];
  const rl = rateLimit(`${ip}:${isApi ? "api" : "web"}`, limit, windowMs);
  if (!rl.ok) {
    const blockedNow = noteViolation(ip);
    logSecurityEvent({ type: blockedNow ? "ip_blocked" : "rate_limited", ip, path: pathname, severity: blockedNow ? "critical" : "warning", detail: `Rate limit exceeded (${limit}/min)` });
    return harden(new NextResponse(JSON.stringify({ error: "Too many requests. Slow down." }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) },
    }));
  }

  // ── 3. Supabase auth (with fail-safe timeout) ─────────────
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("auth-timeout")), 2500));
    const result = await Promise.race([supabase.auth.getUser(), timeout]);
    user = result.data.user;
  } catch { user = null; }

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");

  // Dashboard + admin require a session; admin additionally requires is_admin.
  if ((isDashboardRoute || isAdminRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return harden(NextResponse.redirect(url));
  }
  if (isAdminRoute && user) {
    const { data: profile } = await supabase.from("profiles").select("is_admin, suspended").eq("id", user.id).single();
    if (!profile?.is_admin) {
      logSecurityEvent({ type: "admin_denied", ip, path: pathname, severity: "warning", user_id: user.id, email: user.email });
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return harden(NextResponse.redirect(url));
    }
  }
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return harden(NextResponse.redirect(url));
  }

  return harden(supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
