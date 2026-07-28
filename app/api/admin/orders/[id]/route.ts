import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrderById, updateOrder } from "@/lib/orders-store";
import type { OrderItem, OrderStatus } from "@/lib/types/order";
import { normalizeOrderStatus } from "@/lib/order-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const patch: {
    status?: OrderStatus;
    items?: OrderItem[];
    adminNote?: string;
  } = {};

  if (body.status !== undefined) {
    const status = normalizeOrderStatus(body.status);
    if (!["new", "seen", "approved"].includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
    }
    patch.status = status;
  }

  if (Array.isArray(body.items)) {
    patch.items = body.items;
  }

  if (body.adminNote !== undefined) {
    patch.adminNote = String(body.adminNote);
  }

  const updated = await updateOrder(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
