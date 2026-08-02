import "server-only";
import { getEmailConfig } from "@/lib/email/config";
import { getMailgunClient } from "@/lib/email/client";
import { verificationEmail } from "@/lib/email/templates/verification-code";
import { sendTestEmail } from "@/lib/email/test-delivery";
import type { EmailMessage } from "@/lib/email/types";

export async function sendVerificationCode(to: string, code: string) {
  const config = getEmailConfig();
  const template = verificationEmail({ code, ttlMinutes: config.ttlMinutes, replyTo: config.replyTo });
  const message: EmailMessage = { to, from: `${config.fromName} <${config.fromAddress}>`, replyTo: config.replyTo, ...template };
  if (config.mode === "test") { await sendTestEmail(message); return; }
  const client = getMailgunClient();
  if (!client) throw new Error("Email client is not configured");
  await client.messages.create(config.domain, { from: message.from, to: [message.to], "h:Reply-To": message.replyTo, subject: message.subject, text: message.text, html: message.html, "o:tracking": "no", "o:tracking-clicks": "no", "o:tracking-opens": "no" });
}
