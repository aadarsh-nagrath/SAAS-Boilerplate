import { appConfig } from "@/config";

function wrap(title: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f6f7f9; margin:0; padding:24px;">
    <div style="max-width:480px; margin:0 auto; background:#fff; border-radius:12px; padding:32px;">
      <h1 style="font-size:20px; margin:0 0 16px;">${appConfig.name}</h1>
      <h2 style="font-size:16px; color:#111; margin:0 0 12px;">${title}</h2>
      ${body}
      <p style="color:#9ca3af; font-size:12px; margin-top:24px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>`;
}

export function verificationCodeEmail(code: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Your ${appConfig.name} verification code`,
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: wrap(
      "Verify your email",
      `<p style="color:#374151;">Enter this code to continue. It expires in 10 minutes.</p>
       <p style="font-size:32px; font-weight:700; letter-spacing:8px; margin:16px 0;">${code}</p>`
    ),
  };
}

export function passwordResetEmail(url: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Reset your ${appConfig.name} password`,
    text: `Reset your password using this link (expires in 30 minutes): ${url}`,
    html: wrap(
      "Reset your password",
      `<p style="color:#374151;">Click the button below to set a new password. This link expires in 30 minutes.</p>
       <p style="margin:16px 0;">
         <a href="${url}" style="display:inline-block; background:#111; color:#fff; text-decoration:none; padding:10px 20px; border-radius:8px;">Reset password</a>
       </p>
       <p style="color:#6b7280; font-size:12px; word-break:break-all;">${url}</p>`
    ),
  };
}
