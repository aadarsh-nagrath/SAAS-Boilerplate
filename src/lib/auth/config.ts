import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/config";
import { mongoAdapter } from "@/lib/db";

const providers: NextAuthConfig["providers"] = [];

if (authConfig.providers.google) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (authConfig.providers.github) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

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

        // Imported lazily so the adapter/Mongoose models aren't pulled into
        // edge/middleware bundles that only need the base auth config.
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
  adapter: mongoAdapter,
  providers,
  session: authConfig.session,
  pages: authConfig.pages,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};
