import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_ROUTES, AUTH_ROUTES, ROUTES } from "@/constants";

// ── In-process rate limiter (per-IP, sliding window) ─────────────────────────
// Shared across requests in the same function instance via module-level Map.
// Good enough for single-instance dev and small production deployments.
// Swap for Upstash Redis if you need multi-region rate limiting.
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
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  return res;
}

export default auth((req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!(req as { auth?: unknown }).auth;

  // Rate-limit API routes and auth endpoints
  const isApiOrAuth =
    nextUrl.pathname.startsWith("/api/") ||
    nextUrl.pathname.startsWith("/login");

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

  const isProtected = PROTECTED_ROUTES.some((r) =>
    nextUrl.pathname.startsWith(r)
  );
  const isAuthRoute = AUTH_ROUTES.some((r) =>
    nextUrl.pathname.startsWith(r)
  );

  if (isProtected && !isLoggedIn) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL(ROUTES.login, nextUrl))
    );
  }

  if (isAuthRoute && isLoggedIn) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL(ROUTES.dashboard, nextUrl))
    );
  }

  return applySecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
