import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const session = await requireView("content");
  return <AdminShell {...(await loadAdminData("content"))} view="content" session={session} />;
}
