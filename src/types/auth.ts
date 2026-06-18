import type { DefaultSession } from "next-auth";
// Imported so the `next-auth/jwt` module is resolvable for augmentation below.
import "next-auth/jwt";

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
      plan?: UserPlan;
      planStatus?: PlanStatus;
    };
  }
}

// Extend the JWT with the plan fields we cache on the token (see jwt callback).
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    plan?: UserPlan;
    planStatus?: PlanStatus;
  }
}
