const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const RED = "\x1b[31m";

// ── Required env vars ─────────────────────────────────────────────────────────
const REQUIRED_ENV: Record<string, string[]> = {
  always: ["AUTH_SECRET", "MONGODB_URI", "MONGODB_DB_NAME", "NEXT_PUBLIC_APP_URL"],
  creem: ["CREEM_API_KEY", "CREEM_WEBHOOK_SECRET"],
  google: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
  github: ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"],
};

export function checkEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV.always) {
    if (!process.env[key]) missing.push(key);
  }
  if (process.env.CREEM_API_KEY) {
    for (const key of REQUIRED_ENV.creem) {
      if (!process.env[key]) missing.push(key);
    }
  }
  if (process.env.AUTH_GOOGLE_ENABLED === "true") {
    for (const key of REQUIRED_ENV.google) {
      if (!process.env[key]) missing.push(key);
    }
  }
  if (process.env.AUTH_GITHUB_ENABLED === "true") {
    for (const key of REQUIRED_ENV.github) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`\n${RED}${BOLD}[env] Missing required environment variables:${RESET}`);
    for (const key of missing) {
      console.error(`  ${RED}✗ ${key}${RESET}`);
    }
    if (process.env.NODE_ENV === "production") {
      // Hard-fail in production so a broken deploy surfaces immediately
      throw new Error(`Missing required env vars: ${missing.join(", ")}`);
    } else {
      console.warn(`${YELLOW}[env] Continuing in dev mode — some features may not work.${RESET}\n`);
    }
  }
}

// ── Startup banner ────────────────────────────────────────────────────────────
export function printBanner() {
  checkEnv();

  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const env = process.env.NODE_ENV ?? "development";

  const envColor = env === "production" ? GREEN : env === "test" ? YELLOW : CYAN;
  const line = "─".repeat(50);

  console.log(`\n${BOLD}${BLUE}${line}${RESET}`);
  console.log(`${BOLD}  🚀 ${appName}${RESET}`);
  console.log(`${BLUE}${line}${RESET}`);
  console.log(`${DIM}  Environment  ${RESET}${envColor}${BOLD}${env}${RESET}`);
  console.log(`${DIM}  URL          ${RESET}${MAGENTA}${appUrl}${RESET}`);
  console.log(`${DIM}  Runtime      ${RESET}Node.js ${process.version}`);

  if (process.env.MONGODB_DB_NAME) {
    console.log(`${DIM}  Database     ${RESET}${process.env.MONGODB_DB_NAME}`);
  }

  const authProviders: string[] = [];
  if (process.env.AUTH_GOOGLE_ENABLED === "true") authProviders.push("Google");
  if (process.env.AUTH_GITHUB_ENABLED === "true") authProviders.push("GitHub");
  if (authProviders.length > 0) {
    console.log(`${DIM}  Auth         ${RESET}${authProviders.join(", ")}`);
  }

  if (process.env.CREEM_API_KEY) {
    const webhookOk = !!process.env.CREEM_WEBHOOK_SECRET;
    console.log(
      `${DIM}  Creem        ${RESET}enabled${
        webhookOk
          ? ` ${DIM}(webhook configured)${RESET}`
          : ` ${YELLOW}⚠ webhook secret missing${RESET}`
      }`
    );
  }

  console.log(`${BLUE}${line}${RESET}\n`);
}
