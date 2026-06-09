import mongoose, { Schema, model, models } from "mongoose";

// A short-lived email-verification code used during credentials sign-up.
// The `codeHash` is a bcrypt hash — we never store the raw 6-digit code.
// Documents auto-expire via a TTL index on `expiresAt`.
export interface IVerificationCode {
  _id: mongoose.Types.ObjectId;
  email: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VerificationCodeSchema.index({ email: 1 });
// TTL: Mongo removes the doc once `expiresAt` passes.
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationCode =
  models.VerificationCode ||
  model<IVerificationCode>("VerificationCode", VerificationCodeSchema);
