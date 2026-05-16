import type { DefaultSession } from "next-auth";

export type UserPlan = "free" | "monthly" | "yearly";
export type PlanStatus = "active" | "inactive" | "cancelled" | "past_due";

export interface UserSubscription {
  plan: UserPlan;
  planStatus: PlanStatus;
  planExpiresAt?: Date;
  creemCustomerId?: string;
}

// Extend NextAuth session with app-specific fields
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}
