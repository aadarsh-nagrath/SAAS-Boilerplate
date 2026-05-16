"use server";

import { signIn, signOut } from "@/lib/auth";
import { ROUTES } from "@/constants";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: ROUTES.dashboard });
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: ROUTES.dashboard });
}

export async function signOutUser() {
  await signOut({ redirectTo: ROUTES.home });
}
