import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";
import { Navbar, PastDueBanner } from "@/components/shared";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect(ROUTES.login);

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  const isPastDue = user?.planStatus === "past_due";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {isPastDue && <PastDueBanner />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
