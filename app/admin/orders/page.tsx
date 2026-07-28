import AdminShell from "@/components/admin/AdminShell";
import OrderList from "@/components/admin/OrderList";

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gelen Siparişler</h1>
        <p className="mt-1 text-sm text-slate-500">
          Site üzerinden gelen siparişleri buradan takip edin. Yeni siparişlerde
          panel bildirimi ve Telegram mesajı da gider.
        </p>
      </div>
      <OrderList />
    </AdminShell>
  );
}
