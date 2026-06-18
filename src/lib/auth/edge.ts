import NextAuth from "next-auth";
import { baseAuthConfig } from "./auth.config";

// Edge-safe NextAuth instance built from the base config only (no adapter,
// no Credentials provider, no Mongoose). Used by the proxy so route protection
// runs without pulling the database layer into the proxy bundle.
export const { auth } = NextAuth(baseAuthConfig);
