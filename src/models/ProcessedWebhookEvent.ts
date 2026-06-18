import mongoose, { Schema, model, models } from "mongoose";

// Records Creem webhook event IDs we've already handled, so retries /
// duplicate deliveries are idempotent across serverless instances.
// The unique index on `eventId` is the real guard; documents auto-expire
// after the TTL so the collection stays small.
export interface IProcessedWebhookEvent {
  _id: mongoose.Types.ObjectId;
  eventId: string;
  expiresAt: Date;
  createdAt: Date;
}

const ProcessedWebhookEventSchema = new Schema<IProcessedWebhookEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ProcessedWebhookEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ProcessedWebhookEvent =
  models.ProcessedWebhookEvent ||
  model<IProcessedWebhookEvent>(
    "ProcessedWebhookEvent",
    ProcessedWebhookEventSchema
  );
