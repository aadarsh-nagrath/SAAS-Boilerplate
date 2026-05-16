import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const googleEnabled = process.env.AUTH_GOOGLE_ENABLED === "true";
const githubEnabled = process.env.AUTH_GITHUB_ENABLED === "true";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{process.env.NEXT_PUBLIC_APP_NAME}</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {googleEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <Button variant="outline" className="w-full" type="submit">
                Continue with Google
              </Button>
            </form>
          )}
          {githubEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <Button variant="outline" className="w-full" type="submit">
                Continue with GitHub
              </Button>
            </form>
          )}
          {!googleEnabled && !githubEnabled && (
            <p className="text-sm text-muted-foreground text-center">
              No auth providers enabled. Set AUTH_GOOGLE_ENABLED or AUTH_GITHUB_ENABLED in your .env.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
