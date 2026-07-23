import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLeadOSPage() {
  const session = await requireView("leados");
  // LeadOSView fetches its own data client-side, so no server slices are needed.
  return <AdminShell {...(await loadAdminData("leados"))} view="leados" session={session} />;
}
