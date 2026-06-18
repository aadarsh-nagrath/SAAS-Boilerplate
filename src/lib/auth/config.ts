import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/config";
import { mongoAdapter } from "@/lib/db";
import { baseAuthConfig } from "./auth.config";

// ── Full (Node-runtime) config ────────────────────────────────────────────────
// Extends the edge-safe base with the MongoDB adapter and the Credentials
// provider (which needs bcrypt + Mongoose). Used only by the API route handler.

const providers = [...baseAuthConfig.providers];

if (authConfig.providers.credentials) {
  const CredentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  providers.push(
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const { connectDB } = await import("@/lib/db");
        const { User } = await import("@/models/User");
        await connectDB();

        // passwordHash is `select:false` on the schema — request it explicitly.
        const user = await User.findOne({ email: email.toLowerCase() })
          .select("+passwordHash")
          .lean<{
            _id: { toString(): string };
            email: string;
            name?: string;
            image?: string;
            emailVerified?: Date;
            passwordHash?: string;
          }>();

        if (!user?.passwordHash || !user.emailVerified) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        };
      },
    })
  );
}

export const authOptions: NextAuthConfig = {
  ...baseAuthConfig,
  adapter: mongoAdapter,
  providers,
};
