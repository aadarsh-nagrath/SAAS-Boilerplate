import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/creem";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-creem-signature") ?? "";

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);
  await connectDB();

  switch (event.type) {
    case "subscription.active":
    case "subscription.renewed": {
      const { customer_email, customer_id, product_id, current_period_end } =
        event.data;
      const plan =
        product_id === process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_YEARLY
          ? "yearly"
          : "monthly";
      await User.findOneAndUpdate(
        { email: customer_email },
        {
          creemCustomerId: customer_id,
          plan,
          planStatus: "active",
          planExpiresAt: new Date(current_period_end * 1000),
        }
      );
      break;
    }
    case "subscription.cancelled":
    case "subscription.expired": {
      const { customer_email } = event.data;
      await User.findOneAndUpdate(
        { email: customer_email },
        { plan: "free", planStatus: "cancelled", planExpiresAt: null }
      );
      break;
    }
    case "subscription.past_due": {
      const { customer_email } = event.data;
      await User.findOneAndUpdate(
        { email: customer_email },
        { planStatus: "past_due" }
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
