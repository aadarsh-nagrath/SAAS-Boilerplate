import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <h1 className="text-5xl font-bold mb-4">
        {process.env.NEXT_PUBLIC_APP_NAME}
      </h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        Your SaaS description goes here. Replace this with your value proposition.
      </p>
      <div className="flex gap-3">
        {session ? (
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className={cn(buttonVariants())}>
              Get Started
            </Link>
            <Link href="/pricing" className={cn(buttonVariants({ variant: "outline" }))}>
              View Pricing
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
