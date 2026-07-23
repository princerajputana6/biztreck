import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const session = await requireView("submissions");
  return <AdminShell {...(await loadAdminData("submissions"))} view="submissions" session={session} />;
}
