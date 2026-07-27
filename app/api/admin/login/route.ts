import { NextResponse } from "next/server";
import {
  verifyPassword,
  getSessionCookieOptions,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: "Geçersiz şifre" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const cookie = getSessionCookieOptions();
  response.cookies.set(cookie);
  return response;
}
