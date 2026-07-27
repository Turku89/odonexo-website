import { NextResponse } from "next/server";
import { readPublishedProducts } from "@/lib/products-store";
import { readSiteSettings } from "@/lib/site-settings-store";
import { saveOrder } from "@/lib/orders-store";
import { sendTelegramOrderNotification } from "@/lib/telegram-notify";
import type { CheckoutInput, Order, OrderItem } from "@/lib/types/order";

export async function POST(request: Request) {
  let body: CheckoutInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  if (!body.customerName?.trim() || !body.customerPhone?.trim() || !body.customerAddress?.trim()) {
    return NextResponse.json(
      { error: "Ad, telefon ve adres zorunludur" },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
  }

  const [products, settings] = await Promise.all([
    readPublishedProducts(),
    readSiteSettings(),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const orderItems: OrderItem[] = [];

  for (const item of body.items) {
    const product = productMap.get(item.productId);
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

    if (!product || !product.inStock) {
      return NextResponse.json(
        { error: `"${item.productId}" ürünü bulunamadı veya stokta yok` },
        { status: 400 }
      );
    }

    const unitPriceEur = product.price;
    orderItems.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity,
      unitPriceEur,
      lineTotalEur: unitPriceEur * quantity,
    });
  }

  const subtotalEur = orderItems.reduce((sum, i) => sum + i.lineTotalEur, 0);
  const shippingEur =
    subtotalEur >= settings.freeShippingMinEur ? 0 : settings.shippingCostEur;
  const totalEur = subtotalEur + shippingEur;

  const order: Order = {
    id: `ORD-${Date.now()}`,
    customerName: body.customerName.trim(),
    customerPhone: body.customerPhone.trim(),
    customerEmail: body.customerEmail?.trim() || "",
    customerAddress: body.customerAddress.trim(),
    notes: body.notes?.trim() || "",
    items: orderItems,
    subtotalEur,
    shippingEur,
    totalEur,
    currency: "EUR",
    createdAt: new Date().toISOString(),
  };

  await saveOrder(order);

  try {
    await sendTelegramOrderNotification(order, settings);
  } catch {
    /* sipariş kaydedildi, bildirim başarısız olsa da devam */
  }

  return NextResponse.json({ success: true, orderId: order.id });
}
