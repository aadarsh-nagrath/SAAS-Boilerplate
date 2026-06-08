import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground text-sm max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href={ROUTES.home} className={buttonVariants()}>
        Go home
      </Link>
    </div>
  );
}
