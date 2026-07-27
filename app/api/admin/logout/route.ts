import { NextResponse } from "next/server";
import { getLogoutCookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookie = getLogoutCookieOptions();
  response.cookies.set(cookie);
  return response;
}
