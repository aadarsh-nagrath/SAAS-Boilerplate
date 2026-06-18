import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/edge";

// ── In-process rate limiter (per-IP, sliding window) ─────────────────────────
// NOTE: This Map lives in a single function instance. On serverless/Fluid
// Compute it is NOT shared across instances and resets on cold start, so it's
// best-effort throttling only — a speed bump, not a real limit. For enforced,
// multi-instance rate limiting use Upstash Redis or Vercel's WAF rate limiting.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;       // requests
const RATE_LIMIT_WINDOW = 60_000; // ms

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// ── Security headers ──────────────────────────────────────────────────────────
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  // Note: 'unsafe-inline' on style-src is kept for Tailwind/inline styles.
  // 'unsafe-eval' is intentionally NOT allowed. If you add a library that
  // needs eval (rare), prefer a nonce-based policy instead of re-enabling it.
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  return res;
}

// `auth()` evaluates the `authorized` callback in auth.config.ts for route
// protection, then runs this wrapper for rate limiting + security headers.
export default auth((req) => {
  const { nextUrl } = req as NextRequest & { nextUrl: NextRequest["nextUrl"] };

  const isApiOrAuth =
    nextUrl.pathname.startsWith("/api/") || nextUrl.pathname.startsWith("/login");

  if (isApiOrAuth) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Too many requests" }, { status: 429 })
      );
    }
  }

  return applySecurityHeaders(NextResponse.next());
});

export const config = {
  // Skip Next internals and the auth API (NextAuth handles its own routing).
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
