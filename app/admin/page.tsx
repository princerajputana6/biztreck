import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  // Members without dashboard access are redirected to their first module.
  const session = await requireView("dashboard");
  const stats = await loadAdminData("dashboard");
  return <AdminShell {...stats} view="dashboard" session={session} />;
}
