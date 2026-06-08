import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  emailVerified?: Date;
  // Creem billing
  creemCustomerId?: string;
  plan: "free" | "monthly" | "yearly";
  planStatus: "active" | "inactive" | "cancelled" | "past_due";
  planExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    emailVerified: { type: Date },
    creemCustomerId: { type: String },
    plan: { type: String, enum: ["free", "monthly", "yearly"], default: "free" },
    planStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled", "past_due"],
      default: "inactive",
    },
    planExpiresAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ creemCustomerId: 1 }, { sparse: true });

export const User = models.User || model<IUser>("User", UserSchema);
