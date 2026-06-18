"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createCheckoutSession, cancelSubscription } from "@/lib/payments";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { appConfig } from "@/config";
import { ROUTES } from "@/constants";

export async function startCheckout(productId: string) {
  const session = await auth();
  if (!session?.user?.email) redirect(ROUTES.login);

  const email = session.user.email.toLowerCase();
  await connectDB();
  const user = await User.findOne({ email }).lean();

  const checkout = await createCheckoutSession({
    productId,
    customerEmail: email,
    customerId: user?.creemCustomerId ?? undefined,
    successUrl: `${appConfig.url}${ROUTES.dashboard}?upgraded=true`,
  });

  redirect(checkout.url);
}

// Cancels the *current user's* subscription. The subscription id is looked up
// from their own record — never taken from the client — so a user can't cancel
// someone else's subscription (IDOR).
export async function cancelPlan() {
  const session = await auth();
  if (!session?.user?.email) redirect(ROUTES.login);

  await connectDB();
  const user = await User.findOne({ email: session.user.email.toLowerCase() })
    .select("creemSubscriptionId")
    .lean<{ creemSubscriptionId?: string }>();

  if (!user?.creemSubscriptionId) {
    throw new Error("No active subscription to cancel.");
  }

  await cancelSubscription(user.creemSubscriptionId);
  redirect(ROUTES.dashboard);
}
