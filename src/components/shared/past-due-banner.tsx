import Link from "next/link";
import { ROUTES } from "@/constants";

export function PastDueBanner() {
  return (
    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm flex items-center justify-between">
      <span>
        Your payment is past due — features may be restricted soon.
      </span>
      <Link
        href={ROUTES.pricing}
        className="font-medium underline underline-offset-2 hover:opacity-80 ml-4 shrink-0"
      >
        Update payment →
      </Link>
    </div>
  );
}
