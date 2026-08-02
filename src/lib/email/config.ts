import "server-only";
import { z } from "zod";

const allowedMailgunUrls = ["https://api.mailgun.net", "https://api.eu.mailgun.net"] as const;
const emailSchema = z.string().trim().email();

export function getEmailConfig() {
  const production = process.env.NODE_ENV === "production";
  const mode = process.env.EMAIL_DELIVERY_MODE?.trim() || (!production ? "test" : "mailgun");
  const apiUrl = process.env.MAILGUN_API_URL?.trim() || "https://api.mailgun.net";
  const domain = process.env.MAILGUN_DOMAIN?.trim() || "auth.tairoh.com";
  const fromAddress = process.env.EMAIL_FROM_ADDRESS?.trim() || "no-reply@auth.tairoh.com";
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "EM PASS";
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || "support@tairoh.com";
  const apiKey = process.env.MAILGUN_API_KEY?.trim() || "";
  const verificationSecret = process.env.EMAIL_VERIFICATION_SECRET?.trim() || "development-only-email-verification-secret-32";
  const ttlMinutes = integerEnv("EMAIL_CODE_TTL_MINUTES", 10);
  const cooldownSeconds = integerEnv("EMAIL_RESEND_COOLDOWN_SECONDS", 60);
  const maxAttempts = integerEnv("EMAIL_MAX_ATTEMPTS", 5);
  const maxSendsPerHour = integerEnv("EMAIL_MAX_SENDS_PER_HOUR", 5);
  const pendingTtlHours = integerEnv("PENDING_REGISTRATION_TTL_HOURS", 24);
  if (!emailSchema.safeParse(fromAddress).success || !emailSchema.safeParse(replyTo).success) throw new Error("EMAIL_FROM_ADDRESS and EMAIL_REPLY_TO must be valid email addresses");
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) throw new Error("MAILGUN_DOMAIN must be a valid domain");
  if (!allowedMailgunUrls.includes(apiUrl as typeof allowedMailgunUrls[number])) throw new Error("MAILGUN_API_URL is not allowed");
  if (!fromAddress.toLowerCase().endsWith(`@${domain.toLowerCase()}`)) throw new Error("EMAIL_FROM_ADDRESS must belong to MAILGUN_DOMAIN");
  if (verificationSecret.length < 32) throw new Error("EMAIL_VERIFICATION_SECRET must be at least 32 characters");
  if (production && (mode !== "mailgun" || !apiKey)) throw new Error("Production email delivery requires mailgun mode and MAILGUN_API_KEY");
  if (!["mailgun", "test"].includes(mode)) throw new Error("EMAIL_DELIVERY_MODE must be mailgun or test");
  if (ttlMinutes < 1 || ttlMinutes > 60 || cooldownSeconds < 30 || cooldownSeconds > 3600 || maxAttempts < 3 || maxAttempts > 10 || maxSendsPerHour < 1 || maxSendsPerHour > 20 || pendingTtlHours < 1 || pendingTtlHours > 72) throw new Error("Email verification limits are outside the allowed range");
  return { mode, apiUrl, domain, fromAddress, fromName, replyTo, apiKey, verificationSecret, ttlMinutes, cooldownSeconds, maxAttempts, maxSendsPerHour, pendingTtlHours };
}

function integerEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? String(fallback), 10);
  if (!Number.isInteger(value)) throw new Error(`${name} must be an integer`);
  return value;
}
