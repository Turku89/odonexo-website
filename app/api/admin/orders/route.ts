import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  countNewOrders,
  getLatestNewOrderId,
  readAllOrders,
} from "@/lib/orders-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("count") === "new") {
    const [count, latestId] = await Promise.all([
      countNewOrders(),
      getLatestNewOrderId(),
    ]);
    return NextResponse.json(
      { count, latestId },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  const orders = await readAllOrders();
  return NextResponse.json(orders, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
