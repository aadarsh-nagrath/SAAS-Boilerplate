# SaaS Boilerplate

A production-ready, modular Next.js SaaS starter with auth, MongoDB, Creem payments, and shadcn/ui.

## Stack

- **Framework** — Next.js 16 (App Router, TypeScript)
- **UI** — shadcn/ui + Tailwind CSS v4
- **Auth** — NextAuth v5 (Google + GitHub OAuth, JWT sessions, flag-gated)
- **Database** — MongoDB via Mongoose
- **Payments** — Creem (subscriptions, webhooks, HMAC-verified)

## Project Structure

```
src/
├── actions/                    # Server actions (never imported by client directly)
│   ├── auth.ts                 # signInWithGoogle, signInWithGitHub, signOutUser
│   ├── payments.ts             # startCheckout, cancelPlan
│   └── index.ts
│
├── app/                        # Routing only — no business logic here
│   ├── (auth)/login/           # Sign-in page
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Auth-gated layout with Navbar
│   │   └── dashboard/          # User dashboard
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth route handler
│   │   └── webhooks/creem/     # Creem subscription webhook
│   ├── pricing/                # Public pricing page
│   └── page.tsx                # Landing page
│
├── components/
│   ├── shared/                 # App-level reusable components
│   │   ├── navbar.tsx          # Authenticated top nav
│   │   ├── auth-buttons.tsx    # Provider-gated sign-in buttons
│   │   └── plan-badge.tsx      # Plan + status display badge
│   └── ui/                     # shadcn/ui primitives (do not edit)
│
├── config/                     # All env vars and feature flags in one place
│   ├── app.ts                  # App name, URL, description
│   ├── auth.ts                 # Provider enable flags
│   ├── payments.ts             # Creem API base + product IDs
│   └── index.ts
│
├── constants/                  # Static app-wide values
│   ├── plans.ts                # PLANS array (id, price, features, productId)
│   ├── routes.ts               # ROUTES, PROTECTED_ROUTES, AUTH_ROUTES
│   └── index.ts
│
├── hooks/                      # Client-side React hooks
│   ├── use-session.ts          # Thin wrapper around next-auth/react useSession
│   ├── use-toast.ts            # Typed toast helpers via sonner
│   └── index.ts
│
├── lib/                        # Pure infrastructure — no app logic
│   ├── auth/
│   │   ├── config.ts           # NextAuth provider + callback config
│   │   └── index.ts            # Exports: handlers, auth, signIn, signOut
│   ├── db/
│   │   ├── connection.ts       # Cached Mongoose connection
│   │   ├── adapter.ts          # MongoDBAdapter for NextAuth
│   │   └── index.ts
│   ├── payments/
│   │   ├── creem.ts            # Creem API client (typed)
│   │   ├── webhook.ts          # HMAC signature verifier (timing-safe)
│   │   └── index.ts
│   └── utils.ts                # cn() helper
│
├── models/
│   └── User.ts                 # Mongoose User schema (plan, billing fields)
│
├── types/                      # Shared TypeScript types
│   ├── auth.ts                 # UserPlan, PlanStatus, UserSubscription + session augment
│   ├── payments.ts             # CreemWebhookEvent, CheckoutSession
│   └── index.ts
│
└── middleware.ts               # Route protection (reads from constants/routes)
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_NAME` | Your app name |
| `AUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `AUTH_GOOGLE_ENABLED` | Set to `true` to enable Google login |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_GITHUB_ENABLED` | Set to `true` to enable GitHub login |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Database name |
| `CREEM_API_KEY` | Creem API key |
| `CREEM_WEBHOOK_SECRET` | Creem webhook signing secret |
| `NEXT_PUBLIC_CREEM_PRODUCT_ID_MONTHLY` | Creem monthly product ID |
| `NEXT_PUBLIC_CREEM_PRODUCT_ID_YEARLY` | Creem yearly product ID |

### 3. Set up OAuth providers

Enable providers by setting the corresponding flag in `.env.local`. Only providers with `ENABLED=true` appear on the login page and are registered with NextAuth.

**Google** — [console.cloud.google.com](https://console.cloud.google.com)
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Set `AUTH_GOOGLE_ENABLED=true` + fill in `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`

**GitHub** — [github.com/settings/developers](https://github.com/settings/developers)
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
- Set `AUTH_GITHUB_ENABLED=true` + fill in `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`

### 4. Set up Creem

- Create an account at [creem.io](https://creem.io)
- Create two products (Monthly + Yearly) and copy their IDs
- Set the webhook endpoint to: `https://yourdomain.com/api/webhooks/creem`
- Copy the webhook signing secret

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/dashboard` | Protected user dashboard |
| `/pricing` | Pricing page with Creem checkout |
| `/api/auth/[...nextauth]` | NextAuth handler |
| `/api/webhooks/creem` | Creem subscription webhook |

## Creem Webhook Events

The webhook handler at `/api/webhooks/creem` handles:

- `subscription.active` / `subscription.renewed` — upgrades user plan
- `subscription.cancelled` / `subscription.expired` — reverts to free
- `subscription.past_due` — marks plan as past due

## Architecture Rules

| Layer | Rule |
|---|---|
| `app/` | Routing + page shells only. Import from `actions/`, `components/`, `lib/`, `config/` |
| `actions/` | Server actions only. All redirects and auth checks live here |
| `lib/` | Pure infrastructure. No Next.js page imports, no business logic |
| `config/` | Single source of truth for all env vars. Nothing reads `process.env` outside here (except `lib/db` and `lib/payments` for secrets) |
| `constants/` | Static values derived from config. No side effects |
| `components/shared/` | App-aware components (can use `auth`, `config`, `actions`) |
| `components/ui/` | shadcn primitives — never modify directly |
| `types/` | Types only — no runtime code |
| `hooks/` | Client-only (`"use client"`) hooks |

## Extending

**Add an OAuth provider**
1. Add `AUTH_<PROVIDER>_ENABLED`, `AUTH_<PROVIDER>_ID`, `AUTH_<PROVIDER>_SECRET` to `.env.example` and `.env.local`
2. Add the flag to `src/config/auth.ts`
3. Add the provider in `src/lib/auth/config.ts`
4. Add a server action in `src/actions/auth.ts`
5. Add a button in `src/components/shared/auth-buttons.tsx`

**Add a new plan tier**
1. Add a Creem product ID env var to `.env.example` + `src/config/payments.ts`
2. Add the tier to `UserPlan` in `src/types/auth.ts` and the Mongoose enum in `src/models/User.ts`
3. Add an entry to `PLANS` in `src/constants/plans.ts`

**Add a protected route**
1. Add the path to `PROTECTED_ROUTES` in `src/constants/routes.ts`

**Add email**
1. Uncomment email vars in `.env.example`
2. Create `src/lib/email/` with your provider client (e.g. Resend)
3. Call from `src/actions/`
