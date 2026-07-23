import { requireView } from "@/lib/auth";
import { loadAdminData } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminAssistantPage() {
  const session = await requireView("assistant");
  return <AdminShell {...(await loadAdminData("assistant"))} view="assistant" session={session} />;
}
