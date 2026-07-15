export const SESSION_COOKIE = "em-study-session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function sessionCookieOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
