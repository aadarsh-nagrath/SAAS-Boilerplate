# SaaS Boilerplate

A production-ready Next.js SaaS starter with auth, MongoDB, Creem payments, and shadcn/ui.

## Stack

- **Framework** — Next.js 15 (App Router, TypeScript)
- **UI** — shadcn/ui + Tailwind CSS v4
- **Auth** — NextAuth v5 (Google + GitHub OAuth, JWT sessions)
- **Database** — MongoDB via Mongoose
- **Payments** — Creem (subscriptions, webhooks)

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # Sign-in page (Google + GitHub)
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Navbar with avatar + sign out
│   │   └── dashboard/          # Protected dashboard with plan info
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   └── webhooks/creem/     # Creem webhook (subscription events)
│   ├── pricing/                # Pricing page (Free / Monthly / Yearly)
│   └── page.tsx                # Landing page
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── creem.ts                # Creem API client + webhook verifier
│   └── mongodb.ts              # Mongoose connection (cached)
├── models/
│   └── User.ts                 # User schema with plan/billing fields
└── middleware.ts               # Route protection
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

## Extending

- **Add a new OAuth provider** — import from `next-auth/providers/*` in `src/lib/auth.ts`
- **Add new plan tiers** — update the `plan` enum in `src/models/User.ts` and add products to `src/app/pricing/page.tsx`
- **Add email** — uncomment the email vars in `.env.example` and wire up Resend or similar
- **Add new protected routes** — add paths to the `protectedRoutes` array in `src/middleware.ts`
