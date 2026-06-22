export const emailConfig = {
  // Email transport selection.
  // When RESEND_ENABLE=true, transactional email is sent via the Resend API.
  // Otherwise it falls back to Gmail SMTP (nodemailer).
  resend: {
    enabled: process.env.RESEND_ENABLE === "true",
  },
} as const;
