import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";
import { toPublicSiteSettings } from "@/lib/types/site-settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(toPublicSiteSettings(settings));
}
