import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const session = await requireView("team");
  return <AdminShell {...(await loadAdminData("team"))} view="team" session={session} />;
}
