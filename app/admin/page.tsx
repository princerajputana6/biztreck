import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  const stats = await loadAdminData("dashboard");
  return <AdminShell {...stats} view="dashboard" />;
}
