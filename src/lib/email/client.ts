import "server-only";
import Mailgun from "mailgun.js";
import formData from "form-data";
import { getEmailConfig } from "@/lib/email/config";

export function getMailgunClient() {
  const config = getEmailConfig();
  if (config.mode !== "mailgun") return null;
  const mailgun = new Mailgun(formData);
  return mailgun.client({ username: "api", key: config.apiKey, url: config.apiUrl });
}
