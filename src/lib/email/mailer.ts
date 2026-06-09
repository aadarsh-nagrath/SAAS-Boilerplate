import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER and GMAIL_APP_PASSWORD must be set to send email " +
        "(required when AUTH_CREDENTIALS_ENABLED=true)."
    );
  }

  // Gmail SMTP. `pass` is a Google App Password, not the account password.
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const from = process.env.MAIL_FROM || process.env.GMAIL_USER!;
  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
