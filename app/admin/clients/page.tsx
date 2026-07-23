import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const session = await requireView("clients");
  return <AdminShell {...(await loadAdminData("clients"))} view="clients" session={session} />;
}
