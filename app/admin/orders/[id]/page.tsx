import AdminShell from "@/components/admin/AdminShell";
import OrderDetail from "@/components/admin/OrderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AdminShell>
      <OrderDetail orderId={id} />
    </AdminShell>
  );
}
