import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  const plan = user?.plan ?? "free";
  const planStatus = user?.planStatus ?? "inactive";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Badge variant={planStatus === "active" ? "default" : "secondary"}>
          {plan === "free" ? "Free" : `${plan} · ${planStatus}`}
        </Badge>
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
          <CardContent>
            <p className="font-medium capitalize">{plan}</p>
            {plan === "free" && (
              <a href="/pricing" className="text-sm text-primary underline">
                Upgrade to Pro →
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
