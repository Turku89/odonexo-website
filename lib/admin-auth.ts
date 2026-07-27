import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "odonexo_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

function getSecret(): string {
  return process.env.ADMIN_SECRET || "odonexo-admin-secret-change-me";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "odonexo2024";
}

export function createSessionToken(): string {
  return crypto.createHmac("sha256", getSecret()).update("admin-session").digest("hex");
}

export function verifyPassword(password: string): boolean {
  return password === getAdminPassword();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token === createSessionToken();
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function getLogoutCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
