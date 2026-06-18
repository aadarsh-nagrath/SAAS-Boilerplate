import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyWebhookSignature } from "@/lib/payments";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ProcessedWebhookEvent } from "@/models/ProcessedWebhookEvent";
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

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Records the event as processed. Returns false if it was already recorded
 * (duplicate delivery). Backed by a unique index, so this is atomic and works
 * across serverless instances — unlike an in-memory set.
 */
async function claimEvent(eventId: string): Promise<boolean> {
  try {
    await ProcessedWebhookEvent.create({
      eventId,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    });
    return true;
  } catch (err: unknown) {
    // Duplicate key => already processed.
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000) {
      return false;
    }
    throw err;
  }
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

  try {
    await connectDB();

    if (!(await claimEvent(event.id))) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Normalize so casing/whitespace differences don't silently miss the user.
    const email = event.data.customer_email.toLowerCase().trim();
    let result: { matchedCount: number } | null = null;

    switch (event.type) {
      case "subscription.active":
      case "subscription.renewed": {
        const { customer_id, product_id, subscription_id, current_period_end } =
          event.data;
        const plan =
          product_id === paymentsConfig.creem.products.yearly ? "yearly" : "monthly";
        result = await User.updateOne(
          { email },
          {
            creemCustomerId: customer_id,
            creemSubscriptionId: subscription_id,
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
        result = await User.updateOne(
          { email },
          {
            plan: "free",
            planStatus: "cancelled",
            planExpiresAt: null,
            creemSubscriptionId: null,
          }
        );
        break;
      }
      case "subscription.past_due": {
        result = await User.updateOne({ email }, { planStatus: "past_due" });
        break;
      }
    }

    // A real payment event that matches no user is a data-integrity problem
    // we want surfaced, not swallowed behind a 200.
    if (result && result.matchedCount === 0) {
      console.error(
        `[creem-webhook] No user matched for ${event.type} (event ${event.id}, email ${email})`
      );
    }
  } catch (err) {
    console.error("[creem-webhook] DB error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
