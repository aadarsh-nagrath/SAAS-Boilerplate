const CREEM_API_KEY = process.env.CREEM_API_KEY!;
const CREEM_API_BASE = "https://api.creem.io/v1";

async function creemFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${CREEM_API_BASE}${path}`, {
    ...options,
    headers: {
      "x-api-key": CREEM_API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Creem API error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function createCheckoutSession({
  productId,
  customerId,
  customerEmail,
  successUrl,
}: {
  productId: string;
  customerId?: string;
  customerEmail: string;
  successUrl: string;
}) {
  return creemFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      customer_id: customerId,
      customer_email: customerEmail,
      success_url: successUrl,
    }),
  });
}

export async function getCustomerSubscriptions(customerId: string) {
  return creemFetch(`/subscriptions?customer_id=${customerId}`);
}

export async function cancelSubscription(subscriptionId: string) {
  return creemFetch(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
  });
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const secret = process.env.CREEM_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return expected === signature;
}
