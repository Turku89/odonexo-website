import AdminShell from "@/components/admin/AdminShell";
import OrderList from "@/components/admin/OrderList";
import { AdminPageHeading } from "@/components/admin/AdminPageHeading";

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <AdminPageHeading titleKey="ordersTitle" />
      </div>
      <OrderList />
    </AdminShell>
  );
}
