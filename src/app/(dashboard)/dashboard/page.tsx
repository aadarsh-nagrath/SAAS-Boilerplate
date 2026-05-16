import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ROUTES } from "@/constants";
import { PlanBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect(ROUTES.login);

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  const plan = user?.plan ?? "free";
  const planStatus = user?.planStatus ?? "inactive";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <PlanBadge plan={plan} status={planStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{session.user.name}</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium capitalize">{plan}</p>
            {plan === "free" && (
              <Link href={ROUTES.pricing} className={cn(buttonVariants({ size: "sm" }))}>
                Upgrade to Pro
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
