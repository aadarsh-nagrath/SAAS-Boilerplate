export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "My SaaS App",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  description: "Your SaaS description here",
} as const;
