export async function register() {
  // Sentry — runs in all runtimes
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const { initSentry } = await import("./lib/sentry");
    initSentry();
  }

  // Node-only: env preflight + startup banner
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { printBanner } = await import("./instrumentation.node");
    printBanner();
  }
}
