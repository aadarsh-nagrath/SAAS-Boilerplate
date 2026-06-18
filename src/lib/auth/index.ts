import NextAuth from "next-auth";
import { authOptions } from "./config";

// Full config (adapter + Credentials). Use this in Server Components, Route
// Handlers, and Server Actions.
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
