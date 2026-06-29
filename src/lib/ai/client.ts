import "server-only";
import OpenAI from "openai";

let client: OpenAI | null | undefined;

export function getAiClient(): OpenAI | null {
  if (client !== undefined) return client;
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  client = apiKey ? new OpenAI({ apiKey }) : null;
  return client;
}

export const AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
