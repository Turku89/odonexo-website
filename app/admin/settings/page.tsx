import AdminShell from "@/components/admin/AdminShell";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell>
      <ContactSettingsForm settings={settings} />
    </AdminShell>
  );
}
