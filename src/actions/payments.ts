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

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();

  const checkout = await createCheckoutSession({
    productId,
    customerEmail: session.user.email,
    customerId: user?.creemCustomerId ?? undefined,
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
