import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrderById, updateOrder } from "@/lib/orders-store";
import { readSiteSettings } from "@/lib/site-settings-store";
import { sendOrderApprovalEmail } from "@/lib/order-email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  if (!order.customerEmail?.trim()) {
    return NextResponse.json(
      { error: "Müşteri e-postası yok; onay e-postası gönderilemez" },
      { status: 400 }
    );
  }

  const settings = await readSiteSettings();
  const emailResult = await sendOrderApprovalEmail(order, settings);

  if (!emailResult.ok) {
    return NextResponse.json({ error: emailResult.error }, { status: 400 });
  }

  const updated = await updateOrder(id, {
    status: "approved",
    emailSentAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    order: updated,
  });
}
