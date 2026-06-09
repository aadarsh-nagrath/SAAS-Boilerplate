import mongoose, { Schema, model, models } from "mongoose";

// A short-lived password-reset token. The raw token is emailed to the user;
// only its SHA-256 hash is stored here. Documents auto-expire via TTL.
export interface IPasswordResetToken {
  _id: mongoose.Types.ObjectId;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL: Mongo removes the doc once `expiresAt` passes.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken =
  models.PasswordResetToken ||
  model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);
