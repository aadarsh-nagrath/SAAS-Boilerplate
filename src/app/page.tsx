import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { appConfig } from "@/config";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: appConfig.name,
  description: appConfig.description,
};

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <h1 className="text-5xl font-bold mb-4">{appConfig.name}</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        {appConfig.description}
      </p>
      <div className="flex gap-3">
        {session ? (
          <Link href={ROUTES.dashboard} className={cn(buttonVariants())}>
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link href={ROUTES.login} className={cn(buttonVariants())}>
              Get Started
            </Link>
            <Link href={ROUTES.pricing} className={cn(buttonVariants({ variant: "outline" }))}>
              View Pricing
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
