"use server";

import { randomInt, randomBytes, createHash } from "crypto";
import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { authConfig, appConfig } from "@/config";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { VerificationCode } from "@/models/VerificationCode";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import {
  sendMail,
  verificationCodeEmail,
  passwordResetEmail,
} from "@/lib/email";
import { ROUTES } from "@/constants";

export type ActionResult = { ok: true } | { ok: false; error: string };

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CODE_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 12;

const emailSchema = z.string().email();
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

function ensureEnabled() {
  if (!authConfig.providers.credentials) {
    throw new Error("Credentials auth is disabled (AUTH_CREDENTIALS_ENABLED).");
  }
}

function sixDigitCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/**
 * Step 1 — sign-up: send a 6-digit verification code to the email.
 * Refuses if the email already belongs to a verified account.
 */
export async function requestEmailCode(email: string): Promise<ActionResult> {
  ensureEnabled();

  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, error: "Enter a valid email." };
  const normalized = parsed.data.toLowerCase();

  await connectDB();

  const existing = await User.findOne({ email: normalized })
    .select("+passwordHash")
    .lean<{ emailVerified?: Date; passwordHash?: string }>();
  if (existing?.emailVerified && existing.passwordHash) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const code = sixDigitCode();
  const codeHash = await hash(code, BCRYPT_ROUNDS);

  // One outstanding code per email — replace any previous one.
  await VerificationCode.deleteMany({ email: normalized });
  await VerificationCode.create({
    email: normalized,
    codeHash,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });

  const tpl = verificationCodeEmail(code);
  await sendMail({ to: normalized, ...tpl });

  return { ok: true };
}

/**
 * Step 2 — sign-up: verify the code and set the password, creating /
 * activating the account. On success the user can sign in.
 */
export async function verifyCodeAndSetPassword(input: {
  email: string;
  code: string;
  password: string;
  name?: string;
}): Promise<ActionResult> {
  ensureEnabled();

  const schema = z.object({
    email: emailSchema,
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
    password: passwordSchema,
    name: z.string().trim().min(1).max(120).optional(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const email = parsed.data.email.toLowerCase();

  await connectDB();

  const record = await VerificationCode.findOne({ email });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "Code expired. Request a new one." };
  }
  if (record.attempts >= MAX_CODE_ATTEMPTS) {
    await VerificationCode.deleteMany({ email });
    return { ok: false, error: "Too many attempts. Request a new code." };
  }

  const codeOk = await compare(parsed.data.code, record.codeHash);
  if (!codeOk) {
    record.attempts += 1;
    await record.save();
    return { ok: false, error: "Incorrect code." };
  }

  const passwordHash = await hash(parsed.data.password, BCRYPT_ROUNDS);
  const fallbackName = parsed.data.name ?? email.split("@")[0];

  await User.findOneAndUpdate(
    { email },
    {
      $set: { passwordHash, emailVerified: new Date() },
      $setOnInsert: { email, name: fallbackName },
    },
    { upsert: true, new: true }
  );

  await VerificationCode.deleteMany({ email });

  return { ok: true };
}

/**
 * Sign in an existing credentials user. Returns an error string instead of
 * throwing so the form can render it; redirect is handled by the caller.
 */
export async function signInWithCredentials(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  ensureEnabled();

  const schema = z.object({ email: emailSchema, password: z.string().min(1) });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw err;
  }
}

/**
 * Forgot-password: email a reset link if the account exists. Always returns
 * ok to avoid leaking which emails are registered.
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  ensureEnabled();

  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, error: "Enter a valid email." };
  const normalized = parsed.data.toLowerCase();

  await connectDB();

  const user = await User.findOne({ email: normalized })
    .select("+passwordHash")
    .lean<{ emailVerified?: Date; passwordHash?: string }>();

  // Only send for real credentials accounts, but don't reveal that.
  if (user?.emailVerified && user.passwordHash) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await PasswordResetToken.deleteMany({ email: normalized });
    await PasswordResetToken.create({
      email: normalized,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    });

    const url = `${appConfig.url}${ROUTES.login}/reset?token=${token}`;
    const tpl = passwordResetEmail(url);
    await sendMail({ to: normalized, ...tpl });
  }

  return { ok: true };
}

/** Complete a password reset using the token from the emailed link. */
export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<ActionResult> {
  ensureEnabled();

  const schema = z.object({ token: z.string().min(1), password: passwordSchema });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

  await connectDB();

  const record = await PasswordResetToken.findOne({ tokenHash });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hash(parsed.data.password, BCRYPT_ROUNDS);
  await User.findOneAndUpdate(
    { email: record.email },
    { $set: { passwordHash } }
  );
  await PasswordResetToken.deleteMany({ email: record.email });

  return { ok: true };
}
