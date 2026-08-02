import "server-only";
import { cookies } from "next/headers";
import { PENDING_REGISTRATION_COOKIE } from "@/lib/auth/email-verification";
import { pendingRegistrationCookieOptions } from "@/lib/auth/session-cookie";

export async function clearPendingCookie() { (await cookies()).set(PENDING_REGISTRATION_COOKIE, "", { ...pendingRegistrationCookieOptions(), maxAge: 0 }); }
