import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell {...(await loadAdminData("team"))} view="team" />;
}
