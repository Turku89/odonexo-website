import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { countNewOrders, readAllOrders } from "@/lib/orders-store";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("count") === "new") {
    const count = await countNewOrders();
    return NextResponse.json({ count });
  }

  const orders = await readAllOrders();
  return NextResponse.json(orders);
}
