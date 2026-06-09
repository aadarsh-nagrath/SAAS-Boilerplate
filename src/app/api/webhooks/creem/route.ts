import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyWebhookSignature } from "@/lib/payments";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { paymentsConfig } from "@/config";

// ── Zod schema ────────────────────────────────────────────────────────────────
const CreemEventDataSchema = z.object({
  customer_email: z.string().email(),
  customer_id: z.string(),
  product_id: z.string(),
  subscription_id: z.string(),
  current_period_end: z.number().optional(),
});

const CreemWebhookSchema = z.object({
  id: z.string(),
  type: z.enum([
    "subscription.active",
    "subscription.renewed",
    "subscription.cancelled",
    "subscription.expired",
    "subscription.past_due",
  ]),
  data: CreemEventDataSchema,
});

// ── In-memory idempotency set (evicts after 24h) ──────────────────────────────
const processedEvents = new Map<string, number>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

function isDuplicate(eventId: string): boolean {
  const now = Date.now();
  // Evict expired entries
  for (const [id, ts] of processedEvents) {
    if (now - ts > IDEMPOTENCY_TTL) processedEvents.delete(id);
  }
  if (processedEvents.has(eventId)) return true;
  processedEvents.set(eventId, now);
  return false;
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("creem-signature") ?? "";

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreemWebhookSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const event = parsed.data;

  if (isDuplicate(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await connectDB();

    switch (event.type) {
      case "subscription.active":
      case "subscription.renewed": {
        const { customer_email, customer_id, product_id, current_period_end } = event.data;
        const plan =
          product_id === paymentsConfig.creem.products.yearly ? "yearly" : "monthly";
        await User.findOneAndUpdate(
          { email: customer_email },
          {
            creemCustomerId: customer_id,
            plan,
            planStatus: "active",
            planExpiresAt: current_period_end
              ? new Date(current_period_end * 1000)
              : undefined,
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
  } catch (err) {
    console.error("[creem-webhook] DB error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
