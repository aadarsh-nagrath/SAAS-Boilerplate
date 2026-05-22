export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { printBanner } = await import("./instrumentation.node");
  printBanner();
}
