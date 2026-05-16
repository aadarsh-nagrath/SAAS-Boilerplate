export const paymentsConfig = {
  creem: {
    apiBase: "https://api.creem.io/v1",
    products: {
      monthly: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_MONTHLY ?? "",
      yearly: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_YEARLY ?? "",
    },
  },
} as const;
