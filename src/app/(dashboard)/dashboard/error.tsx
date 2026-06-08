"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
      <p className="text-muted-foreground text-sm max-w-sm">
        Something went wrong loading your dashboard. Please try again.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
      )}
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
