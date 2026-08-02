import "server-only";
import type { EmailMessage } from "@/lib/email/types";

let lastDelivery: EmailMessage | null = null;
export async function sendTestEmail(message: EmailMessage) { lastDelivery = message; }
export function getLastTestEmail() { return lastDelivery; }
export function clearLastTestEmail() { lastDelivery = null; }
