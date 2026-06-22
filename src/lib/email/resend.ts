import "server-only";

// Resend transport.
//
// Active when RESEND_ENABLE=true. This calls the Resend REST API directly with
// fetch, so it needs no extra npm dependency — only RESEND_API_KEY and a
// verified From address (RESEND_FROM or MAIL_FROM).
//
// Resend API reference: https://resend.com/docs/api-reference/emails/send-email

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendWithResend(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY must be set to send email (required when RESEND_ENABLE=true)."
    );
  }

  // Resend requires the From address to be on a domain verified in your
  // Resend account. Falls back to MAIL_FROM so the same value works for both
  // transports.
  const from = process.env.RESEND_FROM || process.env.MAIL_FROM;
  if (!from) {
    throw new Error(
      "RESEND_FROM (or MAIL_FROM) must be set to a verified Resend sender address."
    );
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.text ? { text: params.text } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Resend API request failed (${res.status} ${res.statusText})${
        detail ? `: ${detail}` : ""
      }`
    );
  }
}
