import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage() {
  const session = await requireView("people");
  return <AdminShell {...(await loadAdminData("people"))} view="people" session={session} />;
}
