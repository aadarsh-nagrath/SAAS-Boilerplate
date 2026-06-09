// Creem test keys (creem_test_…) only work against the test API host.
// Auto-pick the base URL from the key prefix so test creds don't hit prod.
const isTestKey = (process.env.CREEM_API_KEY ?? "").startsWith("creem_test_");

export const paymentsConfig = {
  creem: {
    isTest: isTestKey,
    apiBase: isTestKey
      ? "https://test-api.creem.io/v1"
      : "https://api.creem.io/v1",
    webhookUrl: process.env.CREEM_WEBHOOK_URL ?? "",
    products: {
      monthly: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_MONTHLY ?? "",
      yearly: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_YEARLY ?? "",
    },
  },
} as const;
