import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getSiteSettings } from "@/lib/site-settings";
import { toPublicSiteSettings } from "@/lib/types/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();
  const settings = await getSiteSettings();
  return NextResponse.json(toPublicSiteSettings(settings), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
