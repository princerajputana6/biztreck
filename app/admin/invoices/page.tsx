import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const session = await requireView("invoices");
  return <AdminShell {...(await loadAdminData("invoices"))} view="invoices" session={session} />;
}
