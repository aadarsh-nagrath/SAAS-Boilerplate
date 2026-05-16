"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createCheckoutSession, cancelSubscription } from "@/lib/payments";
import { appConfig } from "@/config";
import { ROUTES } from "@/constants";

export async function startCheckout(productId: string) {
  const session = await auth();
  if (!session?.user?.email) redirect(ROUTES.login);

  const checkout = await createCheckoutSession({
    productId,
    customerEmail: session.user.email,
    successUrl: `${appConfig.url}${ROUTES.dashboard}?upgraded=true`,
  });

  redirect(checkout.url);
}

export async function cancelPlan(subscriptionId: string) {
  const session = await auth();
  if (!session?.user) redirect(ROUTES.login);

  await cancelSubscription(subscriptionId);
  redirect(ROUTES.dashboard);
}
