import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getLeadByKey } from "@/lib/leados/db";
import LeadProfileClient from "./LeadProfileClient";

export const dynamic = "force-dynamic";

// Module 11 — dedicated lead profile page.
export default async function LeadProfilePage({
  params,
}: {
  params: Promise<{ leadKey: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { leadKey } = await params;
  const lead = await getLeadByKey(decodeURIComponent(leadKey));
  if (!lead) notFound();
  // Strip the ObjectId / any BSON so the payload is plain JSON for the client.
  const serialized = JSON.parse(
    JSON.stringify({ ...lead, _id: String((lead as { _id?: unknown })._id ?? "") })
  );
  return (
    <div className="min-h-screen bg-navy-950">
      <main className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8">
        <LeadProfileClient lead={serialized} />
      </main>
    </div>
  );
}
