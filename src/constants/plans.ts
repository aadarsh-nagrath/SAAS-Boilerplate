import { paymentsConfig } from "@/config";
import type { UserPlan } from "@/types";

export interface PlanDefinition {
  id: UserPlan;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  productId: string | null;
  highlighted?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started for free",
    features: ["Feature 1", "Feature 2", "Feature 3"],
    productId: null,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "$9",
    period: "per month",
    description: "For individuals and small teams",
    features: ["Everything in Free", "Feature 4", "Feature 5", "Priority support"],
    productId: paymentsConfig.creem.products.monthly,
    highlighted: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$79",
    period: "per year",
    description: "Best value — 2 months free",
    features: ["Everything in Monthly", "Feature 6", "Feature 7", "Annual discount"],
    productId: paymentsConfig.creem.products.yearly,
  },
];
