import { auth } from "@/lib/auth";
import { signOutUser } from "@/actions";
import { appConfig } from "@/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";

export async function Navbar() {
  const session = await auth();

  return (
    <>
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <span className="font-semibold">{appConfig.name}</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user && (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <form action={signOutUser}>
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          )}
        </div>
      </header>
      <Separator />
    </>
  );
}
