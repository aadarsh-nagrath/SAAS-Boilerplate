import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";
import { Navbar, PastDueBanner } from "@/components/shared";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect(ROUTES.login);

  // planStatus is cached on the session token (see jwt callback), so no DB hit.
  const isPastDue = session.user.planStatus === "past_due";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {isPastDue && <PastDueBanner />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
