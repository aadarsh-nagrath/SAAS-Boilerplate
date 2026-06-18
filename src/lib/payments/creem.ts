import { paymentsConfig } from "@/config";
import type { CheckoutSession } from "@/types";

const { apiBase } = paymentsConfig.creem;

function getApiKey(): string {
  const key = process.env.CREEM_API_KEY;
  if (!key) {
    throw new Error(
      "CREEM_API_KEY is not set — required to call the Creem API."
    );
  }
  return key;
}

async function creemFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "x-api-key": getApiKey(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Creem API ${res.status}: ${error}`);
  }

  return res.json() as Promise<T>;
}

export async function createCheckoutSession(params: {
  productId: string;
  customerEmail: string;
  customerId?: string;
  successUrl: string;
}): Promise<CheckoutSession> {
  return creemFetch<CheckoutSession>("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      product_id: params.productId,
      customer_email: params.customerEmail,
      customer_id: params.customerId,
      success_url: params.successUrl,
    }),
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await creemFetch(`/subscriptions/${subscriptionId}/cancel`, { method: "POST" });
}

