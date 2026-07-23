import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  const session = await requireView("integrations");
  return <AdminShell {...(await loadAdminData("integrations"))} view="integrations" session={session} />;
}
