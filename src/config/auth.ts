export const authConfig = {
  providers: {
    google: process.env.AUTH_GOOGLE_ENABLED === "true",
    github: process.env.AUTH_GITHUB_ENABLED === "true",
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
} as const;
