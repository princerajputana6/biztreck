import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminAiPublishingPage() {
  const session = await requireView("ai-publishing");
  return <AdminShell {...(await loadAdminData("ai-publishing"))} view="ai-publishing" session={session} />;
}
