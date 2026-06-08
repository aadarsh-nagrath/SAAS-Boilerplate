"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/actions";

export function CheckoutButton({ productId, label }: { productId: string; label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(() => startCheckout(productId))}
    >
      {pending ? "Redirecting…" : label}
    </Button>
  );
}
