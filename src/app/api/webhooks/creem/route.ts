import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { paymentsConfig } from "@/config";
import type { CreemWebhookEvent } from "@/types";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-creem-signature") ?? "";

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as CreemWebhookEvent;
  await connectDB();

  switch (event.type) {
    case "subscription.active":
    case "subscription.renewed": {
      const { customer_email, customer_id, product_id, current_period_end } = event.data;
      const plan = product_id === paymentsConfig.creem.products.yearly ? "yearly" : "monthly";
      await User.findOneAndUpdate(
        { email: customer_email },
        {
          creemCustomerId: customer_id,
          plan,
          planStatus: "active",
          planExpiresAt: current_period_end ? new Date(current_period_end * 1000) : undefined,
        }
      );
      break;
    }
    case "subscription.cancelled":
    case "subscription.expired": {
      await User.findOneAndUpdate(
        { email: event.data.customer_email },
        { plan: "free", planStatus: "cancelled", planExpiresAt: null }
      );
      break;
    }
    case "subscription.past_due": {
      await User.findOneAndUpdate(
        { email: event.data.customer_email },
        { planStatus: "past_due" }
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
