import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { authConfig } from "@/config";
import { PROTECTED_ROUTES, AUTH_ROUTES, ROUTES } from "@/constants";

// ── Edge-safe base config ─────────────────────────────────────────────────────
// This file contains ONLY what can run in the (edge/proxy) runtime: OAuth
// providers, callbacks, and route-authorization logic. It must NOT import the
// MongoDB adapter, Mongoose models, bcrypt, or nodemailer — those are Node-only
// and live in `./config.ts`, which is used by the API route handler.
//
// The proxy imports `auth` built from THIS config so it stays lean and doesn't
// open a database connection on every matched request.

const providers: NextAuthConfig["providers"] = [];

if (authConfig.providers.google) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (authConfig.providers.github) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

export const baseAuthConfig = {
  providers,
  session: authConfig.session,
  pages: authConfig.pages,
  callbacks: {
    // Route protection, evaluated by the proxy. Returning false redirects to
    // the sign-in page; redirecting away from auth pages when already signed in.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));
      const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));

      if (isProtected && !isLoggedIn) return false;
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL(ROUTES.dashboard, nextUrl));
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id;

      // Enrich the token with plan data on sign-in and when the client calls
      // `update()`. Imported lazily so this file stays edge-safe; the jwt
      // callback only runs in the Node API route, never in the proxy.
      if (user || trigger === "update") {
        const { connectDB } = await import("@/lib/db");
        const { User } = await import("@/models/User");
        await connectDB();
        const dbUser = await User.findById(token.id)
          .select("plan planStatus")
          .lean<{
            plan?: import("@/types").UserPlan;
            planStatus?: import("@/types").PlanStatus;
          }>();
        if (dbUser) {
          token.plan = dbUser.plan;
          token.planStatus = dbUser.planStatus;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.plan = token.plan;
        session.user.planStatus = token.planStatus;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
