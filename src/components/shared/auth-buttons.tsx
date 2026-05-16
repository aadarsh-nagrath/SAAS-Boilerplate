import { signInWithGoogle, signInWithGitHub } from "@/actions";
import { authConfig } from "@/config";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      {authConfig.providers.google && (
        <form action={signInWithGoogle}>
          <Button variant="outline" className="w-full" type="submit">
            Continue with Google
          </Button>
        </form>
      )}
      {authConfig.providers.github && (
        <form action={signInWithGitHub}>
          <Button variant="outline" className="w-full" type="submit">
            Continue with GitHub
          </Button>
        </form>
      )}
      {!authConfig.providers.google && !authConfig.providers.github && (
        <p className="text-sm text-muted-foreground text-center">
          No auth providers enabled. Set AUTH_GOOGLE_ENABLED or AUTH_GITHUB_ENABLED in .env.
        </p>
      )}
    </div>
  );
}
