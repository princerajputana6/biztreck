import { requireView } from "@/lib/auth";
import NewJobClient from "./Client";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  await requireView("content");
  return <NewJobClient />;
}
