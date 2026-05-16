export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  pricing: "/pricing",
  api: {
    auth: "/api/auth",
    webhooks: {
      creem: "/api/webhooks/creem",
    },
  },
} as const;

export const PROTECTED_ROUTES = [ROUTES.dashboard];
export const AUTH_ROUTES = [ROUTES.login];
