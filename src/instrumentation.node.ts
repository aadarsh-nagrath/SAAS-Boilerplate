export function printBanner() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const env = process.env.NODE_ENV ?? "development";

  const RESET = "\x1b[0m";
  const BOLD = "\x1b[1m";
  const DIM = "\x1b[2m";
  const CYAN = "\x1b[36m";
  const GREEN = "\x1b[32m";
  const YELLOW = "\x1b[33m";
  const BLUE = "\x1b[34m";
  const MAGENTA = "\x1b[35m";

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
    const webhookConfigured = !!process.env.CREEM_WEBHOOK_SECRET;
    console.log(`${DIM}  Creem        ${RESET}enabled${webhookConfigured ? ` ${DIM}(webhook configured)${RESET}` : ` ${YELLOW}⚠ webhook secret missing${RESET}`}`);
  }

  console.log(`${BLUE}${line}${RESET}\n`);
}
