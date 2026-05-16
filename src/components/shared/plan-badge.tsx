import { Badge } from "@/components/ui/badge";
import type { UserPlan, PlanStatus } from "@/types";

interface PlanBadgeProps {
  plan: UserPlan;
  status: PlanStatus;
}

export function PlanBadge({ plan, status }: PlanBadgeProps) {
  const isActive = status === "active";
  const label = plan === "free" ? "Free" : `${plan} · ${status}`;

  return (
    <Badge variant={isActive ? "default" : "secondary"} className="capitalize">
      {label}
    </Badge>
  );
}
